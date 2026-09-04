"use client";

import Link from "next/link";
import {
    useEffect,
    useState,
} from "react";

import { getCart } from "@/lib/api";


export default function Navbar() {

    const [loggedIn, setLoggedIn] =
        useState(false);

    const [cartCount, setCartCount] =
        useState(0);


    async function loadCartCount() {

        const token =
            localStorage.getItem(
                "access_token"
            );

        if (!token) {

            setCartCount(0);

            return;
        }

        try {

            const cart =
                await getCart();

            const count =
                cart.items.reduce(
                    (
                        total: number,
                        item: {
                            quantity: number;
                        }
                    ) =>
                        total +
                        item.quantity,
                    0
                );

            setCartCount(count);

        } catch {

            setCartCount(0);

        }
    }


    function checkAuthentication() {

        const token =
            localStorage.getItem(
                "access_token"
            );

        setLoggedIn(Boolean(token));

        loadCartCount();
    }


    useEffect(() => {

        checkAuthentication();


        window.addEventListener(
            "auth-changed",
            checkAuthentication
        );

        window.addEventListener(
            "cart-updated",
            loadCartCount
        );


        return () => {

            window.removeEventListener(
                "auth-changed",
                checkAuthentication
            );

            window.removeEventListener(
                "cart-updated",
                loadCartCount
            );

        };

    }, []);


    function handleLogout() {

        localStorage.removeItem(
            "access_token"
        );

        localStorage.removeItem(
            "refresh_token"
        );

        setLoggedIn(false);
        setCartCount(0);

        window.dispatchEvent(
            new Event("auth-changed")
        );

        window.location.href =
            "/login";
    }


    return (
        <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl transition-colors dark:border-zinc-800/70 dark:bg-[#09090b]/80">

            <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                {/* Logo / Brand Mark */}

                <Link
                    href="/"
                    className="group flex items-center gap-2.5"
                >
                    <span className="text-base font-black tracking-tight text-zinc-950 transition-colors dark:text-white">
                        THE GARMENT LAB
                    </span>

                    <span className="rounded border border-zinc-200/80 bg-zinc-100/80 px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-widest text-zinc-600 transition-colors group-hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:group-hover:border-zinc-700">
                        LAB™
                    </span>
                </Link>


                {/* Main navigation */}

                <div className="hidden items-center gap-8 md:flex">

                    <Link
                        href="/"
                        className="text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    >
                        Archive
                    </Link>

                    <Link
                        href="/products"
                        className="text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    >
                        Catalog
                    </Link>

                    <Link
                        href="/orders"
                        className="text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
                    >
                        Orders
                    </Link>

                </div>


                {/* User actions */}

                <div className="flex items-center gap-3">

                    {loggedIn ? (

                        <>
                            <Link
                                href="/cart"
                                className="group relative flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-zinc-50/50 text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-white hover:text-zinc-950 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                                aria-label="Shopping Cart"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.75"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="h-4 w-4"
                                >
                                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                                    <path d="M3 6h18" />
                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                </svg>

                                {cartCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-950 px-1 font-mono text-[9px] font-bold text-white shadow-sm dark:bg-white dark:text-zinc-950">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>


                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-full border border-zinc-200/80 px-3.5 py-1.5 text-xs font-semibold text-zinc-700 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-100 hover:text-zinc-950 dark:border-zinc-800/80 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
                            >
                                Logout
                            </button>
                        </>

                    ) : (

                        <Link
                            href="/login"
                            className="rounded-full bg-zinc-950 px-4 py-1.5 text-xs font-semibold text-white transition-all duration-200 hover:opacity-90 dark:bg-white dark:text-zinc-950"
                        >
                            Access
                        </Link>

                    )}

                </div>

            </nav>

        </header>
    );
}