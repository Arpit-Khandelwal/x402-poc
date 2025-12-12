import { NextRequest, NextResponse } from "next/server";
import { Address } from "viem";
import { Network, paymentMiddleware, Resource } from "x402-next";
import { getAppUrl } from "../../../lib/url";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const network = process.env.NETWORK as Network;

/**
 * Handles explicit requests to buy credits.
 * Usage: Button in UI links to this.
 *
 * @param request - The incoming request.
 * @returns Redirect to /chat on success, or Paywall HTML (redirect to facilitator) on 402.
 */
export async function GET(request: NextRequest)
{
  try {
    // Check for paymentToken in query params (redirected from facilitator)
    const url = new URL(request.url);
    const paymentToken = url.searchParams.get("paymentToken");

    const middlewareFn = paymentMiddleware(
      payTo,
      {
        // Verify payment for "/api/buy-credits"
        // This matches the actual URL of this endpoint so redirection works naturally
        "/api/buy-credits": {
          price: "$0.01",
          network,
          config: {
            description: "5 Message Credits",
          },
        },
        // Also accept tokens mistakenly issued for /chat or /buy-credits (legacy) just in case
        "/chat": {
          price: "$0.01",
          network,
          config: {
            description: "5 Message Credits",
          },
        },
      },
      {
        url: facilitatorUrl,
      },
    );

    // Use the actual request URL (/api/buy-credits)
    let middlewareRequest = request;

    // Inject token if found in query params
    if (paymentToken) {
      const headers = new Headers(request.headers);
      headers.set("x-payment-token", paymentToken);
      middlewareRequest = new NextRequest(request.url, {
        headers: headers,
      });
    }

    // Fix: Force the correct public URL origin if available (fixes localhost redirect issues)
    const appUrl = getAppUrl(request);
    if (appUrl) {
      const publicUrl = new URL(middlewareRequest.url);
      const outputUrl = new URL(appUrl);
      publicUrl.protocol = outputUrl.protocol;
      publicUrl.host = outputUrl.host;
      publicUrl.port = outputUrl.port;

      console.log(`[DEBUG] Fixing URL: ${middlewareRequest.url} -> ${publicUrl.toString()}`);

      const newHeaders = new Headers(middlewareRequest.headers);
      newHeaders.set("Host", outputUrl.host);
      newHeaders.set("X-Forwarded-Host", outputUrl.host);
      newHeaders.set("X-Forwarded-Proto", outputUrl.protocol.replace(":", ""));

      middlewareRequest = new NextRequest(publicUrl.toString(), {
        headers: newHeaders,
        method: middlewareRequest.method,
        body: middlewareRequest.body,
      });
    }

    const paymentResponse = await middlewareFn(middlewareRequest);

    // If payment is required (402), return it (this renders the paywall/redirect)
    if (
      paymentResponse &&
      typeof paymentResponse.status === "number" &&
      paymentResponse.status >= 400
    ) {
      return paymentResponse;
    }

    // Authentication/Payment Successful

    // Grant credits
    const baseUrl = getAppUrl(request) || request.url;
    const nextResponse = NextResponse.redirect(new URL("/chat", baseUrl));

    nextResponse.cookies.set("message_credits", "5", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Persist payment token for client to use (optional, but good for completeness)
    if (paymentToken) {
      nextResponse.cookies.set("x402-payment-token", paymentToken, {
        httpOnly: false,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    return nextResponse;
  } catch (error) {
    console.error("Error in GET /api/buy-credits:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
