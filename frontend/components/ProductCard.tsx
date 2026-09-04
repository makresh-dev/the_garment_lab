"use client";

import Link from "next/link";
import {
    useEffect,
    useRef,
    useState,
} from "react";

import { getMediaUrl } from "@/lib/media";


type ProductImage = {
    id: number;
    image: string;
    alt_text: string;
    is_primary: boolean;
};


type Product = {
    id: number;
    name: string;
    slug: string;
    brand: string;
    price: string;
    discount_price: string | null;
    images: ProductImage[];
};


type ProductCardProps = {
    product: Product;
};


export default function ProductCard({
    product,
}: ProductCardProps) {

    const images = product.images ?? [];

    const [currentImage, setCurrentImage] =
        useState(0);

    const [isHovered, setIsHovered] =
        useState(false);

    const [isMobilePlaying, setIsMobilePlaying] =
        useState(false);

    const touchStartX =
        useRef<number | null>(null);


    const hasImages =
        images.length > 0;

    const hasMultipleImages =
        images.length > 1;


    // ---------------------------------------------------------
    // Carousel playback state
    // Desktop:
    //   hover → play
    //
    // Mobile:
    //   tap image → toggle play
    // ---------------------------------------------------------

    const isPlaying =
        isHovered || isMobilePlaying;


    // ---------------------------------------------------------
    // Automatic carousel
    // ---------------------------------------------------------

    useEffect(() => {

        if (
            !hasMultipleImages ||
            !isPlaying
        ) {
            return;
        }


        const interval =
            window.setInterval(() => {

                setCurrentImage(
                    (current) =>
                        (current + 1) %
                        images.length
                );

            }, 3000);


        return () => {
            window.clearInterval(
                interval
            );
        };

    }, [
        hasMultipleImages,
        isPlaying,
        images.length,
    ]);


    // ---------------------------------------------------------
    // Desktop hover
    // ---------------------------------------------------------

    function handleMouseEnter() {
        setIsHovered(true);
    }


    function handleMouseLeave() {
        setIsHovered(false);
    }


    // ---------------------------------------------------------
    // Mobile tap
    // ---------------------------------------------------------

    function handleImageTap(
        event: React.MouseEvent<HTMLDivElement>
    ) {
        // Only use tap behavior on devices that
        // support coarse pointers (touch devices).
        if (
            window.matchMedia(
                "(pointer: coarse)"
            ).matches
        ) {
            setIsMobilePlaying(
                (playing) => !playing
            );
        }

        event.stopPropagation();
    }


    // ---------------------------------------------------------
    // Touch swipe
    // ---------------------------------------------------------

    function handleTouchStart(
        event: React.TouchEvent<HTMLDivElement>
    ) {
        touchStartX.current =
            event.touches[0].clientX;
    }


    function handleTouchEnd(
        event: React.TouchEvent<HTMLDivElement>
    ) {
        if (
            touchStartX.current === null ||
            !hasMultipleImages
        ) {
            return;
        }


        const touchEndX =
            event.changedTouches[0].clientX;

        const deltaX =
            touchEndX -
            touchStartX.current;

        const swipeThreshold =
            40;


        if (
            Math.abs(deltaX) >=
            swipeThreshold
        ) {

            if (deltaX < 0) {
                setCurrentImage(
                    (current) =>
                        (current + 1) %
                        images.length
                );
            } else {
                setCurrentImage(
                    (current) =>
                        (
                            current -
                            1 +
                            images.length
                        ) %
                        images.length
                );
            }

        }


        touchStartX.current = null;
    }


    // ---------------------------------------------------------
    // Manual navigation
    // ---------------------------------------------------------

    function showNextImage(
        event: React.MouseEvent
    ) {
        event.preventDefault();
        event.stopPropagation();

        setCurrentImage(
            (current) =>
                (current + 1) %
                images.length
        );
    }


    function showPreviousImage(
        event: React.MouseEvent
    ) {
        event.preventDefault();
        event.stopPropagation();

        setCurrentImage(
            (current) =>
                (
                    current -
                    1 +
                    images.length
                ) %
                images.length
        );
    }


    function showImage(
        index: number,
        event: React.MouseEvent
    ) {
        event.preventDefault();
        event.stopPropagation();

        setCurrentImage(index);
    }


    // ---------------------------------------------------------
    // Pricing
    // ---------------------------------------------------------

    const displayPrice =
        product.discount_price ??
        product.price;


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
        <Link
            href={`/products/${product.slug}`}
            className="group relative block focus:outline-none"
            onMouseEnter={
                handleMouseEnter
            }
            onMouseLeave={
                handleMouseLeave
            }
        >

            <article className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/40 dark:border-zinc-800/80 dark:bg-[#121215] dark:hover:border-zinc-700 dark:hover:shadow-none">


                {/* -------------------------------------------------
                    Image Container
                ------------------------------------------------- */}

                <div
                    className="relative aspect-[3/4] overflow-hidden bg-zinc-100 dark:bg-zinc-900"
                    onClick={
                        handleImageTap
                    }
                    onTouchStart={
                        handleTouchStart
                    }
                    onTouchEnd={
                        handleTouchEnd
                    }
                >

                    {hasImages ? (

                        <>

                            {/* Product Image */}

                            <img
                                key={
                                    images[
                                        currentImage
                                    ].id
                                }
                                src={getMediaUrl(
                                    images[
                                        currentImage
                                    ].image
                                )}
                                alt={
                                    images[
                                        currentImage
                                    ].alt_text ||
                                    product.name
                                }
                                draggable={false}
                                className="h-full w-full select-none object-cover transition-opacity duration-500"
                            />


                            {/* -------------------------------------------------
                                Previous / Next
                            ------------------------------------------------- */}

                            {hasMultipleImages && (

                                <>

                                    <button
                                        type="button"
                                        aria-label="Previous image"
                                        onClick={
                                            showPreviousImage
                                        }
                                        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:bg-black/60 group-hover:opacity-100"
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M11.78 14.53a.75.75 0 0 1-1.06.02l-5-4.75a.75.75 0 0 1 0-1.08l5-4.75a.75.75 0 1 1 1.04 1.08L7.31 9.26l4.47 4.25a.75.75 0 0 1 1.02.02Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>

                                    </button>


                                    <button
                                        type="button"
                                        aria-label="Next image"
                                        onClick={
                                            showNextImage
                                        }
                                        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/40 text-white opacity-0 backdrop-blur-md transition-all duration-200 hover:bg-black/60 group-hover:opacity-100"
                                    >

                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            className="h-4 w-4"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8.22 5.47a.75.75 0 0 1 1.06-.02l5 4.75a.75.75 0 0 1 0 1.08l-5 4.75a.75.75 0 1 1-1.04 1.08l4.44-4.25-4.44-4.25a.75.75 0 0 1-.02-1.06Z"
                                                clipRule="evenodd"
                                            />
                                        </svg>

                                    </button>

                                </>

                            )}


                            {/* -------------------------------------------------
                                Carousel Indicators
                            ------------------------------------------------- */}

                            {hasMultipleImages && (

                                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/30 px-2.5 py-1.5 backdrop-blur-md">

                                    {images.map(
                                        (
                                            image,
                                            index
                                        ) => (

                                            <button
                                                key={
                                                    image.id
                                                }
                                                type="button"
                                                aria-label={`View image ${index + 1}`}
                                                onClick={(
                                                    event
                                                ) =>
                                                    showImage(
                                                        index,
                                                        event
                                                    )
                                                }
                                                className={`h-1.5 rounded-full transition-all duration-300 ${index ===
                                                    currentImage
                                                    ? "w-4 bg-white"
                                                    : "w-1.5 bg-white/50 hover:bg-white/80"
                                                    }`}
                                            />

                                        )
                                    )}

                                </div>

                            )}


                            {/* -------------------------------------------------
                                Image Counter
                            ------------------------------------------------- */}

                            {hasMultipleImages && (

                                <div className="absolute left-3 top-3 z-10 rounded-full bg-black/40 px-2 py-1 font-mono text-[9px] font-semibold text-white backdrop-blur-md">

                                    {currentImage + 1}
                                    {" / "}
                                    {images.length}

                                </div>

                            )}

                        </>

                    ) : (

                        /* -------------------------------------------------
                           No Image
                        ------------------------------------------------- */

                        <div className="flex h-full flex-col items-center justify-center p-4 text-center">

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.25"
                                className="h-8 w-8 text-zinc-300 dark:text-zinc-700"
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

                            <span className="mt-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                                SPECIMEN ARCHIVE
                            </span>

                        </div>

                    )}


                    {/* -------------------------------------------------
                        Discount Badge
                    ------------------------------------------------- */}

                    {hasDiscount &&
                        discountPercent > 0 && (

                            <div className="absolute right-3 top-3 z-20 rounded-full bg-zinc-950/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-md dark:bg-white/90 dark:text-zinc-950">

                                -{discountPercent}%

                            </div>

                        )}

                </div>


                {/* -------------------------------------------------
                    Product Information
                ------------------------------------------------- */}

                <div className="p-4 sm:p-5">

                    <div className="flex items-center justify-between">

                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">

                            {product.brand ||
                                "THE GARMENT LAB"}

                        </p>

                    </div>


                    <h2 className="mt-1.5 line-clamp-1 text-sm font-semibold tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-white dark:group-hover:text-zinc-300">

                        {product.name}

                    </h2>


                    <div className="mt-2.5 flex items-baseline gap-2">

                        <span className="font-mono text-sm font-bold text-zinc-950 dark:text-white">

                            ₹{displayPrice}

                        </span>


                        {product.discount_price && (

                            <span className="font-mono text-xs text-zinc-400 line-through dark:text-zinc-600">

                                ₹{product.price}

                            </span>

                        )}

                    </div>

                </div>

            </article>

        </Link>
    );
}