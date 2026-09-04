export const dynamic = "force-dynamic";

import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";
import { getMediaUrl } from "@/lib/media";


export default async function HomePage() {
  let featuredProducts: any[] = [];

  try {
    const data = await getProducts();
    featuredProducts = data.results.slice(0, 4);
  } catch (error) {
    console.error(
      "Unable to load products:",
      error
    );
  }

  return (
    <main className="min-h-screen">

      {/* Hero Section */}

      <section className="relative overflow-hidden border-b border-zinc-200/80 bg-gradient-to-b from-white via-zinc-50/50 to-white py-20 dark:border-zinc-800/80 dark:from-[#09090b] dark:via-zinc-900/30 dark:to-[#09090b] md:py-32">

        <div className="mx-auto max-w-7xl px-6">

          <div className="grid items-center gap-12 lg:grid-cols-12">

            <div className="lg:col-span-7">

              {/* Category Pill */}

              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-zinc-600 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-400">

                <span className="h-1.5 w-1.5 rounded-full bg-zinc-900 dark:bg-white" />

                COLLECTION // FW26 SPECIMENS

              </div>


              <h1 className="mt-6 text-4xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-6xl sm:leading-[1.08]">

                ENGINEERED
                <br />

                <span className="font-light text-zinc-400 dark:text-zinc-500">
                  SILHOUETTES.
                </span>

              </h1>


              <p className="mt-6 max-w-xl text-base leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-lg">

                Precision craftsmanship, architectural drape, and tactile finishes. Designed for everyday utility, structured comfort, and quiet distinction.

              </p>


              <div className="mt-8 flex flex-wrap items-center gap-4 sm:gap-6">

                <Link
                  href="/products"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-zinc-950 px-8 py-4 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-zinc-800 hover:shadow-lg dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                >
                  Explore Archive

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z"
                      clipRule="evenodd"
                    />
                  </svg>

                </Link>


                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white px-7 py-4 text-xs font-semibold uppercase tracking-wider text-zinc-800 transition-all duration-200 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-300 dark:hover:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  Client Portal
                </Link>

              </div>

            </div>


            {/* Visual Specimen Card */}

            <div className="lg:col-span-5">

              <div className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-100/70 p-6 backdrop-blur-sm dark:border-zinc-800/80 dark:bg-zinc-900/40">

                <div className="flex items-center justify-between border-b border-zinc-200/60 pb-4 text-[11px] font-mono text-zinc-500 dark:border-zinc-800/60 dark:text-zinc-400">

                  <span>
                    SPECIMEN LAB // 01
                  </span>

                  <span>
                    EST. 2026
                  </span>

                </div>


                <div className="my-6 aspect-[4/3] overflow-hidden rounded-xl bg-zinc-200/60 dark:bg-zinc-800/60">

                  {featuredProducts[0]?.images?.[0] ? (

                    <img
                      src={getMediaUrl(
                        featuredProducts[0]
                          .images[0]
                          .image
                      )}
                      alt={
                        featuredProducts[0]
                          .name
                      }
                      className="h-full w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-full flex-col items-center justify-center p-6 text-center">

                      <span className="font-mono text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                        [ ARCHIVAL EDITORIAL ]
                      </span>

                      <p className="mt-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                        The Garment Lab Studio
                      </p>

                    </div>

                  )}

                </div>


                <div className="space-y-1.5 pt-2">

                  <div className="flex items-center justify-between text-xs">

                    <span className="font-semibold text-zinc-900 dark:text-white">
                      {featuredProducts[0]?.name ||
                        "Structured Outerwear"}
                    </span>

                    <span className="font-mono font-medium text-zinc-600 dark:text-zinc-400">
                      ₹
                      {featuredProducts[0]?.price ||
                        "950"}
                    </span>

                  </div>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-500">
                    Heavyweight tailored cotton / Reinforced seams
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* Specimen Values Bar */}

      <section className="border-b border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-[#09090b]">

        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-y divide-zinc-200/60 border-x border-zinc-200/60 dark:divide-zinc-800/60 dark:border-zinc-800/60 md:grid-cols-4 md:divide-x md:divide-y-0">

          <div className="p-6 md:p-8">

            <span className="font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-600">
              01 // LOGISTICS
            </span>

            <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
              Complimentary Shipping
            </p>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              All qualifying domestic deliveries
            </p>

          </div>


          <div className="p-6 md:p-8">

            <span className="font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-600">
              02 // ESCROW
            </span>

            <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
              Flexible Settlement
            </p>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Cash on delivery or verified UPI
            </p>

          </div>


          <div className="p-6 md:p-8">

            <span className="font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-600">
              03 // QUALITY
            </span>

            <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
              7-Day Returns
            </p>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Hassle-free sizing exchanges
            </p>

          </div>


          <div className="p-6 md:p-8">

            <span className="font-mono text-[10px] font-semibold text-zinc-400 dark:text-zinc-600">
              04 // SECURITY
            </span>

            <p className="mt-2 text-sm font-bold text-zinc-900 dark:text-white">
              Verified Authenticity
            </p>

            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              Lab-tested garments & textiles
            </p>

          </div>

        </div>

      </section>


      {/* Featured Products Grid */}

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">

        <div className="flex flex-col justify-between gap-4 border-b border-zinc-200/80 pb-6 dark:border-zinc-800/80 sm:flex-row sm:items-end">

          <div>

            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
              CURATED ARCHIVE // 01
            </span>

            <h2 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-3xl">
              Featured Specimens
            </h2>

          </div>


          <Link
            href="/products"
            className="group inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
          >
            Explore Entire Archive

            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>

          </Link>

        </div>


        <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">

          {featuredProducts.map(
            (product: any) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            )
          )}

        </div>

      </section>


      {/* Brand Manifesto */}

      <section className="border-t border-zinc-200/80 bg-zinc-50/50 py-20 dark:border-zinc-800/80 dark:bg-zinc-900/20">

        <div className="mx-auto max-w-3xl px-6 text-center">

          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600">
            THE GARMENT LAB PHILOSOPHY
          </span>


          <h3 className="mt-4 text-2xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-3xl">
            "Form follows precision. Garments built to outlast trend cycles."
          </h3>


          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            We focus on silhouette, structural balance, and textile density so every piece delivers an enduring staple in your rotation.
          </p>


          <div className="mt-8">

            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-900 transition-all hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
            >
              Browse The Collection
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}