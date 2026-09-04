"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getOrder } from "@/lib/api";

type Order = {
    id: number;
    status: string;
    payment_method: "cod" | "upi";
    payment_status: string;
    total: string;
};

export default function PaymentWaitingClient({
    orderId,
}: {
    orderId: number;
}) {

    const [order, setOrder] =
        useState<Order | null>(null);

    const [error, setError] =
        useState("");

    const [checking, setChecking] =
        useState(true);


    async function checkPaymentStatus() {

        try {

            const data =
                await getOrder(orderId);

            setOrder(data);

            /*
             * Admin has confirmed payment.
             *
             * Redirect to tracking.
             */

            if (
                data.payment_status ===
                "paid" &&
                data.status !==
                "cancelled"
            ) {

                window.location.href =
                    `/orders/${orderId}`;

                return;
            }

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to check payment status"
            );

        } finally {

            setChecking(false);

        }
    }


    useEffect(() => {

        checkPaymentStatus();

        const interval =
            window.setInterval(
                checkPaymentStatus,
                3000
            );

        return () => {
            window.clearInterval(
                interval
            );
        };

    }, [orderId]);


    if (error) {

        return (
            <main className="mx-auto max-w-2xl px-6 py-16">

                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">

                    {error}

                </div>

            </main>
        );
    }


    return (
        <main className="mx-auto max-w-2xl px-6 py-16">

            <div className="rounded-3xl border bg-white p-8 text-center dark:border-zinc-800 dark:bg-[#121215]">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-2xl">

                    {checking
                        ? "..."
                        : "⏳"}

                </div>


                <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    PAYMENT VERIFICATION
                </p>


                <h1 className="mt-2 text-3xl font-black">
                    Waiting for Confirmation
                </h1>


                <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-zinc-500">

                    Your payment has been submitted.
                    We are waiting for the administrator
                    to verify the transaction.

                </p>


                <div className="mt-8 rounded-2xl bg-zinc-50 p-5 dark:bg-zinc-900">

                    <p className="text-xs text-zinc-500">
                        ORDER
                    </p>

                    <p className="mt-1 font-mono text-xl font-bold">
                        #{orderId}
                    </p>


                    {order && (

                        <>

                            <div className="mt-4">

                                <p className="text-xs text-zinc-500">
                                    AMOUNT
                                </p>

                                <p className="mt-1 font-mono font-bold">
                                    ₹{order.total}
                                </p>

                            </div>


                            <div className="mt-4">

                                <p className="text-xs text-zinc-500">
                                    PAYMENT STATUS
                                </p>

                                <p className="mt-1 font-mono text-sm font-bold uppercase">
                                    {order.payment_status}
                                </p>

                            </div>

                        </>

                    )}

                </div>


                <div className="mt-8 flex items-center justify-center gap-2 text-xs text-zinc-400">

                    <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-500" />

                    Checking every 3 seconds...

                </div>


                <Link
                    href={`/orders/${orderId}`}
                    className="mt-8 inline-block text-sm font-semibold underline"
                >
                    View Order
                </Link>

            </div>

        </main>
    );
}