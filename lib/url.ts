import { NextRequest } from "next/server";

export function getAppUrl(request?: NextRequest | Request): string
{
    // 1. Prefer environment variable if set (most reliable for production/tunnels)
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
    }

    // 2. Fallback to extracting from request headers
    if (request) {
        const headers = request.headers;
        const host = headers.get("x-forwarded-host") || headers.get("host");
        const proto = headers.get("x-forwarded-proto") || "http";
        if (host) {
            return `${proto}://${host}`;
        }
    }

    // 3. Fallback to localhost if all else fails
    return "http://localhost:3000";
}
