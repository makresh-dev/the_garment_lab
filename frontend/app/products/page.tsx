import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { getProducts } from "@/lib/api";
import ProductPagination from "@/components/ProductPagination";
import Link from "next/link";

type ProductsPageProps = {
    searchParams: Promise<{
        search?: string;
        category?: string;
        min_price?: string;
        max_price?: string;
        ordering?: string;
        page?: string;
    }>;
};

export default async function ProductsPage({
    searchParams,
}: ProductsPageProps) {
    const params = await searchParams;

    const data = await getProducts({
        search: params.search,
        category: params.category,
        min_price: params.min_price,
        max_price: params.max_price,
        ordering: params.ordering,
        page: params.page ? Number(params.page) : undefined,
    });

    return (
        <main className="mx-auto max-w-7xl px-6 py-12 md:py-16">
            {/* Header Lockup */}
            <div className="mb-10 flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-8 dark:border-zinc-800/80 sm:flex-row sm:items-end">
                <div>
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                        THE ARCHIVE COLLECTION
                    </span>
                    <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                        Garment Catalog
                    </h1>
                </div>

                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/70 px-3.5 py-1.5 font-mono text-xs font-semibold text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:text-zinc-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {data.count} SPECIMENS
                </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-10">
                <ProductFilters />
            </div>

            {/* Product Grid */}
            {data.results.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
                        {data.results.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    <ProductPagination
                        count={data.count}
                        pageSize={20}
                    />
                </>
            ) : (
                /* Minimalist Empty State */
                <div className="rounded-3xl border border-dashed border-zinc-300/80 bg-zinc-50/50 py-24 text-center dark:border-zinc-800 dark:bg-zinc-900/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                    <h3 className="mt-4 font-mono text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        [ NO SPECIMENS LOCATED ]
                    </h3>
                    <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        No archive items matched your current filter criteria.
                    </p>
                    <div className="mt-6">
                        <Link
                            href="/products"
                            className="inline-flex items-center rounded-full bg-zinc-950 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                        >
                            Reset Catalog Filter
                        </Link>
                    </div>
                </div>
            )}
        </main>
    );
}