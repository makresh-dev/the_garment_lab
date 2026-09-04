import Link from "next/link";
import { getProduct } from "@/lib/api";
import { getMediaUrl } from "@/lib/media";
import ProductPurchase from "@/components/ProductPurchase";

type ProductPageProps = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductPage({
    params,
}: ProductPageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    const displayPrice =
        product.discount_price ?? product.price;

    const hasDiscount =
        Boolean(product.discount_price);

    let discountPercent = 0;

    if (
        hasDiscount &&
        Number(product.price) > 0
    ) {
        discountPercent =
            Math.round(
                (
                    (
                        Number(product.price) -
                        Number(product.discount_price)
                    ) /
                    Number(product.price)
                ) * 100
            );
    }

    return (
        <main className="mx-auto max-w-7xl px-6 py-10 md:py-16">

            {/* Breadcrumb Navigation */}

            <nav className="mb-8 flex items-center gap-2 font-mono text-xs text-zinc-400 dark:text-zinc-500">

                <Link
                    href="/"
                    className="transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                    ARCHIVE
                </Link>

                <span>/</span>

                <Link
                    href="/products"
                    className="transition-colors hover:text-zinc-900 dark:hover:text-white"
                >
                    CATALOG
                </Link>

                <span>/</span>

                <span className="truncate uppercase text-zinc-800 dark:text-zinc-200">
                    {product.name}
                </span>

            </nav>


            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">

                {/* Left: Gallery Showcase */}

                <div className="lg:col-span-7">

                    <div className="sticky top-24 space-y-4">

                        <div className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-100 dark:border-zinc-800/80 dark:bg-[#121215]">

                            {product.images.length > 0 ? (

                                <img
                                    src={getMediaUrl(
                                        product.images[0].image
                                    )}
                                    alt={
                                        product.images[0].alt_text ||
                                        product.name
                                    }
                                    className="h-full w-full object-cover"
                                />

                            ) : (

                                <div className="flex h-full flex-col items-center justify-center p-8 text-center">

                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.25"
                                        className="h-12 w-12 text-zinc-300 dark:text-zinc-700"
                                    >
                                        <rect
                                            width="18"
                                            height="18"
                                            x="3"
                                            y="3"
                                            rx="2"
                                        />

                                        <circle
                                            cx="9"
                                            cy="9"
                                            r="2"
                                        />

                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                                    </svg>

                                    <span className="mt-3 font-mono text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                                        [ NO IMAGE ARCHIVED ]
                                    </span>

                                </div>
                            )}


                            {/* Specimen watermark */}

                            <div className="absolute bottom-4 left-4 rounded-full border border-zinc-200/60 bg-white/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-zinc-600 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-900/80 dark:text-zinc-400">
                                SPECIMEN // {product.slug}
                            </div>

                        </div>

                    </div>

                </div>


                {/* Right: Purchase Lockup */}

                <div className="lg:col-span-5">

                    <div className="space-y-8">

                        {/* Title & Brand */}

                        <div className="border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80">

                            <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                                {product.brand ||
                                    "THE GARMENT LAB"}
                            </span>


                            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
                                {product.name}
                            </h1>


                            {/* Pricing */}

                            <div className="mt-5 flex items-baseline gap-3">

                                <span className="font-mono text-3xl font-bold tracking-tight text-zinc-950 dark:text-white">
                                    ₹{displayPrice}
                                </span>

                                {hasDiscount && (
                                    <>
                                        <span className="font-mono text-base text-zinc-400 line-through dark:text-zinc-600">
                                            ₹{product.price}
                                        </span>

                                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                            SAVE {discountPercent}%
                                        </span>
                                    </>
                                )}

                            </div>


                            <p className="mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                                Inclusive of all standard taxes and archival packaging.
                            </p>

                        </div>


                        {/* Description */}

                        {product.description && (

                            <div>

                                <h3 className="font-mono text-xs uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                                    GARMENT OVERVIEW
                                </h3>

                                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                                    {product.description}
                                </p>

                            </div>

                        )}


                        {/* Interactive Purchase Selector */}

                        <div className="rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-6 dark:border-zinc-800/80 dark:bg-[#121215]/60">

                            <ProductPurchase
                                variants={
                                    product.variants
                                }
                            />

                        </div>


                        {/* Garment Specifications */}

                        <div className="divide-y divide-zinc-200/80 border-y border-zinc-200/80 font-mono text-xs dark:divide-zinc-800/80 dark:border-zinc-800/80">

                            <div className="flex justify-between py-3.5">

                                <span className="text-zinc-400 dark:text-zinc-500">
                                    01 // TEXTILE
                                </span>

                                <span className="text-zinc-800 dark:text-zinc-200">
                                    Heavyweight Combed Cotton
                                </span>

                            </div>


                            <div className="flex justify-between py-3.5">

                                <span className="text-zinc-400 dark:text-zinc-500">
                                    02 // SILHOUETTE
                                </span>

                                <span className="text-zinc-800 dark:text-zinc-200">
                                    Architectural Relaxed Cut
                                </span>

                            </div>


                            <div className="flex justify-between py-3.5">

                                <span className="text-zinc-400 dark:text-zinc-500">
                                    03 // ORIGIN
                                </span>

                                <span className="text-zinc-800 dark:text-zinc-200">
                                    The Garment Lab Studio
                                </span>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </main>
    );
}