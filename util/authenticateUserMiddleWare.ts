import type { NextApiRequest, NextApiResponse } from "next";
import { privy } from "./privy";

async function verifyWorldIdToken(token: string) {
  const response = await fetch("https://world-id.verification.api", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("World ID token verification failed");
  }

  return await response.json(); // Assuming the response contains user info
}

export default async function authenticateUserMiddleWare(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let authHeader: string | null = null;

  if (req.headers.authorization) {
    authHeader = req.headers.authorization || null;
  } else if (req.headers instanceof Headers) {
    authHeader = req.headers.get("authorization");
  }

  const token = authHeader?.replace("Bearer ", "");

  if (token) {
    try {
      // Check if the token is a World ID token
      if (token.startsWith("0x0847f81")) {
        // Replace with actual prefix
        const verifiedClaims = await verifyWorldIdToken(token); // Using custom World ID verification
        const user = await privy.getUser(verifiedClaims.userId);

        if (user.wallet?.address) {
          return user; // Successfully authenticated
        } else {
          return res.status(401).json({ errorMsg: "No user wallet found" });
        }
      } else {
        // Normal token verification
        const verifiedClaims = await privy.verifyAuthToken(token);
        const user = await privy.getUser(verifiedClaims.userId);

        if (user.wallet?.address) {
          return user; // Successfully authenticated
        } else {
          return res.status(401).json({ errorMsg: "No user wallet found" });
        }
      }
    } catch (error) {
      console.error(error);
      return res.status(401).json({ errorMsg: "User verification failed" });
    }
  } else {
    return res.status(401).json({ errorMsg: "No token found" });
  }
}
