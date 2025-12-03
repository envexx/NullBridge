// NullBridge MCP - thirdweb Client Initialization
// @ts-ignore - thirdweb SDK types
import { createThirdwebClient } from "thirdweb";

const CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

if (!CLIENT_ID) {
  throw new Error("THIRDWEB_CLIENT_ID must be set in environment variables.");
}

// Create thirdweb client for server-side operations
export const thirdwebClient = createThirdwebClient({
  clientId: CLIENT_ID,
  secretKey: SECRET_KEY, // Optional: for server-side operations
});

export { CLIENT_ID, SECRET_KEY };

