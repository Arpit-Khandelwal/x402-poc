import { NextResponse } from "next/server";
import { createShortLink } from "../../../lib/linkStore";
import { getAppUrl } from "../../../lib/url";

/**
 * Creates a new short link from the provided form data.
 * Protected by strict payment middleware.
 *
 * @param request - The incoming request object.
 * @returns A redirect to the result page or an error JSON.
 */
export async function POST(request: Request)
{
  // This route is intended to be protected by the payment middleware defined in `middleware.ts`.
  // The middleware should enforce payment before reaching this handler.

  try {
    const formData = await request.formData();
    const url = String(formData.get("url") || "").trim();
    if (!url) {
      return NextResponse.json({ error: "Missing url" }, { status: 400 });
    }

    // Create short code and store mapping
    const code = createShortLink(url);

    // Redirect to a result page that will display the shortened link.
    // Include the original URL (encoded) as a query param as a fallback so the
    // result page can show the original immediately without relying on the
    // in-memory store (which may be inaccessible if middleware ran in a different runtime).
    const encoded = encodeURIComponent(url);
    const baseUrl = getAppUrl(request) || request.url;
    const redirectUrl = new URL(`/protected/result?code=${code}&u=${encoded}`, baseUrl);
    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.json({ error: "Failed to create short link" }, { status: 500 });
  }
}
