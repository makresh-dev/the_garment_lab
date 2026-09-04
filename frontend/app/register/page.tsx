"use client";

import {
    FormEvent,
    Suspense,
    useState,
} from "react";

import {
    useRouter,
} from "next/navigation";

import Link from "next/link";

import {
    register,
} from "@/lib/auth";


function RegisterContent() {
    const router = useRouter();

    const [username, setUsername] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [error, setError] =
        useState("");

    const [loading, setLoading] =
        useState(false);


    async function handleSubmit(
        event: FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        const cleanUsername =
            username.trim();

        const cleanEmail =
            email
                .trim()
                .toLowerCase();


        // -------------------------------------------------
        // Client-side validation
        // -------------------------------------------------

        if (!cleanUsername) {
            setError(
                "Username is required."
            );

            return;
        }

        if (!cleanEmail) {
            setError(
                "Email address is required."
            );

            return;
        }

        if (password.length < 8) {
            setError(
                "Password must be at least 8 characters."
            );

            return;
        }

        if (
            password !==
            confirmPassword
        ) {
            setError(
                "Passwords do not match."
            );

            return;
        }


        setLoading(true);


        try {

            // -------------------------------------------------
            // Register account
            //
            // The API URL is centralized in lib/auth.ts.
            // Do NOT construct /api/auth/register/ here.
            // -------------------------------------------------

            await register(
                cleanUsername,
                cleanEmail,
                password
            );


            // -------------------------------------------------
            // Registration successful.
            //
            // Django has created the account and generated
            // the OTP. Redirect to the dedicated OTP page.
            // -------------------------------------------------

            router.push(
                `/verify-otp?username=${encodeURIComponent(
                    cleanUsername
                )}`
            );

        } catch (err) {

            setError(
                err instanceof Error
                    ? err.message
                    : "Registration failed."
            );

        } finally {

            setLoading(false);

        }
    }


    return (
        <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">

            <div className="w-full max-w-md">

                <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-8 shadow-xl shadow-zinc-200/30 dark:border-zinc-800/80 dark:bg-[#121215] dark:shadow-none sm:p-10">


                    {/* Header */}

                    <div className="text-center">

                        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                            THE GARMENT LAB // REGISTRY
                        </span>


                        <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                            Create Account
                        </h1>


                        <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                            Create your account to complete purchases and manage your wardrobe.
                        </p>

                    </div>


                    {/* Error */}

                    {error && (

                        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/90 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">

                            <span className="font-bold">
                                NOTICE //
                            </span>{" "}

                            {error}

                        </div>

                    )}


                    {/* Registration Form */}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-8 space-y-5"
                    >


                        {/* Username */}

                        <div>

                            <label
                                htmlFor="username"
                                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                            >
                                Username
                            </label>


                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(event) =>
                                    setUsername(
                                        event.target.value
                                    )
                                }
                                placeholder="e.g. alex_lab"
                                autoComplete="username"
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                            />

                        </div>


                        {/* Email */}

                        <div>

                            <label
                                htmlFor="email"
                                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                            >
                                Email Address
                            </label>


                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="alex@example.com"
                                autoComplete="email"
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                            />

                        </div>


                        {/* Password */}

                        <div>

                            <label
                                htmlFor="password"
                                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                            >
                                Password (min. 8 characters)
                            </label>


                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                                minLength={8}
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                            />

                        </div>


                        {/* Confirm Password */}

                        <div>

                            <label
                                htmlFor="confirm-password"
                                className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
                            >
                                Confirm Password
                            </label>


                            <input
                                id="confirm-password"
                                name="confirm-password"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value
                                    )
                                }
                                autoComplete="new-password"
                                minLength={8}
                                required
                                disabled={loading}
                                className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                            />

                        </div>


                        {/* Submit */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >

                            {loading
                                ? "CREATING ACCOUNT..."
                                : (
                                    <>
                                        CREATE ACCOUNT & GET OTP

                                        <span className="transition-transform duration-200 group-hover:translate-x-1">
                                            →
                                        </span>
                                    </>
                                )}

                        </button>

                    </form>


                    {/* Login */}

                    <div className="mt-6 border-t border-zinc-100 pt-5 text-center text-xs dark:border-zinc-800/60">

                        <span className="text-zinc-500 dark:text-zinc-400">
                            Already have an account?
                        </span>{" "}

                        <Link
                            href="/login"
                            className="font-semibold text-zinc-950 hover:underline dark:text-white"
                        >
                            Login
                        </Link>

                    </div>


                    {/* Public Catalog */}

                    <div className="mt-3 text-center">

                        <Link
                            href="/products"
                            className="font-mono text-xs text-zinc-400 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-white"
                        >
                            Browse Public Catalog →
                        </Link>

                    </div>

                </div>

            </div>

        </main>
    );
}


export default function RegisterPage() {
    return (
        <Suspense
            fallback={
                <main className="flex min-h-[calc(100vh-140px)] items-center justify-center px-6 py-12">

                    <div className="w-full max-w-md text-center">

                        <span className="font-mono text-xs uppercase tracking-widest text-zinc-400">
                            Loading Registration...
                        </span>

                    </div>

                </main>
            }
        >
            <RegisterContent />
        </Suspense>
    );
}