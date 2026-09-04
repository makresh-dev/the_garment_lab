"use client";

import { useRouter, useSearchParams } from "next/navigation";

type ProductPaginationProps = {
    count: number;
    pageSize: number;
};

export default function ProductPagination({
    count,
    pageSize,
}: ProductPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const currentPage = Number(searchParams.get("page") || "1");
    const totalPages = Math.ceil(count / pageSize);

    if (totalPages <= 1) {
        return null;
    }

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(page));
        router.push(`/products?${params.toString()}`);
    }

    return (
        <div className="mt-14 flex items-center justify-center gap-3">
            <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                aria-label="Previous Page"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                >
                    <path
                        fillRule="evenodd"
                        d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>

            <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                PAGE {String(currentPage).padStart(2, "0")} / {String(totalPages).padStart(2, "0")}
            </span>

            <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200/80 bg-white text-zinc-700 transition-all hover:border-zinc-300 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-30 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                aria-label="Next Page"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4"
                >
                    <path
                        fillRule="evenodd"
                        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </div>
    );
}