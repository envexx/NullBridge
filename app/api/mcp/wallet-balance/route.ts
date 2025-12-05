import { NextRequest, NextResponse } from 'next/server';
import { getWalletTokenBalance, getChainById } from '@/app/lib/portfolio-agent';
import { z } from 'zod';

// Chain name to ID mapping
const CHAIN_NAME_MAP: { [key: string]: number } = {
  'ethereum': 1,
  'optimism': 10,
  'polygon': 137,
  'arbitrum': 42161,
  'base': 8453,
  'sepolia': 11155111,
  'optimism-sepolia': 11155420,
  'polygon-amoy': 80002,
  'arbitrum-sepolia': 421614,
  'base-sepolia': 84532,
};

// Token symbol to address mapping for native tokens (for reference)
const NATIVE_TOKENS: { [key: string]: string } = {
  'ETH': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  'MATIC': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  'AVAX': '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
};

function getChainIdFromName(chainName: string): number | null {
  const normalized = chainName.toLowerCase().replace(/\s+/g, '-');
  return CHAIN_NAME_MAP[normalized] || null;
}

const walletBalanceSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(), // Alternative parameter name
  chain: z.string().optional(),
  chainId: z.number().optional(),
  token: z.string().optional(),
  tokenAddress: z.string().optional(),
}).refine((data) => {
  // Either walletAddress or address must be provided
  return data.walletAddress || data.address;
}, {
  message: "Either 'walletAddress' or 'address' is required",
}).refine((data) => {
  // Either chain or chainId must be provided
  return data.chain || data.chainId;
}, {
  message: "Either 'chain' (string) or 'chainId' (number) is required",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = walletBalanceSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        status: "failed",
        error: "Invalid request parameters.",
        details: validation.error.errors
      }, { status: 400 });
    }

    const { walletAddress, address, chain, chainId, token, tokenAddress } = validation.data;

    // Determine the wallet address
    const walletAddr = walletAddress || address;
    if (!walletAddr) {
      return NextResponse.json({
        status: "failed",
        error: "Wallet address is required (use 'walletAddress' or 'address' parameter)"
      }, { status: 400 });
    }

    // Determine the chain ID
    let finalChainId: number;
    if (chainId) {
      finalChainId = chainId;
    } else if (chain) {
      const mappedChainId = getChainIdFromName(chain);
      if (!mappedChainId) {
        return NextResponse.json({
          status: "failed",
          error: `Unsupported chain name: ${chain}. Supported chains: ${Object.keys(CHAIN_NAME_MAP).join(', ')}`,
          supportedChains: Object.keys(CHAIN_NAME_MAP)
        }, { status: 400 });
      }
      finalChainId = mappedChainId;
    } else {
      return NextResponse.json({
        status: "failed",
        error: "Either 'chain' (string) or 'chainId' (number) is required"
      }, { status: 400 });
    }

    // Check if chain is supported
    const chainInfo = getChainById(finalChainId);
    if (!chainInfo) {
      return NextResponse.json({
        status: "failed",
        error: `Unsupported chain ID: ${finalChainId}`
      }, { status: 400 });
    }

    // Determine token address
    // If token is provided and is a native token symbol, don't pass tokenAddress
    // If tokenAddress is provided, use it
    let finalTokenAddress: string | undefined;
    if (tokenAddress) {
      finalTokenAddress = tokenAddress;
    } else if (token) {
      // If token is a native token symbol, we don't pass tokenAddress (undefined = native)
      // If token looks like an address, use it as tokenAddress
      if (token.startsWith('0x') && token.length === 42) {
        finalTokenAddress = token;
      }
      // Otherwise, if it's a native token symbol like "ETH", "MATIC", etc., leave it undefined
    }

    // Get wallet balance
    const result = await getWalletTokenBalance(walletAddr, finalChainId, finalTokenAddress);

    if (result.error || !result.balance) {
      return NextResponse.json({
        status: "failed",
        error: result.error || "Failed to get wallet balance",
        walletAddress: walletAddr,
        chainId: finalChainId,
        chainName: chainInfo.name,
      }, { status: 500 });
    }

    const balance = result.balance;

    return NextResponse.json({
      status: "success",
      walletAddress: walletAddr,
      chainId: balance.chainId,
      chainName: balance.chainName,
      tokenAddress: balance.address,
      tokenName: balance.name,
      tokenSymbol: balance.symbol,
      balance: balance.displayValue,
      value: balance.value.toString(),
      decimals: balance.decimals,
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error: any) {
    console.error('Wallet balance API error:', error);
    return NextResponse.json({
      status: "failed",
      error: error.message || "Internal server error."
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

