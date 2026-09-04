"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    mergeGuestCart,
} from "@/lib/api";

import {
    clearGuestCart,
    getGuestCart,
} from "@/lib/guestCart";
import { login } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: FormEvent) {
        event.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await login(username, password);

            localStorage.setItem(
                "access_token",
                data.access
            );

            localStorage.setItem(
                "refresh_token",
                data.refresh
            );

            window.dispatchEvent(
                new Event("auth-changed")
            );

            const guestCart =
                getGuestCart();

            if (guestCart.length > 0) {

                try {

                    await mergeGuestCart(
                        guestCart
                    );

                    clearGuestCart();

                    window.dispatchEvent(
                        new Event("cart-updated")
                    );

                    router.push(
                        "/checkout"
                    );

                    return;

                } catch (error) {

                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unable to merge your cart"
                    );

                    return;
                }
            }

            router.push("/products");
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Access credentials rejected"
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
                            THE GARMENT LAB // PORTAL
                        </span>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                            Member Access
                        </h1>
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            Sign in to reserve archival specimens and manage your client ledger.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                        {error && (
                            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300">
                                <span className="font-bold">NOTICE //</span> {error}
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Username
                            </label>
                            <input
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="e.g. mkn_2"
                                className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                required
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••••••"
                                className="w-full rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:bg-white focus:outline-none dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:border-white"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 py-4 font-mono text-xs font-bold uppercase tracking-[0.18em] text-white shadow-lg transition-all hover:bg-zinc-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
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
                                    AUTHENTICATING...
                                </span>
                            ) : (
                                <>
                                    ACCESS PORTAL
                                    <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 border-t border-zinc-100 pt-5 text-center text-xs dark:border-zinc-800/60">

                        <p className="text-zinc-500 dark:text-zinc-400">
                            Don't have an account?
                        </p>

                        <Link
                            href="/register"
                            className="mt-2 inline-block font-semibold text-zinc-950 hover:underline dark:text-white"
                        >
                            Create Account →
                        </Link>

                        <div className="mt-4">
                            <Link
                                href="/products"
                                className="font-mono text-zinc-400 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-white"
                            >
                                Browse Public Catalog Without Account →
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </main>
    );
}