import { NextResponse } from "next/server";
import { getOriginalUrl } from "../../../lib/linkStore";

/**
 * Redirects the user to the original URL associated with the short code.
 *
 * @param request - The incoming request object.
 * @param root0 - The route parameters object.
 * @param root0.params - The parameters promise.
 * @returns A redirect response or an error JSON.
 */
export async function GET(request: Request, { params }) {
  const { code } = (await params) || { code: "" };
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const original = getOriginalUrl(code);
  if (!original) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.redirect(original);
}
