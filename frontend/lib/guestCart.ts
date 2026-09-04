export type GuestCartItem = {
    variant_id: number;
    quantity: number;
};

const STORAGE_KEY = "guest_cart";


export function getGuestCart(): GuestCartItem[] {
    if (typeof window === "undefined") {
        return [];
    }

    const stored =
        localStorage.getItem(STORAGE_KEY);

    if (!stored) {
        return [];
    }

    try {
        const parsed = JSON.parse(stored);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;
    } catch {
        return [];
    }
}


export function saveGuestCart(
    items: GuestCartItem[]
) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(items)
    );
}


export function addToGuestCart(
    variantId: number,
    quantity: number
) {
    const cart =
        getGuestCart();

    const existingItem =
        cart.find(
            (item) =>
                item.variant_id ===
                variantId
        );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            variant_id: variantId,
            quantity,
        });
    }

    saveGuestCart(cart);
}


export function updateGuestCartItem(
    variantId: number,
    quantity: number
) {
    const cart =
        getGuestCart();

    const item =
        cart.find(
            (item) =>
                item.variant_id ===
                variantId
        );

    if (!item) {
        return;
    }

    item.quantity = quantity;

    saveGuestCart(cart);
}


export function removeFromGuestCart(
    variantId: number
) {
    const cart =
        getGuestCart();

    const updatedCart =
        cart.filter(
            (item) =>
                item.variant_id !==
                variantId
        );

    saveGuestCart(updatedCart);
}


export function clearGuestCart() {
    localStorage.removeItem(
        STORAGE_KEY
    );
}


export function getGuestCartCount() {
    return getGuestCart().reduce(
        (total, item) =>
            total + item.quantity,
        0
    );
}