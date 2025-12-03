import { bridgeSwap, NATIVE_TOKEN_ADDRESS, toWei } from "./thirdweb-bridge-api";
import { baseURL } from "@/baseUrl";

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

export async function performCrossChainSwap(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  toAddress?: string
): Promise<{ status: string; transactionId?: string; error?: string; confirmationUrl?: string }> {
  try {
    const fromChain = getChainById(fromChainId);
    const toChain = getChainById(toChainId);

    if (!fromChain || !toChain) {
      throw new Error(`Unsupported chain ID: fromChainId ${fromChainId} or toChainId ${toChainId}`);
    }

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
    };

  } catch (error) {
    console.error("Cross-chain swap failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error during swap.",
    };
  }
}

export async function executeConfirmedSwap(
  fromChainId: number,
  toChainId: number,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string,
  toAddress?: string
): Promise<{ status: string; transactionId?: string; error?: string }> {
  try {
    const fromChain = getChainById(fromChainId);
    const toChain = getChainById(toChainId);

    if (!fromChain || !toChain) {
      throw new Error(`Unsupported chain ID: fromChainId ${fromChainId} or toChainId ${toChainId}`);
    }

    const amountInWei = toWei(amount); // Convert amount to wei

    const swapResult = await bridgeSwap({
      exact: 'input',
      tokenIn: {
        address: fromTokenAddress,
        chainId: fromChainId,
        amount: amountInWei,
      },
      tokenOut: {
        address: toTokenAddress,
        chainId: toChainId,
      },
      from: toAddress, // Optional: recipient address
      slippageToleranceBps: 50, // 0.5%
    });

    return {
      status: "success",
      transactionId: swapResult.result?.transactionId,
    };

  } catch (error) {
    console.error("Swap execution failed:", error);
    return {
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error during swap execution.",
    };
  }
}

