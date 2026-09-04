"use client";

import { useState } from "react";
import Link from "next/link";

type Variant = {
    id: number;
    size: string;
    color: string;
    stock: number;
    price_override: string | null;
    is_active: boolean;
};

type ProductPurchaseProps = {
    variants: Variant[];
};

export default function ProductPurchase({
    variants,
}: ProductPurchaseProps) {
    const [selectedColor, setSelectedColor] =
        useState<string>("");

    const [selectedSize, setSelectedSize] =
        useState<string>("");

    const [selectedVariant, setSelectedVariant] =
        useState<Variant | null>(null);

    const [quantity, setQuantity] =
        useState(1);

    const [loading, setLoading] =
        useState(false);

    const [success, setSuccess] =
        useState(false);

    const [error, setError] =
        useState("");

    /*
     * Only active variants with stock are selectable.
     */
    const availableVariants = variants.filter(
        (variant) =>
            variant.is_active &&
            variant.stock > 0
    );

    /*
     * Get unique colors.
     */
    const colors = Array.from(
        new Set(
            availableVariants
                .map((variant) => variant.color.trim())
                .filter(Boolean)
        )
    );

    /*
     * If the product has no color attribute,
     * we can still use the size selector.
     */
    const hasColors = colors.length > 0;

    /*
     * Get sizes available for the currently
     * selected color.
     *
     * If no color is selected yet, show all
     * available sizes.
     */
    const availableSizes = Array.from(
        new Set(
            availableVariants
                .filter(
                    (variant) =>
                        !hasColors ||
                        !selectedColor ||
                        variant.color === selectedColor
                )
                .map((variant) => variant.size.trim())
                .filter(Boolean)
        )
    );

    function handleColorSelect(
        color: string
    ) {
        setSelectedColor(color);

        /*
         * Reset size because the available
         * variant may change when color changes.
         */
        setSelectedSize("");
        setSelectedVariant(null);

        setQuantity(1);
        setSuccess(false);
        setError("");
    }

    function handleSizeSelect(
        size: string
    ) {
        setSelectedSize(size);

        const variant =
            availableVariants.find(
                (item) =>
                    item.size === size &&
                    (
                        !hasColors ||
                        item.color === selectedColor
                    )
            );

        if (!variant) {
            setSelectedVariant(null);
            setError(
                "This size is currently unavailable."
            );
            return;
        }

        setSelectedVariant(variant);
        setQuantity(1);
        setSuccess(false);
        setError("");
    }

    function decrementQuantity() {
        if (!selectedVariant) {
            return;
        }

        setQuantity((prev) =>
            Math.max(1, prev - 1)
        );

        setSuccess(false);
        setError("");
    }

    function incrementQuantity() {
        if (!selectedVariant) {
            return;
        }

        setQuantity((prev) =>
            Math.min(
                selectedVariant.stock,
                prev + 1
            )
        );

        setSuccess(false);
        setError("");
    }

    async function handleAddToCart() {
        setError("");
        setSuccess(false);

        if (!selectedVariant) {
            setError(
                hasColors
                    ? "Please select a color and size before adding to bag."
                    : "Please select a size before adding to bag."
            );

            return;
        }

        const token =
            localStorage.getItem(
                "access_token"
            );

        if (!token) {
            setError(
                "Please login or create an account to reserve specimens in your bag."
            );

            return;
        }

        if (
            quantity < 1 ||
            quantity > selectedVariant.stock
        ) {
            setError(
                "Selected quantity is currently unavailable."
            );

            return;
        }

        setLoading(true);

        try {
            const response =
                await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/cart/add/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body: JSON.stringify({
                            variant_id:
                                selectedVariant.id,

                            quantity,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                console.error(
                    "Cart API error:",
                    {
                        status:
                            response.status,
                        data,
                    }
                );

                throw new Error(
                    data.detail ||
                    data.error ||
                    "Unable to add item to cart"
                );
            }

            setSuccess(true);

            window.dispatchEvent(
                new Event("cart-updated")
            );
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to add specimen to cart"
            );
        } finally {
            setLoading(false);
        }
    }

    if (availableVariants.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-6 text-center dark:border-zinc-800">
                <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                    [ ARCHIVE STATUS: OUT OF STOCK ]
                </span>

                <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
                    This specimen is currently unavailable in all sizes.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">

            {/* Color Selection */}

            {hasColors && (
                <div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            SELECT COLOR
                        </span>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2.5">

                        {colors.map((color) => {
                            const isSelected =
                                selectedColor === color;

                            return (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() =>
                                        handleColorSelect(
                                            color
                                        )
                                    }
                                    className={`rounded-xl border px-4 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${isSelected
                                            ? "border-zinc-950 bg-zinc-950 text-white shadow-md dark:border-white dark:bg-white dark:text-zinc-950"
                                            : "border-zinc-200/80 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
                                        }`}
                                >
                                    {color}
                                </button>
                            );
                        })}

                    </div>
                </div>
            )}

            {/* Size Selection */}

            <div>
                <div className="flex items-center justify-between text-xs">

                    <span className="font-mono uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        SELECT SIZE
                    </span>

                    {selectedVariant && (
                        <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">
                            AVAILABILITY:{" "}
                            {selectedVariant.stock}{" "}
                            UNITS
                        </span>
                    )}

                </div>

                <div className="mt-3 flex flex-wrap gap-2.5">

                    {availableSizes.map((size) => {
                        const variant =
                            availableVariants.find(
                                (item) =>
                                    item.size === size &&
                                    (
                                        !hasColors ||
                                        item.color ===
                                        selectedColor
                                    )
                            );

                        const isAvailable =
                            !!variant &&
                            variant.stock > 0;

                        const isSelected =
                            selectedSize === size;

                        return (
                            <button
                                key={size}
                                type="button"
                                onClick={() =>
                                    handleSizeSelect(
                                        size
                                    )
                                }
                                disabled={
                                    !isAvailable ||
                                    (hasColors &&
                                        !selectedColor)
                                }
                                className={`rounded-xl border px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${isSelected
                                        ? "border-zinc-950 bg-zinc-950 text-white shadow-md dark:border-white dark:bg-white dark:text-zinc-950"
                                        : "border-zinc-200/80 bg-white text-zinc-800 hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
                                    } disabled:cursor-not-allowed disabled:opacity-40`}
                            >
                                {size}
                            </button>
                        );
                    })}

                </div>
            </div>

            {/* Selected Variant */}

            {selectedVariant && (
                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">

                    <div className="space-y-1 text-xs">

                        {selectedVariant.color && (
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Color:{" "}
                                <span className="font-semibold text-zinc-950 dark:text-white">
                                    {selectedVariant.color}
                                </span>
                            </p>
                        )}

                        {selectedVariant.size && (
                            <p className="text-zinc-600 dark:text-zinc-400">
                                Size:{" "}
                                <span className="font-semibold text-zinc-950 dark:text-white">
                                    {selectedVariant.size}
                                </span>
                            </p>
                        )}

                        <p className="text-zinc-600 dark:text-zinc-400">
                            SKU:{" "}
                            <span className="font-semibold text-zinc-950 dark:text-white">
                                {selectedVariant.id}
                            </span>
                        </p>

                        <p className="text-zinc-600 dark:text-zinc-400">
                            Available:{" "}
                            <span className="font-semibold text-zinc-950 dark:text-white">
                                {selectedVariant.stock}
                            </span>
                        </p>

                    </div>

                </div>
            )}

            {/* Quantity */}

            {selectedVariant && (
                <div>

                    <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                        QUANTITY
                    </span>

                    <div className="mt-2.5 flex items-center gap-3">

                        <div className="flex items-center rounded-xl border border-zinc-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900">

                            <button
                                type="button"
                                onClick={
                                    decrementQuantity
                                }
                                disabled={
                                    quantity <= 1
                                }
                                className="flex h-9 w-9 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-950 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-white"
                                aria-label="Decrease quantity"
                            >
                                −
                            </button>

                            <span className="w-10 text-center font-mono text-xs font-bold text-zinc-900 dark:text-white">
                                {quantity}
                            </span>

                            <button
                                type="button"
                                onClick={
                                    incrementQuantity
                                }
                                disabled={
                                    quantity >=
                                    selectedVariant.stock
                                }
                                className="flex h-9 w-9 items-center justify-center text-zinc-600 transition-colors hover:text-zinc-950 disabled:opacity-30 dark:text-zinc-400 dark:hover:text-white"
                                aria-label="Increase quantity"
                            >
                                +
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* Error */}

            {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                    <div className="flex items-center gap-2">
                        <span className="font-bold">
                            NOTICE //
                        </span>

                        <span>
                            {error}
                        </span>
                    </div>
                </div>
            )}

            {/* Success */}

            {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/30">

                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">

                            <span className="font-bold">
                                SUCCESS //
                            </span>

                            <span>
                                Specimen added to your shopping bag.
                            </span>

                        </div>

                        <Link
                            href="/cart"
                            className="font-mono font-bold uppercase text-emerald-900 underline hover:opacity-80 dark:text-emerald-200"
                        >
                            View Bag →
                        </Link>

                    </div>

                </div>
            )}

            {/* Add to Bag */}

            <button
                type="button"
                onClick={
                    handleAddToCart
                }
                disabled={
                    loading ||
                    !selectedVariant
                }
                className="group relative flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all duration-200 hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
                {loading ? (
                    <span className="flex items-center gap-2">

                        <svg
                            className="h-4 w-4 animate-spin text-current"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />

                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>

                        RESERVING SPECIMEN...

                    </span>
                ) : (
                    <>
                        ADD TO SHOPPING BAG

                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                            →
                        </span>
                    </>
                )}
            </button>

        </div>
    );
}