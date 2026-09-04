import Link from "next/link";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function OrderSuccessPage({
    params,
}: PageProps) {
    const { id } = await params;

    return (
        <main className="mx-auto max-w-xl px-6 py-16 md:py-24">
            <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-8 text-center dark:border-zinc-800/80 dark:bg-[#121215] sm:p-12">
                {/* Minimalist Checkmark Node */}
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-6 w-6"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>

                <span className="mt-6 block font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-500">
                    CONFIRMATION SPECIMEN
                </span>

                <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
                    Order Recorded
                </h1>

                <p className="mt-2 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                    Thank you. Your garment reservation has been placed into our archival queue for fulfillment.
                </p>

                {/* Receipt Pill */}
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-zinc-50/70 px-4 py-2 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900/50">
                    <span className="text-zinc-400">SPECIMEN RECORD //</span>
                    <span className="font-bold text-zinc-900 dark:text-white">#{id}</span>
                </div>

                <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        href={`/orders/${id}`}
                        className="w-full rounded-2xl bg-zinc-950 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 sm:w-auto"
                    >
                        Track Order Status →
                    </Link>

                    <Link
                        href="/products"
                        className="w-full rounded-2xl border border-zinc-200/80 bg-white px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-wider text-zinc-800 transition-all hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:w-auto"
                    >
                        Explore Catalog
                    </Link>
                </div>
            </div>
        </main>
    );
}