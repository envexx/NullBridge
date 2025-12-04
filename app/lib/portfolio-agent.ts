// NullBridge MCP - Portfolio Agent using thirdweb SDK
import { thirdwebClient } from "./thirdweb-client";
// @ts-ignore - thirdweb SDK types
import { getWalletBalance } from "thirdweb/wallets";
// @ts-ignore - thirdweb SDK types
import { 
  ethereum,
  optimism,
  polygon,
  arbitrum,
  base,
  sepolia,
  optimismSepolia,
  polygonAmoy,
  arbitrumSepolia,
  baseSepolia,
} from "thirdweb/chains";

interface ChainInfo {
  id: number;
  name: string;
  chain: any; // thirdweb chain object
}

const CHAIN_MAP: { [key: number]: ChainInfo } = {
  1: { id: 1, name: "Ethereum Mainnet", chain: ethereum },
  10: { id: 10, name: "Optimism Mainnet", chain: optimism },
  137: { id: 137, name: "Polygon Mainnet", chain: polygon },
  42161: { id: 42161, name: "Arbitrum One", chain: arbitrum },
  8453: { id: 8453, name: "Base Mainnet", chain: base },
  11155111: { id: 11155111, name: "Ethereum Sepolia", chain: sepolia },
  11155420: { id: 11155420, name: "Optimism Sepolia", chain: optimismSepolia },
  80002: { id: 80002, name: "Polygon Amoy", chain: polygonAmoy },
  421614: { id: 421614, name: "Arbitrum Sepolia", chain: arbitrumSepolia },
  84532: { id: 84532, name: "Base Sepolia", chain: baseSepolia },
};

export function getChainById(chainId: number): ChainInfo | undefined {
  return CHAIN_MAP[chainId];
}

export interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  displayValue: string;
  value: bigint;
  chainId: number;
  chainName: string;
}

export interface PortfolioResult {
  address: string;
  balances: TokenBalance[];
  totalValueUSD?: number;
  error?: string;
}

/**
 * Get wallet balance for a specific token on a chain
 */
export async function getWalletTokenBalance(
  address: string,
  chainId: number,
  tokenAddress?: string
): Promise<{ balance: any; error?: string }> {
  try {
    const chainInfo = getChainById(chainId);
    
    if (!chainInfo) {
      return {
        balance: null,
        error: `Unsupported chain ID: ${chainId}`,
      };
    }

    const balance = await getWalletBalance({
      address: address as `0x${string}`,
      client: thirdwebClient,
      chain: chainInfo.chain,
      tokenAddress: tokenAddress ? (tokenAddress as `0x${string}`) : undefined,
    });

    return {
      balance: {
        address: tokenAddress || "native",
        name: balance.name || "Native Token",
        symbol: balance.symbol || "ETH",
        decimals: balance.decimals || 18,
        displayValue: balance.displayValue || "0",
        value: balance.value || BigInt(0),
        chainId: chainId,
        chainName: chainInfo.name,
      },
    };
  } catch (error) {
    console.error("Get wallet balance failed:", error);
    return {
      balance: null,
      error: error instanceof Error ? error.message : "Unknown error during balance check.",
    };
  }
}

/**
 * Get portfolio (all balances) for a wallet across multiple chains
 */
export async function getPortfolio(
  address: string,
  chainIds: number[],
  tokenAddresses?: { [chainId: number]: string[] }
): Promise<PortfolioResult> {
  try {
    const balances: TokenBalance[] = [];
    const errors: string[] = [];

    // Get native token balance for each chain
    for (const chainId of chainIds) {
      const nativeBalance = await getWalletTokenBalance(address, chainId);
      
      if (nativeBalance.error) {
        errors.push(`Chain ${chainId}: ${nativeBalance.error}`);
      } else if (nativeBalance.balance) {
        balances.push(nativeBalance.balance);
      }

      // Get ERC20 token balances if specified
      if (tokenAddresses && tokenAddresses[chainId]) {
        for (const tokenAddress of tokenAddresses[chainId]) {
          const tokenBalance = await getWalletTokenBalance(address, chainId, tokenAddress);
          
          if (tokenBalance.error) {
            errors.push(`Chain ${chainId}, Token ${tokenAddress}: ${tokenBalance.error}`);
          } else if (tokenBalance.balance) {
            balances.push(tokenBalance.balance);
          }
        }
      }
    }

    return {
      address,
      balances,
      error: errors.length > 0 ? errors.join("; ") : undefined,
    };
  } catch (error) {
    console.error("Get portfolio failed:", error);
    return {
      address,
      balances: [],
      error: error instanceof Error ? error.message : "Unknown error during portfolio check.",
    };
  }
}

