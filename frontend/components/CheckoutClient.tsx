"use client";

import {
    FormEvent,
    useEffect,
    useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
    createCheckout,
    getCart,
} from "@/lib/api";


type Cart = {
    items: Array<{
        id: number;
        quantity: number;
        total: string;

        variant: {
            size: string;
            color: string;

            product: {
                name: string;
            };
        };
    }>;

    total: string;
};


type PaymentMethod =
    | "cod"
    | "upi";


export default function CheckoutClient() {

    const router = useRouter();

    const [cart, setCart] =
        useState<Cart | null>(null);

    const [paymentMethod, setPaymentMethod] =
        useState<PaymentMethod>("cod");

    const [form, setForm] = useState({
        shipping_name: "",
        shipping_phone: "",
        shipping_address: "",
        shipping_city: "",
        shipping_state: "",
        shipping_postal_code: "",
    });

    const [loading, setLoading] =
        useState(true);

    const [submitting, setSubmitting] =
        useState(false);

    const [error, setError] =
        useState("");

    const [authenticated, setAuthenticated] =
        useState(false);


    /*
     * --------------------------------
     * Load checkout
     * --------------------------------
     */

    useEffect(() => {

        async function loadCheckout() {

            const token =
                localStorage.getItem(
                    "access_token"
                );


            /*
             * Guest user
             *
             * Checkout requires authentication.
             */

            if (!token) {

                setAuthenticated(false);
                setLoading(false);

                return;
            }


            setAuthenticated(true);


            try {

                const data =
                    await getCart();

                setCart(data);

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


        loadCheckout();

    }, []);


    /*
     * --------------------------------
     * Update form
     * --------------------------------
     */

    function updateField(
        field: string,
        value: string
    ) {

        setForm((current) => ({
            ...current,
            [field]: value,
        }));

    }


    /*
     * --------------------------------
     * Checkout
     * --------------------------------
     */

    async function handleSubmit(
        event: FormEvent
    ) {

        event.preventDefault();

        const token =
            localStorage.getItem(
                "access_token"
            );


        /*
         * Extra security check.
         */

        if (!token) {

            router.push(
                "/login"
            );

            return;
        }


        setSubmitting(true);
        setError("");


        try {

            const data =
                await createCheckout({
                    ...form,

                    payment_method:
                        paymentMethod,
                });


            const order =
                data.order;


            /*
             * COD
             */

            if (
                paymentMethod === "cod"
            ) {

                window.location.href =
                    `/order-success/${order.id}`;

                return;
            }


            /*
             * UPI
             */

            window.location.href =
                `/orders/${order.id}/payment`;

        } catch (error) {

            setError(
                error instanceof Error
                    ? error.message
                    : "Checkout failed"
            );

        } finally {

            setSubmitting(false);

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

                    INITIALIZING ESCROW & CHECKOUT...

                </div>

            </main>
        );

    }


    /*
     * --------------------------------
     * Guest checkout gate
     * --------------------------------
     */

    if (!authenticated) {

        return (
            <main className="mx-auto max-w-7xl px-6 py-20 md:py-28">

                <div className="mx-auto max-w-lg rounded-3xl border border-zinc-200/80 bg-white p-10 text-center shadow-sm dark:border-zinc-800/80 dark:bg-[#121215]">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl dark:bg-zinc-900">
                        🔐
                    </div>

                    <span className="mt-6 block font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        AUTHENTICATION REQUIRED
                    </span>

                    <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                        Sign in to complete your order
                    </h1>

                    <p className="mt-3 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
                        Your shopping bag is saved. Create an account
                        or sign in to continue to payment.
                    </p>


                    <div className="mt-8 grid gap-3">

                        <Link
                            href="/login"
                            className="rounded-2xl bg-zinc-950 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-zinc-950"
                        >
                            Sign In
                        </Link>


                        <Link
                            href="/register"
                            className="rounded-2xl border border-zinc-200 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] dark:border-zinc-800"
                        >
                            Create Account
                        </Link>


                        <Link
                            href="/cart"
                            className="mt-2 text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                        >
                            ← Return to Shopping Bag
                        </Link>

                    </div>

                </div>

            </main>
        );

    }


    /*
     * --------------------------------
     * Cart error / empty state
     * --------------------------------
     */

    if (!cart || cart.items.length === 0) {

        return (
            <main className="mx-auto max-w-7xl px-6 py-20 md:py-28">

                <div className="mx-auto max-w-md rounded-3xl border border-dashed border-zinc-300 p-10 text-center dark:border-zinc-800">

                    <h1 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
                        No Active Reservations
                    </h1>

                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                        Your bag has no specimens ready for settlement.
                    </p>

                    <div className="mt-6">

                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-6 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-white dark:bg-white dark:text-zinc-950"
                        >
                            Return to Catalog →
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    /*
     * --------------------------------
     * Main checkout UI
     * --------------------------------
     */

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">

            <div className="mb-10 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">

                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                    ESCROW & FULFILLMENT
                </span>

                <h1 className="mt-1 text-3xl font-black tracking-tight text-zinc-950 dark:text-white">
                    Order Checkout
                </h1>

            </div>


            <div className="grid gap-10 lg:grid-cols-12">

                {/* Checkout Form */}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-10 lg:col-span-8"
                >

                    {/* Shipping */}

                    <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#121215] sm:p-8">

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 dark:border-zinc-800/60">

                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 font-mono text-xs font-bold text-white dark:bg-white dark:text-zinc-950">
                                1
                            </span>

                            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                                Delivery Address & Contact
                            </h2>

                        </div>


                        <div className="mt-6 grid gap-4 sm:grid-cols-2">

                            <div>

                                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Full Name *
                                </label>

                                <input
                                    placeholder="e.g. Alex Miller"
                                    value={
                                        form.shipping_name
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "shipping_name",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                    required
                                />

                            </div>


                            <div>

                                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Phone Number *
                                </label>

                                <input
                                    type="tel"
                                    placeholder="10-digit mobile number"
                                    value={
                                        form.shipping_phone
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "shipping_phone",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                    required
                                />

                            </div>


                            <div className="sm:col-span-2">

                                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Delivery Address *
                                </label>

                                <textarea
                                    placeholder="Apartment, suite, unit, street address"
                                    value={
                                        form.shipping_address
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "shipping_address",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                    rows={3}
                                    required
                                />

                            </div>


                            <div>

                                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    City *
                                </label>

                                <input
                                    placeholder="City name"
                                    value={
                                        form.shipping_city
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "shipping_city",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                    required
                                />

                            </div>


                            <div>

                                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    State / Province *
                                </label>

                                <input
                                    placeholder="State name"
                                    value={
                                        form.shipping_state
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "shipping_state",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                    required
                                />

                            </div>


                            <div className="sm:col-span-2">

                                <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Postal / PIN Code *
                                </label>

                                <input
                                    placeholder="6-digit PIN code"
                                    value={
                                        form.shipping_postal_code
                                    }
                                    onChange={(e) =>
                                        updateField(
                                            "shipping_postal_code",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                    required
                                />

                            </div>

                        </div>

                    </section>


                    {/* Payment */}

                    <section className="rounded-3xl border border-zinc-200/80 bg-white p-6 dark:border-zinc-800/80 dark:bg-[#121215] sm:p-8">

                        <div className="flex items-center gap-3 border-b border-zinc-100 pb-5 dark:border-zinc-800/60">

                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-950 font-mono text-xs font-bold text-white dark:bg-white dark:text-zinc-950">
                                2
                            </span>

                            <h2 className="text-base font-bold text-zinc-950 dark:text-white">
                                Settlement Method
                            </h2>

                        </div>


                        <div className="mt-6 grid gap-3 sm:grid-cols-2">

                            {/* COD */}

                            <label
                                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-5 transition-all ${paymentMethod === "cod"
                                    ? "border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-900/80"
                                    : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#121215] dark:hover:border-zinc-700"
                                    }`}
                            >

                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="cod"
                                    checked={
                                        paymentMethod === "cod"
                                    }
                                    onChange={() =>
                                        setPaymentMethod("cod")
                                    }
                                    className="mt-0.5 accent-zinc-950 dark:accent-white"
                                />

                                <div>

                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                                        Cash on Delivery
                                    </p>

                                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Pay in cash upon physical delivery at your address.
                                    </p>

                                </div>

                            </label>


                            {/* UPI */}

                            <label
                                className={`flex cursor-pointer items-start gap-3.5 rounded-2xl border p-5 transition-all ${paymentMethod === "upi"
                                    ? "border-zinc-950 bg-zinc-50 dark:border-white dark:bg-zinc-900/80"
                                    : "border-zinc-200/80 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#121215] dark:hover:border-zinc-700"
                                    }`}
                            >

                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="upi"
                                    checked={
                                        paymentMethod === "upi"
                                    }
                                    onChange={() =>
                                        setPaymentMethod("upi")
                                    }
                                    className="mt-0.5 accent-zinc-950 dark:accent-white"
                                />

                                <div>

                                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-950 dark:text-white">
                                        Instant UPI / QR
                                    </p>

                                    <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">
                                        Pay via GPay, PhonePe, Paytm, or BHIM. Admin verified.
                                    </p>

                                </div>

                            </label>

                        </div>


                        {paymentMethod === "upi" && (

                            <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900/40">

                                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                                    UPI INSTRUCTIONS //
                                </span>

                                <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                                    After placing the order, you will be redirected to the UPI payment terminal.
                                </p>

                            </div>

                        )}

                    </section>


                    {error && (

                        <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">

                            <span className="font-bold">
                                NOTICE //
                            </span>{" "}

                            {error}

                        </div>

                    )}


                    <button
                        type="submit"
                        disabled={submitting}
                        className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                    >

                        {submitting
                            ? "CONFIRMING ORDER..."
                            : (
                                <>
                                    COMPLETE ORDER

                                    <span className="transition-transform duration-200 group-hover:translate-x-1">
                                        →
                                    </span>

                                </>
                            )}

                    </button>

                </form>


                {/* Order Review */}

                <div className="lg:col-span-4">

                    <aside className="sticky top-24 rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-6 dark:border-zinc-800/80 dark:bg-[#121215]/80">

                        <span className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                            ORDER SUMMARY
                        </span>


                        <div className="mt-6 divide-y divide-zinc-200/60 dark:divide-zinc-800/60">

                            {cart.items.map(
                                (item) => (

                                    <div
                                        key={item.id}
                                        className="flex justify-between py-3 text-xs"
                                    >

                                        <div>

                                            <p className="font-semibold text-zinc-900 dark:text-white">
                                                {
                                                    item.variant
                                                        .product
                                                        .name
                                                }
                                            </p>

                                            <p className="font-mono text-[10px] text-zinc-400">
                                                QTY:{" "}
                                                {item.quantity}
                                                {" · "}
                                                {item.variant.size}
                                            </p>

                                        </div>

                                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                                            ₹{item.total}
                                        </span>

                                    </div>

                                )
                            )}

                        </div>


                        <div className="my-5 border-t border-zinc-200/80 dark:border-zinc-800/80" />


                        <div className="space-y-2 text-xs">

                            <div className="flex justify-between text-zinc-600 dark:text-zinc-400">

                                <span>
                                    Logistics
                                </span>

                                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                    FREE
                                </span>

                            </div>


                            <div className="flex items-baseline justify-between text-sm font-bold text-zinc-950 dark:text-white">

                                <span>
                                    Total Settlement
                                </span>

                                <span className="font-mono text-lg font-black">
                                    ₹{cart.total}
                                </span>

                            </div>

                        </div>

                    </aside>

                </div>

            </div>

        </main>
    );
}