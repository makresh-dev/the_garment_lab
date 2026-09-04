// ---------------------------------------------------------
// API base URLs
// ---------------------------------------------------------
//
// Browser:
//   /api-backend
//   → Next.js proxy
//   → http://54.236.205.212/api/
//
// Server (Vercel):
//   BACKEND_API_URL
//   → http://54.236.205.212/api
//
// This keeps browser requests same-origin and prevents the
// HTTPS frontend from directly calling the HTTP EC2 API.
// ---------------------------------------------------------

const CLIENT_API_URL = "/api-backend";


function getApiBaseUrl(): string {
    // Browser / client-side requests
    if (typeof window !== "undefined") {
        return CLIENT_API_URL;
    }

    // Server-side requests
    const serverApiUrl =
        process.env.BACKEND_API_URL?.replace(
            /\/+$/,
            ""
        );

    if (!serverApiUrl) {
        throw new Error(
            "BACKEND_API_URL is not configured for server-side API requests."
        );
    }

    return serverApiUrl;
}


// ---------------------------------------------------------
// Authentication
// ---------------------------------------------------------

function getAccessToken(): string | null {
    if (typeof window === "undefined") {
        return null;
    }

    return localStorage.getItem(
        "access_token"
    );
}


// ---------------------------------------------------------
// Authenticated fetch
// ---------------------------------------------------------

async function authenticatedFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token =
        getAccessToken();

    if (!token) {
        throw new Error(
            "Authentication required. Please log in again."
        );
    }

    return fetch(
        url,
        {
            ...options,

            headers: {
                ...(options.body
                    ? {
                        "Content-Type":
                            "application/json",
                    }
                    : {}),

                Authorization:
                    `Bearer ${token}`,

                ...options.headers,
            },
        }
    );
}


// ---------------------------------------------------------
// Products
// ---------------------------------------------------------

export async function getProducts(
    params: {
        search?: string;
        category?: string;
        min_price?: string;
        max_price?: string;
        ordering?: string;
        page?: number;
    } = {}
) {
    const API_URL =
        getApiBaseUrl();

    const searchParams =
        new URLSearchParams();

    if (params.search) {
        searchParams.set(
            "search",
            params.search
        );
    }

    if (params.category) {
        searchParams.set(
            "category",
            params.category
        );
    }

    if (params.min_price) {
        searchParams.set(
            "min_price",
            params.min_price
        );
    }

    if (params.max_price) {
        searchParams.set(
            "max_price",
            params.max_price
        );
    }

    if (params.ordering) {
        searchParams.set(
            "ordering",
            params.ordering
        );
    }

    if (params.page) {
        searchParams.set(
            "page",
            String(params.page)
        );
    }

    const query =
        searchParams.toString();

    const url = query
        ? `${API_URL}/products/?${query}`
        : `${API_URL}/products/`;

    let response: Response;

    try {
        response = await fetch(
            url,
            {
                cache: "no-store",
            }
        );
    } catch (error) {
        throw new Error(
            `Unable to reach products API at ${url}: ${error instanceof Error
                ? error.message
                : "Network request failed"
            }`
        );
    }

    const body =
        await response.text();

    if (!response.ok) {
        throw new Error(
            `Products API returned ${response.status} ${response.statusText}: ${body.slice(
                0,
                500
            )}`
        );
    }

    try {
        return JSON.parse(
            body
        );
    } catch {
        throw new Error(
            `Products API returned invalid JSON: ${body.slice(
                0,
                500
            )}`
        );
    }
}


// ---------------------------------------------------------
// Single product
// ---------------------------------------------------------

export async function getProduct(
    slug: string
) {
    const API_URL =
        getApiBaseUrl();

    const url =
        `${API_URL}/products/${encodeURIComponent(
            slug
        )}/`;

    let response: Response;

    try {
        response = await fetch(
            url,
            {
                cache: "no-store",
            }
        );
    } catch (error) {
        throw new Error(
            `Unable to reach product API at ${url}: ${error instanceof Error
                ? error.message
                : "Network request failed"
            }`
        );
    }

    const body =
        await response.text();

    if (!response.ok) {
        throw new Error(
            `Product API returned ${response.status} ${response.statusText}: ${body.slice(
                0,
                500
            )}`
        );
    }

    try {
        return JSON.parse(
            body
        );
    } catch {
        throw new Error(
            `Product API returned invalid JSON: ${body.slice(
                0,
                500
            )}`
        );
    }
}


// ---------------------------------------------------------
// Cart
// ---------------------------------------------------------

export async function getCart() {
    const API_URL =
        getApiBaseUrl();

    const response =
        await authenticatedFetch(
            `${API_URL}/cart/`
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to fetch cart"
        );
    }

    return data;
}


export async function updateCartItem(
    itemId: number,
    quantity: number
) {
    const API_URL =
        getApiBaseUrl();

    const response =
        await authenticatedFetch(
            `${API_URL}/cart/items/${itemId}/`,
            {
                method: "PATCH",

                body: JSON.stringify({
                    quantity,
                }),
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to update cart"
        );
    }

    return data;
}


export async function removeCartItem(
    itemId: number
) {
    const API_URL =
        getApiBaseUrl();

    const response =
        await authenticatedFetch(
            `${API_URL}/cart/items/${itemId}/remove/`,
            {
                method: "DELETE",
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to remove item"
        );
    }

    return data;
}


// ---------------------------------------------------------
// Checkout
// ---------------------------------------------------------

export async function createCheckout(
    checkoutData: {
        shipping_name: string;
        shipping_phone: string;
        shipping_address: string;
        shipping_city: string;
        shipping_state: string;
        shipping_postal_code: string;
        payment_method:
        | "cod"
        | "upi";
    }
) {
    const API_URL =
        getApiBaseUrl();

    const response =
        await authenticatedFetch(
            `${API_URL}/orders/checkout/`,
            {
                method: "POST",

                body: JSON.stringify(
                    checkoutData
                ),
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Checkout failed"
        );
    }

    return data;
}


// ---------------------------------------------------------
// Orders
// ---------------------------------------------------------

export async function getOrders() {
    const API_URL =
        getApiBaseUrl();

    const response =
        await authenticatedFetch(
            `${API_URL}/orders/`
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to fetch orders"
        );
    }

    return data;
}


export async function getOrder(
    orderId: number
) {
    const API_URL =
        getApiBaseUrl();

    const response =
        await authenticatedFetch(
            `${API_URL}/orders/${orderId}/`
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to fetch order"
        );
    }

    return data;
}


// ---------------------------------------------------------
// Guest cart
// ---------------------------------------------------------

export async function getGuestCart(
    items: {
        variant_id: number;
        quantity: number;
    }[]
) {
    const API_URL =
        getApiBaseUrl();

    const response =
        await fetch(
            `${API_URL}/cart/guest/`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    items,
                }),
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to load guest cart"
        );
    }

    return data;
}


// ---------------------------------------------------------
// Merge guest cart
// ---------------------------------------------------------

export async function mergeGuestCart(
    items: {
        variant_id: number;
        quantity: number;
    }[]
) {
    const API_URL =
        getApiBaseUrl();

    const response =
        await authenticatedFetch(
            `${API_URL}/cart/merge/`,
            {
                method: "POST",

                body: JSON.stringify({
                    items,
                }),
            }
        );

    const data =
        await response.json();

    if (!response.ok) {
        throw new Error(
            data.error ||
            "Failed to merge guest cart"
        );
    }

    return data;
}