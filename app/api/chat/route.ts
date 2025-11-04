import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';
import { Address } from "viem";
import {  Network, paymentMiddleware, Resource } from "x402-next";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const network = process.env.NETWORK as Network;

export async function POST(request: Request) {
    try {
        const { message, paymentToken } = await request.json();

        // Check payment only when processing a message
        const paymentCheck = paymentMiddleware(
            payTo,
            {
                price: "$0.01",
                network,
            },
            {
                url: facilitatorUrl,
            }
        );

        if (!paymentCheck) {
            return NextResponse.json(
                { error: 'Payment required' },
                { status: 402 }
            );
        }

        // The client gets the API key from the environment variable `GEMINI_API_KEY`.
        const ai = new GoogleGenAI({});
        const response = await ai.models.generateContent({
            model: "Gemini 2.0 Flash-Lite",
            contents: message,
        });

        console.log(response.text);

        const reply = response.text || 'Sorry, I could not process your request.';

        return NextResponse.json({ message: reply });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to process the request' },
            { status: 500 }
        );
    }
}