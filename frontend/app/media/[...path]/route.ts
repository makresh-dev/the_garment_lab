import { NextRequest } from "next/server";

const MEDIA_BASE_URL =
    "http://54.236.205.212/media";

type RouteContext = {
    params: Promise<{
        path: string[];
    }>;
};

async function proxyMedia(
    request: NextRequest,
    context: RouteContext
) {
    const { path } =
        await context.params;

    const mediaPath =
        path.join("/");

    const targetUrl =
        `${MEDIA_BASE_URL}/${mediaPath}`;

    const response =
        await fetch(targetUrl, {
            cache: "no-store",
        });

    if (!response.ok) {
        return new Response(
            "Media not found",
            {
                status:
                    response.status,
            }
        );
    }

    const headers =
        new Headers();

    const contentType =
        response.headers.get(
            "content-type"
        );

    if (contentType) {
        headers.set(
            "content-type",
            contentType
        );
    }

    const cacheControl =
        response.headers.get(
            "cache-control"
        );

    if (cacheControl) {
        headers.set(
            "cache-control",
            cacheControl
        );
    }

    return new Response(
        response.body,
        {
            status: response.status,
            headers,
        }
    );
}

export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    return proxyMedia(
        request,
        context
    );
}