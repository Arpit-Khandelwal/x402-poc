import { GoogleGenAI } from "@google/genai";
import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { Address } from "viem";
import { Network, paymentMiddleware, Resource } from "x402-next";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const network = process.env.NETWORK as Network;

/**
 * Handles the chat request ensuring payment is made.
 * Grants 5 message credits per payment.
 *
 * @param request - The incoming request object.
 * @returns The JSON response or payment requirement.
 */
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    const cookieStore = await cookies();
    let credits = parseInt(cookieStore.get("message_credits")?.value || "0");
    let paymentResponse;

    if (credits > 0) {
      // User has credits, decrement and skip checking payment again
      credits--;
    } else {
      // Check payment only when user has no credits
      const middlewareFn = paymentMiddleware(
        payTo,
        {
          price: "$0.01",
          network,
        },
        {
          url: facilitatorUrl,
        },
      );

      paymentResponse = await middlewareFn(request);
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

    const nextResponse = NextResponse.json({ message: reply });

    // Update the credits cookie
    nextResponse.cookies.set("message_credits", credits.toString(), {
      httpOnly: true,
      path: "/", // Ensure cookie is available for all routes if needed, or valid path
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return nextResponse;
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to process the request" }, { status: 500 });
  }
}
