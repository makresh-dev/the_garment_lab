const BACKEND_ORIGIN =
    "http://54.236.205.212";

export function getMediaUrl(
    imageUrl: string | null | undefined
): string {
    if (!imageUrl) {
        return "";
    }

    // Already a same-origin URL
    if (
        imageUrl.startsWith("/")
    ) {
        return imageUrl;
    }

    // Convert Django's absolute media URL
    // into the Vercel same-origin media proxy.
    if (
        imageUrl.startsWith(
            `${BACKEND_ORIGIN}/media/`
        )
    ) {
        return imageUrl.replace(
            `${BACKEND_ORIGIN}/media`,
            "/media"
        );
    }

    return imageUrl;
}