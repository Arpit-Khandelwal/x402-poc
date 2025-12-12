import { GoogleGenAI } from "@google/genai";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { Address } from "viem";
import { Network, paymentMiddleware, Resource } from "x402-next";
import { getAppUrl } from "../../../lib/url";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const network = process.env.NETWORK as Network;

/**
 * Handles the chat request ensuring payment is made.
 * Grants 5 message credits per payment.
 *
 * @param request - The incoming request object.
 * @returns The JSON response or payment requirement.
 */
export async function POST(request: NextRequest)
{
  try {
    const { message } = await request.json();
    const cookieStore = await cookies();
    let credits = parseInt(cookieStore.get("message_credits")?.value || "0");
    console.log(
      `[DEBUG_POST_CHAT] Cookie 'message_credits': ${cookieStore.get("message_credits")?.value}`,
    );
    console.log(`[DEBUG_POST_CHAT] Parsed credits: ${credits}`);
    console.log(
      `[DEBUG_POST_CHAT] All Cookies: ${cookieStore
        .getAll()
        .map(c => c.name)
        .join(", ")}`,
    );
    let paymentResponse;

    if (credits > 0) {
      // User has credits, decrement and skip checking payment again
      credits--;
    } else {
      // Check payment only when user has no credits
      const middlewareFn = paymentMiddleware(
        payTo,
        {
          "/api/chat": {
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

      // Fix: Force the correct public URL origin for POST requests too
      const appUrl = getAppUrl(request);
      let middlewareRequest = request;

      if (appUrl) {
        const publicUrl = new URL(request.url);
        const outputUrl = new URL(appUrl);
        publicUrl.protocol = outputUrl.protocol;
        publicUrl.host = outputUrl.host;
        publicUrl.port = outputUrl.port;

        middlewareRequest = new NextRequest(publicUrl.toString(), {
          headers: request.headers,
          method: request.method,
          body: request.body,
        });

        // Also override headers
        middlewareRequest.headers.set("Host", outputUrl.host);
        middlewareRequest.headers.set("X-Forwarded-Host", outputUrl.host);
        middlewareRequest.headers.set("X-Forwarded-Proto", outputUrl.protocol.replace(":", ""));
      }

      paymentResponse = await middlewareFn(middlewareRequest);

      if (
        paymentResponse &&
        typeof paymentResponse.status === "number" &&
        paymentResponse.status >= 400
      ) {
        return paymentResponse;
      }

      // Payment success (or middleware passed), grant 5 credits
      // (1 current message + 4 future messages)
      credits = 4;
    }

    // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    const ai = new GoogleGenAI({});
    // Note: In production you should properly handle AI errors and not deduct credits on fail
    // if user hasn't consumed the value, but for this PoC simplified flow is acceptable.

    let reply = "Sorry, I could not process your request.";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: message,
      });
      console.log(response.text);
      reply = response.text || reply;
    } catch (aiError) {
      console.error("AI Error:", aiError);
      // Don't refund credit here for simplicity, or handle as needed
    }

    const nextResponse = NextResponse.json({ message: reply, credits: credits });

    // Update the credits cookie
    nextResponse.cookies.set("message_credits", credits.toString(), {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return nextResponse;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to process the request" }, { status: 500 });
  }
}

/**
 * Handles GET requests to facilitate payment redirection.
 * Usage: Redirect user here when they need to pay.
 *
 * @param request - The incoming request.
 * @returns Redirect to /chat on success, or Paywall HTML on 402.
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
        // Accept tokens for either the UI page OR the API endpoint
        // This handles cases where rewrite succeeded (/chat) OR failed (/api/chat)
        "/chat": {
          price: "$0.01",
          network,
          config: {
            description: "5 Message Credits",
          },
        },
        "/api/chat": {
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

    // We must mock the request URL to match the resource we are verifying (/chat)
    const processingUrl = new URL(request.url);
    processingUrl.pathname = "/chat";

    let middlewareRequest = new NextRequest(processingUrl.toString(), {
      headers: request.headers,
    });

    // Inject token if found in query params
    if (paymentToken) {
      const headers = new Headers(middlewareRequest.headers);
      headers.set("x-payment-token", paymentToken);
      console.log("[DEBUG] GET /api/chat - Found paymentToken, verifying for /chat resource");
      middlewareRequest = new NextRequest(processingUrl.toString(), {
        headers: headers,
      });
    }

    // Fix: Force the correct public URL origin for GET requests too
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

    // If payment is required (402) or other error, return it
    if (
      paymentResponse &&
      typeof paymentResponse.status === "number" &&
      paymentResponse.status >= 400
    ) {
      return paymentResponse;
    }

    // Authentication/Payment Successful
    const nextResponse = NextResponse.json({ success: true, credits: 5 });

    // Grant credits
    nextResponse.cookies.set("message_credits", "5", {
      httpOnly: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Persist payment token for client to use
    if (paymentToken) {
      nextResponse.cookies.set("x402-payment-token", paymentToken, {
        httpOnly: false, // Allow client to read and use in headers
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    }

    // Check if this is a client-side background verification (AJAX) or a user landing (Browser)
    const isClientVerification = request.headers.get("x-verify") === "true";

    if (isClientVerification) {
      // Return JSON for ChatInterface to consume
      return nextResponse;
    } else {
      // User landed here via redirect, send them to the UI
      const baseUrl = getAppUrl(request) || request.url;
      const redirectUrl = new URL("/chat", baseUrl);
      // Preserve token in URL just in case client needs it too, though cookie is set
      if (paymentToken) {
        redirectUrl.searchParams.set("paymentToken", paymentToken);
      }
      const redirectResponse = NextResponse.redirect(redirectUrl);

      // Copy cookies from nextResponse to redirectResponse
      const cookies = nextResponse.cookies.getAll();
      cookies.forEach(cookie =>
      {
        redirectResponse.cookies.set(cookie.name, cookie.value, {
          ...cookie,
          // Next.js cookies getAll returns strict objects, specific settings might need explicit pass
          // but simply setting them should work.
          // Explicitly matching our security settings:
          httpOnly: false,
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });
      });

      return redirectResponse;
    }
  } catch (error) {
    console.error("Error in GET /api/chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
