"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getOrders } from "@/lib/api";

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
    items: OrderItem[];
    created_at: string;
};

export default function OrdersClient() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadOrders() {
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                setError(
                    error instanceof Error
                        ? error.message
                        : "Unable to load orders"
                );
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, []);

    if (loading) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20">
                <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">
                    <span className="h-2 w-2 animate-ping rounded-full bg-zinc-950 dark:bg-white" />
                    RETRIEVING CLIENT ARCHIVES...
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20">
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                    <span className="font-bold">NOTICE //</span> {error}
                </div>
            </main>
        );
    }

    if (orders.length === 0) {
        return (
            <main className="mx-auto max-w-7xl px-6 py-20 md:py-28">
                <div className="mx-auto max-w-md rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600"
                    >
                        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
                    </svg>

                    <h1 className="mt-4 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                        No Order History
                    </h1>

                    <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        You have not placed any garment reservations or specimen orders yet.
                    </p>

                    <div className="mt-6">
                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white dark:bg-white dark:text-zinc-950"
                        >
                            Browse The Archive →
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
            {/* Header */}
            <div className="mb-10 flex items-baseline justify-between border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">
                <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        CLIENT PORTAL
                    </span>
                    <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                        Order Ledger
                    </h1>
                </div>

                <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    {orders.length} {orders.length === 1 ? "RECORD" : "RECORDS"}
                </span>
            </div>

            <div className="space-y-6">
                {orders.map((order) => (
                    <article
                        key={order.id}
                        className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white transition-all hover:border-zinc-300 dark:border-zinc-800/80 dark:bg-[#121215] dark:hover:border-zinc-700"
                    >
                        {/* Order Header */}
                        <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 bg-zinc-50/50 p-6 dark:border-zinc-800/60 dark:bg-zinc-900/30 sm:flex-row sm:items-center">
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs font-bold text-zinc-950 dark:text-white">
                                        ORDER #{order.id}
                                    </span>
                                    <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500">
                                        {new Date(order.created_at).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <span className="font-mono text-base font-bold text-zinc-950 dark:text-white">
                                        ₹{order.total}
                                    </span>
                                    <p className="font-mono text-[10px] uppercase text-zinc-400">
                                        {order.payment_method === "cod" ? "COD Escrow" : "UPI Settlement"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="p-6">
                            <div className="divide-y divide-zinc-100 text-xs dark:divide-zinc-800/60">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between py-3"
                                    >
                                        <div>
                                            <p className="font-semibold text-zinc-900 dark:text-white">
                                                {item.product_name}
                                            </p>
                                            <p className="font-mono text-[11px] text-zinc-400">
                                                SIZE: {item.size} {item.color ? `· COLOR: ${item.color}` : ""} · QTY: {item.quantity}
                                            </p>
                                        </div>
                                        <span className="font-mono font-medium text-zinc-900 dark:text-zinc-100">
                                            ₹{item.total}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Order Footer & Actions */}
                            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-zinc-100 pt-5 dark:border-zinc-800/60 sm:flex-row sm:items-center">
                                <div className="flex flex-wrap gap-2 font-mono text-[10px] font-semibold uppercase">
                                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                        STATUS: {order.status}
                                    </span>
                                    <span className="rounded-full bg-zinc-100 px-3 py-1 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                                        PAYMENT: {order.payment_status}
                                    </span>
                                </div>

                                <Link
                                    href={`/orders/${order.id}`}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-zinc-200/80 bg-white px-5 py-2 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                >
                                    View Specimen Status
                                    <span>→</span>
                                </Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}