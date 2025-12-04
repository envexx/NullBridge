// NullBridge MCP - Bridge Agent using thirdweb SDK
import { baseURL } from "@/baseUrl";
import { thirdwebClient } from "./thirdweb-client";
// @ts-ignore - thirdweb SDK types
import { Bridge, NATIVE_TOKEN_ADDRESS } from "thirdweb";

interface ChainInfo {
  id: number;
  name: string;
  explorerUrl: string;
}

const CHAIN_INFO: { [key: number]: ChainInfo } = {
  1: { id: 1, name: "Ethereum Mainnet", explorerUrl: "https://etherscan.io" },
  10: { id: 10, name: "Optimism Mainnet", explorerUrl: "https://optimistic.etherscan.io" },
  137: { id: 137, name: "Polygon Mainnet", explorerUrl: "https://polygonscan.com" },
  42161: { id: 42161, name: "Arbitrum One", explorerUrl: "https://arbiscan.io" },
  8453: { id: 8453, name: "Base Mainnet", explorerUrl: "https://basescan.org" },
  421614: { id: 421614, name: "Arbitrum Sepolia", explorerUrl: "https://sepolia.arbiscan.io" },
  84532: { id: 84532, name: "Base Sepolia", explorerUrl: "https://sepolia.basescan.org" },
};

export function getChainById(chainId: number): ChainInfo | undefined {
  return CHAIN_INFO[chainId];
}


/**
 * Perform cross-chain swap using thirdweb SDK
 * Returns confirmation URL for manual user approval
 */
export async function performCrossChainSwap(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  toAddress?: string
): Promise<{ status: string; transactionId?: string; error?: string; confirmationUrl?: string; quote?: any }> {
  try {
    const fromChain = getChainById(fromChainId);
    const toChain = getChainById(toChainId);

    if (!fromChain || !toChain) {
      throw new Error(`Unsupported chain ID: fromChainId ${fromChainId} or toChainId ${toChainId}`);
    }

    // Get quote for the bridge transaction
    // Convert amount to wei (18 decimals for native tokens)
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 10**18));
    const quote = await Bridge.Buy.quote({
      client: thirdwebClient,
      originChainId: fromChainId,
      destinationChainId: toChainId,
      originTokenAddress: (fromTokenAddress === NATIVE_TOKEN_ADDRESS ? NATIVE_TOKEN_ADDRESS : fromTokenAddress) as `0x${string}`,
      destinationTokenAddress: (toTokenAddress === NATIVE_TOKEN_ADDRESS ? NATIVE_TOKEN_ADDRESS : toTokenAddress) as `0x${string}`,
      amount: amountWei,
    });

    // Generate confirmation URL for manual confirmation
    const confirmationUrl = `${baseURL}/bridge/confirm?` + new URLSearchParams({
      fromChainId: fromChainId.toString(),
      toChainId: toChainId.toString(),
      fromTokenAddress: fromTokenAddress,
      toTokenAddress: toTokenAddress,
      amount: amount,
      toAddress: toAddress || '',
    }).toString();

    return {
      status: "pending_confirmation",
      confirmationUrl: confirmationUrl,
      quote: quote,
    };

  } catch (error) {
    console.error("Cross-chain swap failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error during swap.",
    };
  }
}

/**
 * Execute confirmed bridge swap using thirdweb SDK
 * This is called after user confirms on the confirmation page
 */
export async function executeConfirmedSwap(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  toAddress?: string
): Promise<{ status: string; transactionId?: string; transactionHash?: string; error?: string; steps?: any[]; transactions?: any[] }> {
  try {
    const fromChain = getChainById(fromChainId);
    const toChain = getChainById(toChainId);

    if (!fromChain || !toChain) {
      throw new Error(`Unsupported chain ID: fromChainId ${fromChainId} or toChainId ${toChainId}`);
    }

    // Convert amount to wei (18 decimals for native tokens)
    const amountWei = BigInt(Math.floor(parseFloat(amount) * 10**18));

    if (!toAddress) {
      throw new Error("toAddress is required for preparing bridge transaction");
    }

    // Prepare bridge transaction
    const preparedQuote = await Bridge.Buy.prepare({
      client: thirdwebClient,
      sender: toAddress as `0x${string}`, // Will be set by user's wallet on confirmation page
      receiver: toAddress as `0x${string}`, // Recipient address
      originChainId: fromChainId,
      destinationChainId: toChainId,
      originTokenAddress: (fromTokenAddress === NATIVE_TOKEN_ADDRESS ? NATIVE_TOKEN_ADDRESS : fromTokenAddress) as `0x${string}`,
      destinationTokenAddress: (toTokenAddress === NATIVE_TOKEN_ADDRESS ? NATIVE_TOKEN_ADDRESS : toTokenAddress) as `0x${string}`,
      amount: amountWei,
    });

    // Extract steps from prepared quote
    const steps = preparedQuote.steps;

    // Return steps for frontend to execute
    // Each step will be executed by user's wallet on confirmation page
    // Extract transactions from steps
    const transactions = steps.flatMap(step => step.transactions || []);
    const lastTransaction = transactions[transactions.length - 1];
    
    return {
      status: "prepared",
      steps: steps,
      transactions: transactions,
      transactionId: lastTransaction?.id || undefined,
    };

  } catch (error) {
    console.error("Swap execution failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error during swap execution.",
    };
  }
}

/**
 * Get bridge status using thirdweb SDK
 */
export async function getBridgeStatus(
  transactionHash: string,
  chainId: number
): Promise<{ status: string; transactionHash?: string; error?: string }> {
  try {
    const status = await Bridge.status({
      client: thirdwebClient,
      transactionHash: transactionHash as `0x${string}`,
      chainId: chainId,
    });

    return {
      status: status.status || "unknown",
      transactionHash: transactionHash,
    };

  } catch (error) {
    console.error("Bridge status check failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error during status check.",
    };
  }
}

// Export NATIVE_TOKEN_ADDRESS for use in other files
export { NATIVE_TOKEN_ADDRESS };

// Helper function to convert amount to wei
export function toWei(amount: string, decimals: number = 18): string {
  return (BigInt(Math.floor(parseFloat(amount) * 10**decimals))).toString();
}
