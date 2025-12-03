import axios from 'axios';
import { BigNumberish } from 'ethers';

const THIRDWEB_API_URL = "https://api.thirdweb.com";
const CLIENT_ID = process.env.THIRDWEB_CLIENT_ID;
const SECRET_KEY = process.env.THIRDWEB_SECRET_KEY;

if (!CLIENT_ID || !SECRET_KEY) {
  throw new Error("THIRDWEB_CLIENT_ID and THIRDWEB_SECRET_KEY must be set in environment variables.");
}

const thirdwebApi = axios.create({
  baseURL: THIRDWEB_API_URL,
  headers: {
    "x-client-id": CLIENT_ID,
    "x-secret-key": SECRET_KEY,
    "Content-Type": "application/json",
  },
});

export const NATIVE_TOKEN_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

export function toWei(amount: string, decimals: number = 18): string {
  return (BigInt(Math.floor(parseFloat(amount) * (10 ** decimals)))).toString();
}

export interface BridgeSwapParams {
  exact: 'input' | 'output';
  tokenIn: {
    address: string;
    chainId: number;
    amount?: string;
    maxAmount?: string;
  };
  tokenOut: {
    address: string;
    chainId: number;
    amount?: string;
    minAmount?: string;
  };
  from?: string; // Optional wallet address for the sender
  slippageToleranceBps?: number; // Basis points (50 = 0.5%)
}

export interface BridgeSwapResponse {
  result?: {
    transactionId?: string;
    transactionHash?: string;
    status?: string;
  };
  error?: string;
}

export async function bridgeSwap(params: BridgeSwapParams): Promise<BridgeSwapResponse> {
  try {
    const response = await thirdwebApi.post("/v1/bridge/swap", params);
    return response.data;
  } catch (error: any) {
    console.error("thirdweb API Error (bridgeSwap):", error.response?.status, error.response?.data);
    throw new Error(`thirdweb API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
  }
}

export async function getBridgeChains(): Promise<any> {
  try {
    const response = await thirdwebApi.get("/v1/bridge/chains");
    return response.data;
  } catch (error: any) {
    console.error("thirdweb API Error (getBridgeChains):", error.response?.status, error.response?.data);
    throw new Error(`thirdweb API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
  }
}

export async function getBridgeRoutes(params: {
  limit?: number;
  page?: number;
  fromChainId?: number;
  toChainId?: number;
  fromTokenAddress?: string;
  toTokenAddress?: string;
}): Promise<any> {
  try {
    const response = await thirdwebApi.get("/v1/bridge/routes", { params });
    return response.data;
  } catch (error: any) {
    console.error("thirdweb API Error (getBridgeRoutes):", error.response?.status, error.response?.data);
    throw new Error(`thirdweb API Error: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
  }
}

