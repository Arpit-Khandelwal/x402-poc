import { Address } from "viem";
import { paymentMiddleware, Network, Resource } from "x402-next";

const facilitatorUrl = process.env.NEXT_PUBLIC_FACILITATOR_URL as Resource;
const payTo = process.env.RESOURCE_WALLET_ADDRESS as Address;
const network = process.env.NETWORK as Network;

export const middleware = paymentMiddleware(
  payTo,
  {
    "/protected": {
      price: "$0.01",
      network,
      config: {
        description: "Access protected content",
      },
    },
    "/protected/result": {
      price: "$0.01",
      network,
      config: {
        description: "Access protected content",
      },
    },
    "/api": {
      price: "$0.005",
      network,
      config: {
        description: "Access API endpoints",
      },
    },
  },
  {
    url: facilitatorUrl,
  },
);

export const config = {
  matcher: [
    "/protected/:path*",
    "/protected/result/:path*",
    "/api/short/:path*",
    "/api/buy-credits/:path*",
  ],
};
