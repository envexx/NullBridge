// NullBridge MCP - thirdweb Client Initialization
// @ts-ignore - thirdweb SDK types
import { createThirdwebClient } from "thirdweb";

const CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

// Create thirdweb client for server-side operations
// Use a placeholder client ID during build if not set
let thirdwebClient: ReturnType<typeof createThirdwebClient>;

try {
  if (!CLIENT_ID) {
    // During build time, use a placeholder to avoid errors
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
      // Only throw in production if not on Vercel (where env vars are set)
      throw new Error("THIRDWEB_CLIENT_ID must be set in environment variables.");
    }
    // Use placeholder for build
    thirdwebClient = createThirdwebClient({
      clientId: "placeholder-for-build",
      secretKey: SECRET_KEY,
    });
  } else {
    thirdwebClient = createThirdwebClient({
      clientId: CLIENT_ID,
      secretKey: SECRET_KEY, // Optional: for server-side operations
    });
  }
} catch (error) {
  // Fallback for build time
  thirdwebClient = createThirdwebClient({
    clientId: CLIENT_ID || "placeholder-for-build",
    secretKey: SECRET_KEY,
  });
}

export { thirdwebClient, CLIENT_ID, SECRET_KEY };

