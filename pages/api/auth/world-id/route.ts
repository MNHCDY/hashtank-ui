import { NextApiRequest, NextApiResponse } from "next";

// Set up any environment variables or configurations
const WORLD_ID_API_URL = process.env.WORLD_ID_API_URL; // Example: The endpoint URL for World ID verification
const WORLD_ID_API_KEY = process.env.WORLD_ID_API_KEY; // Example: API key for authenticating with World ID

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { worldIDToken } = req.body;

  if (!worldIDToken) {
    return res.status(400).json({ error: "Missing World ID token" });
  }

  try {
    // Send a request to the World ID API to verify the token
    const response = await fetch(`${WORLD_ID_API_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WORLD_ID_API_KEY}`,
      },
      body: JSON.stringify({ token: worldIDToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return res
        .status(400)
        .json({ error: "World ID verification failed", details: errorData });
    }

    // Successfully verified the token
    const verificationData = await response.json();

    // Optionally, process the verificationData further or store in the database
    return res.status(200).json({ success: true, verificationData });
  } catch (error) {
    console.error("Error during World ID verification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export default handler;
