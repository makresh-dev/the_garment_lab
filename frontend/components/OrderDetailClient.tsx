"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrder } from "@/lib/api";

type OrderItem = {
    id: number;
    product_name: string;
    size: string;
    color: string;
    price: string;
    quantity: number;
    total: string;
};

type Order = {
    id: number;
    status: string;
    payment_method: "cod" | "upi";
    payment_status: string;
    subtotal: string;
    discount: string;
    shipping_cost: string;
    total: string;
    shipping_name: string;
    shipping_phone: string;
    shipping_address: string;
    shipping_city: string;
    shipping_state: string;
    shipping_postal_code: string;
    items: OrderItem[];
    created_at: string;
};

function OrderTimeline({ status }: { status: string }) {
    const steps = [
        { key: "confirmed", label: "Confirmed" },
        { key: "processing", label: "Processing" },
        { key: "shipped", label: "In Transit" },
        { key: "delivered", label: "Delivered" },
    ];

    const statusOrder = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
    ];

    const currentIndex = statusOrder.indexOf(status);

    return (
        <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#121215] sm:p-8">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800/60">
                <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    FULFILLMENT TRACKING // 01
                </span>
                <span className="font-mono text-xs font-semibold uppercase text-zinc-900 dark:text-white">
                    {status}
                </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {steps.map((step, index) => {
                    const stepIndex = statusOrder.indexOf(step.key);
                    const completed = currentIndex >= stepIndex;
                    const isCurrent = currentIndex === stepIndex;

                    return (
                        <div key={step.key} className="relative flex flex-col items-center text-center">
                            {/* Step Indicator Node */}
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border font-mono text-xs font-bold transition-all ${
                                    completed
                                        ? "border-zinc-950 bg-zinc-950 text-white shadow-md dark:border-white dark:bg-white dark:text-zinc-950"
                                        : "border-zinc-200 bg-zinc-50 text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-600"
                                }`}
                            >
                                {completed ? "✓" : `0${index + 1}`}
                            </div>

                            <p
                                className={`mt-3 font-mono text-xs uppercase tracking-wider ${
                                    completed
                                        ? "font-bold text-zinc-900 dark:text-white"
                                        : "text-zinc-400 dark:text-zinc-600"
                                }`}
                            >
                                {step.label}
                            </p>

                            {isCurrent && (
                                <span className="mt-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                    ACTIVE STAGE
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default function OrderDetailClient({ orderId }: { orderId: number }) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrder() {
            try {
                const data = await getOrder(orderId);
                setOrder(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to retrieve order specimen"
                );
            } finally {
                setLoading(false);
            }
        }

        loadOrder();
    }, [orderId]);

    if (loading) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20">
                <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
                    <span className="h-2 w-2 animate-ping rounded-full bg-zinc-950 dark:bg-white" />
                    DECODING SPECIMEN LEDGER #{orderId}...
                </div>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                    <span className="font-bold">NOTICE //</span> {error || "Order record not found"}
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
            {/* Back link */}
            <Link
                href="/orders"
                className="group inline-flex items-center gap-2 font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-white"
            >
                <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
                RETURN TO CLIENT PORTAL
            </Link>

            {/* Header */}
            <div className="mt-6 flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80 sm:flex-row sm:items-end">
                <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        ARCHIVE RECORD
                    </span>
                    <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                        Order #{order.id}
                    </h1>
                </div>

                <div className="flex flex-wrap gap-2 font-mono text-xs font-semibold uppercase">
                    <span className="rounded-full border border-zinc-200/80 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                        STATUS: {order.status}
                    </span>
                    <span className="rounded-full border border-zinc-200/80 bg-zinc-50 px-3 py-1 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">
                        SETTLEMENT: {order.payment_method === "cod" ? "COD" : "UPI"} ({order.payment_status})
                    </span>
                </div>
            </div>

            <div className="mt-8 space-y-8">
                {/* Cancelled Alert or Timeline */}
                {order.status === "cancelled" ? (
                    <section className="rounded-3xl border border-rose-200 bg-rose-50/80 p-8 dark:border-rose-900/40 dark:bg-rose-950/30">
                        <h2 className="font-mono text-sm font-bold uppercase text-rose-800 dark:text-rose-400">
                            [ ORDER VOIDED // CANCELLED ]
                        </h2>
                        <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">
                            This specimen reservation has been cancelled. If payment was completed, escrow will be reversed.
                        </p>
                    </section>
                ) : (
                    <OrderTimeline status={order.status} />
                )}

                {/* Pending UPI Payment Banner */}
                {order.payment_method === "upi" && order.payment_status === "pending" && (
                    <section className="rounded-3xl border border-amber-200 bg-amber-50/80 p-6 dark:border-amber-900/40 dark:bg-amber-950/30 sm:p-8">
                        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                            <div>
                                <h2 className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                                    ACTION REQUIRED // UPI SETTLEMENT PENDING
                                </h2>
                                <p className="mt-1.5 text-xs text-amber-800 dark:text-amber-400">
                                    Your order is reserved. Please complete the UPI transaction and submit for administrative review.
                                </p>
                            </div>
                            <Link
                                href={`/orders/${order.id}/payment`}
                                className="inline-flex shrink-0 items-center justify-center rounded-full bg-amber-950 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-amber-900 dark:bg-amber-300 dark:text-amber-950 dark:hover:bg-amber-200"
                            >
                                Open UPI Terminal →
                            </Link>
                        </div>
                    </section>
                )}

                {/* Order Items Specification */}
                <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#121215] sm:p-8">
                    <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        RESERVED GARMENTS
                    </span>

                    <div className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                        {order.items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between py-4 text-xs"
                            >
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">
                                        {item.product_name}
                                    </p>
                                    <p className="mt-1 font-mono text-[11px] text-zinc-400">
                                        SIZE: {item.size} {item.color ? `· COLOR: ${item.color}` : ""} · QTY: {item.quantity}
                                    </p>
                                </div>
                                <span className="font-mono text-sm font-bold text-zinc-900 dark:text-white">
                                    ₹{item.total}
                                </span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Delivery & Settlement Recap */}
                <section className="grid gap-6 md:grid-cols-2">
                    {/* Destination Address */}
                    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#121215] sm:p-8">
                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            DELIVERY DESTINATION
                        </span>

                        <div className="mt-4 space-y-1.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                            <p className="font-bold text-zinc-900 dark:text-white">
                                {order.shipping_name}
                            </p>
                            <p>{order.shipping_phone}</p>
                            <p className="pt-2 text-zinc-700 dark:text-zinc-300">
                                {order.shipping_address}
                            </p>
                            <p>
                                {order.shipping_city}, {order.shipping_state} — {order.shipping_postal_code}
                            </p>
                        </div>
                    </div>

                    {/* Financial Ledger */}
                    <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#121215] sm:p-8">
                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            FINANCIAL LEDGER
                        </span>

                        <div className="mt-4 space-y-3 font-mono text-xs">
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                <span>Discount</span>
                                <span>-₹{order.discount}</span>
                            </div>
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                                <span>Logistics</span>
                                <span className="text-emerald-600 dark:text-emerald-400">₹{order.shipping_cost}</span>
                            </div>
                            <div className="border-t border-zinc-200/80 pt-3 dark:border-zinc-800/80">
                                <div className="flex items-baseline justify-between text-sm font-bold text-zinc-950 dark:text-white">
                                    <span>Total Settlement</span>
                                    <span className="text-base">₹{order.total}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}