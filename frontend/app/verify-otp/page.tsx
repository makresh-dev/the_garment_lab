"use client";

import {
    FormEvent,
    Suspense,
    useEffect,
    useState,
} from "react";

import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import Link from "next/link";

import {
    mergeGuestCart,
} from "@/lib/api";

import {
    clearGuestCart,
    getGuestCart,
} from "@/lib/guestCart";


const API_URL =
    process.env.NEXT_PUBLIC_API_URL?.replace(
        /\/+$/,
        ""
    ) || "/api-backend";


function VerifyOTPContent() {
    const router = useRouter();

    const searchParams =
        useSearchParams();

    const username =
        searchParams.get("username") || "";


    const [otp, setOtp] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [resending, setResending] =
        useState(false);

    const [resendMessage, setResendMessage] =
        useState("");

    const [resendCooldown, setResendCooldown] =
        useState(0);


    // ---------------------------------------------------------
    // Resend OTP countdown
    // ---------------------------------------------------------

    useEffect(() => {
        if (resendCooldown <= 0) {
            return;
        }

        const timer =
            window.setInterval(() => {
                setResendCooldown(
                    (current) =>
                        Math.max(
                            current - 1,
                            0
                        )
                );
            }, 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [resendCooldown]);


    // ---------------------------------------------------------
    // Verify OTP
    // ---------------------------------------------------------

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");
        setResendMessage("");

        if (!username) {
            setError(
                "Verification session is invalid. Please register again."
            );
            return;
        }

        if (!/^\d{6}$/.test(otp)) {
            setError(
                "Enter the 6-digit OTP."
            );
            return;
        }

        setLoading(true);

        try {
            const response =
                await fetch(
                    `${API_URL}/auth/verify-otp/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            username,
                            otp,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.detail ||
                    "OTP verification failed."
                );
            }

            if (
                !data.access ||
                !data.refresh
            ) {
                throw new Error(
                    "Email verified, but authentication tokens were not returned."
                );
            }


            // -------------------------------------------------
            // Store JWT tokens
            // -------------------------------------------------

            localStorage.setItem(
                "access_token",
                data.access
            );

            localStorage.setItem(
                "refresh_token",
                data.refresh
            );


            // Notify authenticated components
            window.dispatchEvent(
                new Event("auth-changed")
            );


            // -------------------------------------------------
            // Merge guest cart
            // -------------------------------------------------

            const guestCart =
                getGuestCart();

            if (guestCart.length > 0) {
                try {
                    await mergeGuestCart(
                        guestCart
                    );

                    // Only clear after successful merge
                    clearGuestCart();

                    window.dispatchEvent(
                        new Event(
                            "cart-updated"
                        )
                    );

                    router.push(
                        "/checkout"
                    );

                    return;

                } catch (error) {
                    throw new Error(
                        error instanceof Error
                            ? error.message
                            : "Your account was verified, but we could not merge your shopping bag."
                    );
                }
            }


            // -------------------------------------------------
            // No guest cart
            // -------------------------------------------------

            router.push(
                "/products"
            );

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "OTP verification failed."
            );
        } finally {
            setLoading(false);
        }
    }


    // ---------------------------------------------------------
    // Resend OTP
    // ---------------------------------------------------------

    async function handleResend() {
        if (!username) {
            setError(
                "Verification session is invalid."
            );
            return;
        }

        if (resendCooldown > 0) {
            return;
        }

        setError("");
        setResendMessage("");
        setResending(true);

        try {
            const response =
                await fetch(
                    `${API_URL}/auth/resend-otp/`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            username,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    data.detail ||
                    "Unable to resend OTP."
                );
            }

            setOtp("");

            setResendMessage(
                "A new verification code has been sent."
            );

            setResendCooldown(60);

        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Unable to resend OTP."
            );
        } finally {
            setResending(false);
        }
    }


    // ---------------------------------------------------------
    // Invalid verification URL
    // ---------------------------------------------------------

    if (!username) {
        return (
            <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">

                <div className="w-full max-w-md">

                    <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 text-center shadow-xl shadow-zinc-200/30 dark:border-zinc-800/80 dark:bg-[#121215] dark:shadow-none sm:p-10">

                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                            THE GARMENT LAB // VERIFICATION
                        </span>

                        <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                            Invalid Verification Session
                        </h1>

                        <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            Please return to registration and create your account again.
                        </p>

                        <Link
                            href="/register"
                            className="mt-6 inline-block rounded-2xl bg-zinc-950 px-6 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-zinc-950"
                        >
                            Return to Registration
                        </Link>

                    </div>

                </div>

            </main>
        );
    }


    // ---------------------------------------------------------
    // OTP page
    // ---------------------------------------------------------

    return (
        <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">

            <div className="w-full max-w-md">

                <div className="rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 dark:border-zinc-800/80 dark:bg-[#121215] dark:shadow-none sm:p-10">


                    {/* Header */}

                    <div className="text-center">

                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                            THE GARMENT LAB // VERIFICATION
                        </span>

                        <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                            Verify Your Email
                        </h1>

                        <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            Enter the 6-digit verification code sent to your registered email.
                        </p>

                    </div>


                    {/* Account */}

                    <div className="mt-6 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-center dark:border-zinc-800 dark:bg-zinc-900/50">

                        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                            ACCOUNT
                        </span>

                        <p className="mt-1 text-sm font-semibold text-zinc-900 dark:text-white">
                            {username}
                        </p>

                    </div>


                    {/* Error */}

                    {error && (
                        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">

                            <span className="font-bold">
                                NOTICE //
                            </span>{" "}

                            {error}

                        </div>
                    )}


                    {/* Resend success */}

                    {resendMessage && (
                        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                            {resendMessage}
                        </div>
                    )}


                    {/* OTP Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                    >

                        <div>

                            <label
                                htmlFor="otp"
                                className="mb-2 block text-center font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                            >
                                Verification Code
                            </label>

                            <input
                                id="otp"
                                name="otp"
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={otp}
                                onChange={(event) =>
                                    setOtp(
                                        event.target.value
                                            .replace(
                                                /\D/g,
                                                ""
                                            )
                                            .slice(
                                                0,
                                                6
                                            )
                                    )
                                }
                                placeholder="000000"
                                autoFocus
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4 text-center font-mono text-2xl font-bold tracking-[0.45em] text-zinc-900 placeholder:text-zinc-300 focus:border-zinc-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-white dark:placeholder:text-zinc-700 dark:focus:border-white"
                            />

                        </div>


                        <button
                            type="submit"
                            disabled={
                                loading ||
                                otp.length !== 6
                            }
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >

                            {loading
                                ? "VERIFYING..."
                                : (
                                    <>
                                        VERIFY EMAIL

                                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </>
                                )}

                        </button>

                    </form>


                    {/* Resend */}

                    <div className="mt-6 border-t border-zinc-100 pt-5 text-center dark:border-zinc-800/60">

                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Didn't receive the code?
                        </p>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={
                                resending ||
                                resendCooldown > 0
                            }
                            className="mt-2 font-semibold text-zinc-950 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-white"
                        >

                            {resending
                                ? "SENDING..."
                                : resendCooldown > 0
                                    ? `RESEND IN ${resendCooldown}s`
                                    : "RESEND OTP →"}

                        </button>

                    </div>


                    {/* Login */}

                    <div className="mt-4 text-center">

                        <Link
                            href="/login"
                            className="font-mono text-xs text-zinc-400 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-white"
                        >
                            Return to Login →
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}


export default function VerifyOTPPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">

                    <div className="w-full max-w-md text-center">

                        <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                            Loading Verification...
                        </span>

                    </div>

                </main>
            }
        >
            <VerifyOTPContent />
        </Suspense>
    );
}