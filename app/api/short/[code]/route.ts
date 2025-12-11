import { NextResponse } from "next/server";
import { getOriginalUrl } from "../../../../lib/linkStore";

/**
 * Retrieves the original URL for a given short code.
 *
 * @param request - The incoming request object.
 * @param root0 - The route parameters object.
 * @param root0.params - The parameters promise causing the async behavior.
 * @returns A JSON response containing the original URL or an error.
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

  return NextResponse.json({ original }, { status: 200 });
}
