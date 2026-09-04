"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
    getCart,
    getGuestCart,
    removeCartItem,
    updateCartItem,
} from "@/lib/api";

import {
    getGuestCart as getStoredGuestCart,
    removeFromGuestCart,
    updateGuestCartItem,
} from "@/lib/guestCart";


type AuthenticatedCartItem = {
    id: number;
    quantity: number;
    total: string;

    variant: {
        id: number;
        size: string;
        color: string;
        stock: number;
        price_override: string | null;

        product: {
            name: string;
            brand: string;
            slug: string;
            price: string;
            discount_price: string | null;
        };
    };
};


type GuestCartItem = {
    id: number;
    variant_id: number;
    quantity: number;
    total: string;

    variant: {
        id: number;
        size: string;
        color: string;
        stock: number;

        product: {
            name: string;
            brand: string;
            slug: string;
            price: string;
            discount_price: string | null;
        };
    };
};


type Cart = {
    id: number | null;
    items: GuestCartItem[];
    total: string;
};


export default function CartClient() {

    const [cart, setCart] =
        useState<Cart | null>(null);

    const [isGuest, setIsGuest] =
        useState(false);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");


    async function loadCart() {

        setLoading(true);
        setError("");

        try {

            const token =
                localStorage.getItem(
                    "access_token"
                );


            /*
             * --------------------------------
             * AUTHENTICATED CART
             * --------------------------------
             */

            if (token) {

                setIsGuest(false);

                const data =
                    await getCart();

                const normalizedCart: Cart = {
                    id: data.id,

                    items: data.items.map(
                        (
                            item: AuthenticatedCartItem
                        ) => ({
                            id: item.id,

                            variant_id:
                                item.variant.id,

                            quantity:
                                item.quantity,

                            total:
                                item.total,

                            variant:
                                item.variant,
                        })
                    ),

                    total: data.total,
                };

                setCart(
                    normalizedCart
                );

                return;
            }


            /*
             * --------------------------------
             * GUEST CART
             * --------------------------------
             */

            setIsGuest(true);

            const storedItems =
                getStoredGuestCart();

            if (
                storedItems.length === 0
            ) {

                setCart({
                    id: null,
                    items: [],
                    total: "0.00",
                });

                return;
            }


            /*
             * Ask Django for the current
             * product/variant information.
             *
             * localStorage contains only:
             *
             * variant_id
             * quantity
             */

            const guestData =
                await getGuestCart(
                    storedItems
                );


            const normalizedItems:
                GuestCartItem[] =
                guestData.items.map(
                    (
                        item: {
                            variant_id: number;
                            quantity: number;
                            product_name: string;
                            brand: string;
                            slug: string;
                            size: string;
                            color: string;
                            price: string;
                            stock: number;
                            total: string;
                        },
                        index: number
                    ) => ({

                        id:
                            index + 1,

                        variant_id:
                            item.variant_id,

                        quantity:
                            item.quantity,

                        total:
                            item.total,

                        variant: {
                            id:
                                item.variant_id,

                            size:
                                item.size,

                            color:
                                item.color,

                            stock:
                                item.stock,

                            product: {
                                name:
                                    item.product_name,

                                brand:
                                    item.brand,

                                slug:
                                    item.slug,

                                price:
                                    item.price,

                                discount_price:
                                    null,
                            },
                        },

                    })
                );


            setCart({
                id: null,
                items: normalizedItems,
                total: guestData.total,
            });

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to load cart"
            );

        } finally {

            setLoading(false);

        }
    }


    useEffect(() => {
        loadCart();
    }, []);


    /*
     * --------------------------------
     * Quantity
     * --------------------------------
     */

    async function handleQuantityChange(
        item: GuestCartItem,
        quantity: number
    ) {

        if (quantity < 1) {
            return;
        }


        /*
         * Guest
         */

        if (isGuest) {

            if (
                quantity >
                item.variant.stock
            ) {

                return;
            }

            updateGuestCartItem(
                item.variant_id,
                quantity
            );

            await loadCart();

            window.dispatchEvent(
                new Event(
                    "cart-updated"
                )
            );

            return;
        }


        /*
         * Authenticated
         */

        try {

            const updatedCart =
                await updateCartItem(
                    item.id,
                    quantity
                );

            const normalizedCart:
                Cart = {
                id: updatedCart.id,

                items:
                    updatedCart.items.map(
                        (
                            serverItem:
                                AuthenticatedCartItem
                        ) => ({
                            id:
                                serverItem.id,

                            variant_id:
                                serverItem.variant.id,

                            quantity:
                                serverItem.quantity,

                            total:
                                serverItem.total,

                            variant:
                                serverItem.variant,
                        })
                    ),

                total:
                    updatedCart.total,
            };

            setCart(
                normalizedCart
            );

            window.dispatchEvent(
                new Event(
                    "cart-updated"
                )
            );

        } catch (error) {

            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to update cart"
            );
        }
    }


    /*
     * --------------------------------
     * Remove item
     * --------------------------------
     */

    async function handleRemove(
        item: GuestCartItem
    ) {

        /*
         * Guest
         */

        if (isGuest) {

            removeFromGuestCart(
                item.variant_id
            );

            await loadCart();

            window.dispatchEvent(
                new Event(
                    "cart-updated"
                )
            );

            return;
        }


        /*
         * Authenticated
         */

        try {

            const updatedCart =
                await removeCartItem(
                    item.id
                );

            const normalizedCart:
                Cart = {
                id: updatedCart.id,

                items:
                    updatedCart.items.map(
                        (
                            serverItem:
                                AuthenticatedCartItem
                        ) => ({
                            id:
                                serverItem.id,

                            variant_id:
                                serverItem.variant.id,

                            quantity:
                                serverItem.quantity,

                            total:
                                serverItem.total,

                            variant:
                                serverItem.variant,
                        })
                    ),

                total:
                    updatedCart.total,
            };

            setCart(
                normalizedCart
            );

            window.dispatchEvent(
                new Event(
                    "cart-updated"
                )
            );

        } catch (error) {

            alert(
                error instanceof Error
                    ? error.message
                    : "Unable to remove item"
            );
        }
    }


    /*
     * --------------------------------
     * Loading
     * --------------------------------
     */

    if (loading) {

        return (
            <main className="mx-auto max-w-7xl px-6 py-20">

                <div className="flex items-center gap-3 font-mono text-xs text-zinc-400">

                    <span className="h-2 w-2 animate-ping rounded-full bg-zinc-950 dark:bg-white" />

                    RETRIEVING ACTIVE SHOPPING BAG...

                </div>

            </main>
        );
    }


    /*
     * --------------------------------
     * Error
     * --------------------------------
     */

    if (error) {

        return (
            <main className="mx-auto max-w-7xl px-6 py-20">

                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">

                    <span className="font-bold">
                        NOTICE //
                    </span>{" "}

                    {error}

                </div>

            </main>
        );
    }


    /*
     * --------------------------------
     * Empty cart
     * --------------------------------
     */

    if (
        !cart ||
        cart.items.length === 0
    ) {

        return (
            <main className="mx-auto max-w-7xl px-6 py-20 md:py-28">

                <div className="mx-auto max-w-md rounded-3xl border border-dashed border-zinc-300/80 bg-white p-10 text-center dark:border-zinc-800 dark:bg-[#121215]/60">

                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600"
                    >
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>

                    <h1 className="mt-4 text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                        Your Bag is Empty
                    </h1>

                    <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                        No garments or archival specimens have been added to your shopping bag yet.
                    </p>

                    <div className="mt-6">

                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                            Explore Garments →
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    const itemCount =
        cart.items.reduce(
            (acc, item) =>
                acc + item.quantity,
            0
        );


    return (
        <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">

            {/* Header */}

            <div className="mb-10 flex items-baseline justify-between border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">

                <div>

                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        {isGuest
                            ? "GUEST BAG"
                            : "CURRENT RESERVATIONS"}
                    </span>

                    <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                        Shopping Bag
                    </h1>

                </div>

                <span className="font-mono text-xs font-semibold text-zinc-500 dark:text-zinc-400">

                    {itemCount}{" "}

                    {itemCount === 1
                        ? "SPECIMEN"
                        : "SPECIMENS"}

                </span>

            </div>


            <div className="grid gap-10 lg:grid-cols-12">

                {/* Cart Items */}

                <div className="space-y-4 lg:col-span-8">

                    {cart.items.map(
                        (item) => (

                            <div
                                key={`${item.variant_id}-${item.id}`}
                                className="flex flex-col justify-between gap-5 rounded-2xl border border-zinc-200/80 bg-white p-5 transition-all dark:border-zinc-800/80 dark:bg-[#121215] sm:flex-row sm:items-center"
                            >

                                <div className="space-y-1">

                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">

                                        {item.variant.product.brand ||
                                            "THE GARMENT LAB"}

                                    </span>


                                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">

                                        <Link
                                            href={`/products/${item.variant.product.slug}`}
                                            className="hover:underline"
                                        >
                                            {
                                                item.variant
                                                    .product
                                                    .name
                                            }
                                        </Link>

                                    </h2>


                                    <div className="flex flex-wrap items-center gap-2 pt-1">

                                        <span className="rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">

                                            SIZE:{" "}
                                            {item.variant.size}

                                        </span>


                                        {item.variant.color && (

                                            <span className="rounded-md border border-zinc-200/80 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300">

                                                COLOR:{" "}
                                                {
                                                    item.variant
                                                        .color
                                                }

                                            </span>

                                        )}

                                    </div>

                                </div>


                                {/* Quantity / Price */}

                                <div className="flex items-center justify-between gap-6 border-t border-zinc-100 pt-3 dark:border-zinc-800/60 sm:border-0 sm:pt-0">

                                    <div className="flex items-center rounded-xl border border-zinc-200/80 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-900">

                                        <button
                                            type="button"
                                            disabled={
                                                item.quantity <= 1
                                            }
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item,
                                                    item.quantity - 1
                                                )
                                            }
                                            className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-950 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-white"
                                            aria-label="Decrease quantity"
                                        >
                                            −
                                        </button>


                                        <span className="w-8 text-center font-mono text-xs font-bold text-zinc-900 dark:text-white">

                                            {item.quantity}

                                        </span>


                                        <button
                                            type="button"
                                            disabled={
                                                item.quantity >=
                                                item.variant.stock
                                            }
                                            onClick={() =>
                                                handleQuantityChange(
                                                    item,
                                                    item.quantity + 1
                                                )
                                            }
                                            className="flex h-8 w-8 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-950 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-white"
                                            aria-label="Increase quantity"
                                        >
                                            +
                                        </button>

                                    </div>


                                    <div className="text-right">

                                        <span className="font-mono text-sm font-bold text-zinc-950 dark:text-white">

                                            ₹{item.total}

                                        </span>

                                    </div>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemove(
                                                item
                                            )
                                        }
                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                                        title="Remove item"
                                        aria-label="Remove item"
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23.022l.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l-.3-7.5Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>

                                    </button>

                                </div>

                            </div>

                        )
                    )}

                </div>


                {/* Summary */}

                <div className="lg:col-span-4">

                    <aside className="sticky top-24 rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-6 dark:border-zinc-800/80 dark:bg-[#121215]/80">

                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            SETTLEMENT SUMMARY
                        </span>


                        <div className="mt-6 space-y-3.5 text-xs">

                            <div className="flex justify-between">

                                <span className="text-zinc-600 dark:text-zinc-400">
                                    Specimen Subtotal
                                </span>

                                <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                                    ₹{cart.total}
                                </span>

                            </div>


                            <div className="flex justify-between">

                                <span className="text-zinc-600 dark:text-zinc-400">
                                    Estimated Logistics
                                </span>

                                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    COMPLIMENTARY
                                </span>

                            </div>


                            <div className="flex justify-between">

                                <span className="text-zinc-600 dark:text-zinc-400">
                                    Archival Packaging
                                </span>

                                <span className="font-mono font-semibold text-zinc-900 dark:text-white">
                                    INCLUDED
                                </span>

                            </div>

                        </div>


                        <div className="my-6 border-t border-zinc-200/80 dark:border-zinc-800/80" />


                        <div className="flex items-baseline justify-between">

                            <span className="text-sm font-bold text-zinc-950 dark:text-white">
                                Estimated Total
                            </span>

                            <span className="font-mono text-xl font-black text-zinc-950 dark:text-white">
                                ₹{cart.total}
                            </span>

                        </div>


                        <Link
                            href="/checkout"
                            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                            Proceed to Checkout

                            <span className="transition-transform duration-200 group-hover:translate-x-1">
                                →
                            </span>

                        </Link>


                        {isGuest && (

                            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">

                                Account required to complete order

                            </p>

                        )}

                    </aside>

                </div>

            </div>

        </main>
    );
}