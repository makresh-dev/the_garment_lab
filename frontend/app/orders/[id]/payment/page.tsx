"use client";

import Link from "next/link";
import QRCode from "qrcode";
import { useEffect, useMemo, useState } from "react";

import { getOrder } from "@/lib/api";

type Order = {
    id: number;
    total: string;
    status: string;
    payment_method: "cod" | "upi";
    payment_status: string;
};

const QR_DURATION = 30;

export default function UpiPaymentPage({
    params,
}: {
    params: Promise<{
        id: string;
    }>;
}) {
    const [order, setOrder] =
        useState<Order | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [secondsLeft, setSecondsLeft] =
        useState(QR_DURATION);

    const [qrDataUrl, setQrDataUrl] =
        useState("");

    const [qrVisible, setQrVisible] =
        useState(true);

    const [paymentSubmitted, setPaymentSubmitted] =
        useState(false);

    const [generating, setGenerating] =
        useState(false);

    const upiId =
        process.env.NEXT_PUBLIC_UPI_ID ||
        "myntramvp@upi";

    const upiName =
        process.env.NEXT_PUBLIC_UPI_NAME ||
        "Myntra MVP";


    async function loadOrder() {
        try {
            const { id } =
                await params;

            const orderData =
                await getOrder(
                    Number(id)
                );

            if (
                orderData.payment_method !==
                "upi"
            ) {
                throw new Error(
                    "This is not a UPI order."
                );
            }

            setOrder(orderData);

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load order"
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        loadOrder();
    }, []);


    const upiUrl = useMemo(() => {

        if (!order) {
            return "";
        }

        return (
            `upi://pay?` +
            `pa=${encodeURIComponent(upiId)}` +
            `&pn=${encodeURIComponent(upiName)}` +
            `&am=${encodeURIComponent(order.total)}` +
            `&cu=INR` +
            `&tn=${encodeURIComponent(
                `Order #${order.id}`
            )}`
        );

    }, [
        order,
        upiId,
        upiName,
    ]);


    async function generateQr() {

        if (!upiUrl) {
            return;
        }

        try {

            setGenerating(true);

            const dataUrl =
                await QRCode.toDataURL(
                    upiUrl,
                    {
                        width: 280,
                        margin: 2,
                    }
                );

            setQrDataUrl(dataUrl);
            setSecondsLeft(
                QR_DURATION
            );
            setQrVisible(true);

        } catch {

            setError(
                "Unable to generate payment QR code."
            );

        } finally {

            setGenerating(false);

        }
    }


    useEffect(() => {

        if (!upiUrl) {
            return;
        }

        generateQr();

    }, [upiUrl]);


    useEffect(() => {

        if (
            !qrVisible ||
            secondsLeft <= 0
        ) {
            return;
        }

        const timer =
            window.setInterval(() => {

                setSecondsLeft(
                    (current) => {

                        if (current <= 1) {

                            window.clearInterval(
                                timer
                            );

                            setQrVisible(
                                false
                            );

                            return 0;
                        }

                        return current - 1;
                    }
                );

            }, 1000);

        return () => {
            window.clearInterval(
                timer
            );
        };

    }, [
        qrVisible,
        secondsLeft,
    ]);


    function handlePaymentCompleted() {

        if (!order) {
            return;
        }

        setPaymentSubmitted(true);

        window.location.href =
            `/orders/${order.id}/waiting`;
    }


    if (loading) {

        return (
            <main className="mx-auto max-w-2xl p-6">
                Loading payment...
            </main>
        );

    }


    if (error || !order) {

        return (
            <main className="mx-auto max-w-2xl p-6">
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
                    {error ||
                        "Order not found."}
                </div>
            </main>
        );

    }


    return (
        <main className="mx-auto max-w-2xl px-6 py-10">

            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#121215]">

                {/* Header */}

                <div className="border-b border-zinc-200 p-6 dark:border-zinc-800">

                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                        PAYMENT // UPI
                    </p>

                    <h1 className="mt-2 text-2xl font-black">
                        Complete Payment
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        Order #{order.id}
                    </p>

                </div>


                {/* Amount */}

                <div className="p-6">

                    <div className="rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">

                        <p className="text-xs text-zinc-500">
                            AMOUNT TO PAY
                        </p>

                        <p className="mt-1 font-mono text-3xl font-black">
                            ₹{order.total}
                        </p>

                        <p className="mt-4 text-sm text-zinc-500">
                            UPI ID
                        </p>

                        <p className="mt-1 font-mono font-semibold">
                            {upiId}
                        </p>

                    </div>


                    {/* QR */}

                    <div className="mt-8 flex flex-col items-center">

                        <div className="relative flex h-[300px] w-[300px] items-center justify-center rounded-2xl border bg-white">

                            {qrDataUrl ? (

                                <img
                                    src={qrDataUrl}
                                    alt="UPI payment QR code"
                                    className={`h-[280px] w-[280px] rounded-xl transition-all duration-500 ${qrVisible
                                            ? "blur-0"
                                            : "blur-lg"
                                        }`}
                                />

                            ) : (

                                <p className="text-sm text-zinc-400">
                                    Generating QR...
                                </p>

                            )}

                            {!qrVisible && (

                                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">

                                    <p className="text-sm font-semibold">
                                        QR expired
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Generate a new QR code
                                    </p>

                                </div>

                            )}

                        </div>


                        <div className="mt-4 text-center">

                            {qrVisible ? (

                                <>

                                    <p className="font-mono text-sm font-bold">
                                        QR expires in{" "}
                                        {secondsLeft}s
                                    </p>

                                    <p className="mt-1 text-xs text-zinc-500">
                                        Scan using any supported
                                        UPI app.
                                    </p>

                                </>

                            ) : (

                                <button
                                    type="button"
                                    onClick={
                                        generateQr
                                    }
                                    disabled={
                                        generating
                                    }
                                    className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white disabled:opacity-50"
                                >
                                    {generating
                                        ? "Generating..."
                                        : "Generate New QR"}
                                </button>

                            )}

                        </div>

                    </div>


                    {/* UPI App Button */}

                    {qrVisible && (

                        <a
                            href={upiUrl}
                            className="mt-6 block rounded-2xl bg-black px-6 py-4 text-center font-semibold text-white"
                        >
                            Pay Using UPI App
                        </a>

                    )}


                    {/* Payment completed */}

                    <div className="mt-8 rounded-2xl border p-5">

                        <p className="font-semibold">
                            Already completed payment?
                        </p>

                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            After paying, continue to the
                            payment waiting page. Your payment
                            will remain pending until an admin
                            verifies the transaction.
                        </p>

                        <button
                            type="button"
                            onClick={
                                handlePaymentCompleted
                            }
                            disabled={
                                paymentSubmitted
                            }
                            className="mt-5 w-full rounded-2xl border px-6 py-4 font-semibold disabled:opacity-50"
                        >
                            {paymentSubmitted
                                ? "Opening..."
                                : "I've Completed Payment"}
                        </button>

                    </div>


                    <div className="mt-6 text-center">

                        <Link
                            href={`/orders/${order.id}`}
                            className="text-sm font-semibold underline"
                        >
                            View Order
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}