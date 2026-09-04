import { NextRequest } from "next/server";

const BACKEND_URL =
    "http://54.236.205.212/api";


async function proxy(
    request: NextRequest,
    params: { path: string[] }
) {
    const backendPath =
        params.path.join("/");

    const query =
        request.nextUrl.search;

    // Preserve Django's trailing slash convention.
    const targetUrl =
        `${BACKEND_URL}/${backendPath}/${query}`;


    const headers =
        new Headers();

    const forwardHeaders = [
        "accept",
        "authorization",
        "content-type",
        "user-agent",
    ];

    for (const header of forwardHeaders) {
        const value =
            request.headers.get(header);

        if (value) {
            headers.set(
                header,
                value
            );
        }
    }


    let body:
        | ArrayBuffer
        | undefined;


    if (
        request.method !== "GET" &&
        request.method !== "HEAD"
    ) {
        body =
            await request.arrayBuffer();
    }


    const backendResponse =
        await fetch(
            targetUrl,
            {
                method:
                    request.method,

                headers,

                body,

                redirect:
                    "manual",

                cache:
                    "no-store",
            }
        );


    const responseHeaders =
        new Headers();

    const headersToForward = [
        "content-type",
        "location",
        "www-authenticate",
        "access-control-allow-origin",
        "access-control-allow-headers",
        "access-control-allow-methods",
    ];


    for (
        const header of headersToForward
    ) {
        const value =
            backendResponse.headers.get(
                header
            );

        if (value) {
            responseHeaders.set(
                header,
                value
            );
        }
    }


    return new Response(
        backendResponse.body,
        {
            status:
                backendResponse.status,

            statusText:
                backendResponse.statusText,

            headers:
                responseHeaders,
        }
    );
}


export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            path: string[];
        }>;
    }
) {
    return proxy(
        request,
        await params
    );
}


export async function POST(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            path: string[];
        }>;
    }
) {
    return proxy(
        request,
        await params
    );
}


export async function PUT(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            path: string[];
        }>;
    }
) {
    return proxy(
        request,
        await params
    );
}


export async function PATCH(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            path: string[];
        }>;
    }
) {
    return proxy(
        request,
        await params
    );
}


export async function DELETE(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            path: string[];
        }>;
    }
) {
    return proxy(
        request,
        await params
    );
}


export async function OPTIONS(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<{
            path: string[];
        }>;
    }
) {
    return proxy(
        request,
        await params
    );
}