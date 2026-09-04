"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ProductFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState(
        searchParams.get("search") || ""
    );

    const [ordering, setOrdering] = useState(
        searchParams.get("ordering") || ""
    );

    function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const params = new URLSearchParams(searchParams.toString());

        if (search.trim()) {
            params.set("search", search.trim());
        } else {
            params.delete("search");
        }

        if (ordering) {
            params.set("ordering", ordering);
        } else {
            params.delete("ordering");
        }

        params.delete("page");

        router.push(`/products?${params.toString()}`);
    }

    function handleReset() {
        setSearch("");
        setOrdering("");
        router.push("/products");
    }

    const hasActiveFilters = Boolean(searchParams.get("search") || searchParams.get("ordering"));

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 rounded-2xl border border-zinc-200/80 bg-white/70 p-2.5 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/40 sm:flex-row sm:items-center"
        >
            {/* Search Input Container */}
            <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 dark:text-zinc-500">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="h-4 w-4"
                    >
                        <path
                            fillRule="evenodd"
                            d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <input
                    type="search"
                    placeholder="Search archive by keyword, style, or material..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-xl border-0 bg-transparent py-2.5 pl-10 pr-4 text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-600 dark:focus:ring-white"
                />
            </div>

            <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={ordering}
                        onChange={(event) => setOrdering(event.target.value)}
                        className="cursor-pointer appearance-none rounded-xl border border-zinc-200/80 bg-zinc-50/70 py-2.5 pl-3.5 pr-8 text-xs font-semibold text-zinc-800 transition-colors hover:border-zinc-300 focus:outline-none dark:border-zinc-800/80 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-700"
                    >
                        <option value="">Sort: Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="name">Specimen: A-Z</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-zinc-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            className="h-3.5 w-3.5"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>

                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleReset}
                        className="rounded-xl border border-zinc-200/80 px-3 py-2.5 text-xs font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        title="Clear filters"
                    >
                        Clear
                    </button>
                )}

                <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                    Filter
                </button>
            </div>
        </form>
    );
}