import { baseURL } from "@/baseUrl";
// @ts-ignore - mcp-handler doesn't have type definitions
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { performCrossChainSwap, getChainById } from "@/app/lib/bridge-agent";
import { getPortfolio, getWalletTokenBalance, getChainById as getPortfolioChainById } from "@/app/lib/portfolio-agent";

const handler = createMcpHandler(async (server: any) => {
  // Bridge Asset Tool - Cross-Chain Bridge using thirdweb SDK
  server.registerTool(
    "bridge_asset",
    {
      title: "Bridge Asset Across Chains",
      description: "Bridge/swap assets across different blockchain networks using thirdweb SDK. Returns a confirmation URL for manual transaction confirmation.",
      inputSchema: {
        fromChainId: z.number().describe("ID of the source chain (e.g., 42161 for Arbitrum, 8453 for Base, 1 for Ethereum)"),
        toChainId: z.number().describe("ID of the destination chain (e.g., 8453 for Base, 42161 for Arbitrum, 1 for Ethereum)"),
        fromTokenAddress: z.string().describe("Address of the token to swap from (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native tokens like ETH, MATIC)"),
        toTokenAddress: z.string().describe("Address of the token to swap to (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native tokens)"),
        amount: z.string().describe("Amount of tokens to swap in human-readable format (e.g., '0.5', '1.0')"),
        toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional().describe("Wallet address that will receive the assets (optional, defaults to sender if not provided)"),
      },
    },
    async ({ fromChainId, toChainId, fromTokenAddress, toTokenAddress, amount, toAddress }: {
      fromChainId: number;
      toChainId: number;
      fromTokenAddress: string;
      toTokenAddress: string;
      amount: string;
      toAddress?: string;
    }) => {
      try {
        const fromChain = getChainById(fromChainId);
        const toChain = getChainById(toChainId);

        if (!fromChain || !toChain) {
          const supportedChains = [
            { id: 1, name: "Ethereum Mainnet" },
            { id: 10, name: "Optimism Mainnet" },
            { id: 137, name: "Polygon Mainnet" },
            { id: 42161, name: "Arbitrum One" },
            { id: 8453, name: "Base Mainnet" },
            { id: 421614, name: "Arbitrum Sepolia" },
            { id: 84532, name: "Base Sepolia" },
          ];

          return {
            content: [
              {
                type: "text",
                text: `❌ **Error: Unsupported Chain ID**

From Chain ID ${fromChainId}: ${fromChain ? '✅ Supported' : '❌ Not Supported'}
To Chain ID ${toChainId}: ${toChain ? '✅ Supported' : '❌ Not Supported'}

**Supported Chains:**
${supportedChains.map(c => `- ${c.name} (Chain ID: ${c.id})`).join('\n')}`,
              },
            ],
            isError: true,
          };
        }

        const result = await performCrossChainSwap(
          fromChainId,
          toChainId,
          fromTokenAddress,
          toTokenAddress,
          amount,
          toAddress
        );

        if (result.status === "pending_confirmation" && result.confirmationUrl) {
          return {
            content: [
              {
                type: "text",
                text: `🔗 **Cross-Chain Bridge - Confirmation Required**

Transaction Details:
- From Chain: ${fromChain.name} (ID: ${fromChain.id})
- To Chain: ${toChain.name} (ID: ${toChain.id})
- From Token: ${fromTokenAddress}
- To Token: ${toTokenAddress}
- Amount: ${amount}
${toAddress ? `- Recipient: ${toAddress}` : ''}

Next Steps:
1. Click the confirmation URL below to review and confirm the transaction
2. Connect your wallet on the confirmation page
3. Review the transaction details
4. Confirm the bridge transaction manually

Confirmation URL:
${result.confirmationUrl}

⚠️ Important: You will be redirected to a confirmation page where you need to manually confirm the transaction using your wallet.`,
              },
            ],
            structuredContent: {
              status: "pending_confirmation",
              confirmationUrl: result.confirmationUrl,
              fromChain: fromChain.name,
              toChain: toChain.name,
              fromTokenAddress,
              toTokenAddress,
              amount,
              toAddress,
              timestamp: new Date().toISOString(),
            },
          };
        } else {
          return {
            content: [
              {
                type: "text",
                text: `❌ **Error: Failed to Prepare Bridge Transaction**

Details: ${result.error || 'Unknown error.'}`,
              },
            ],
            isError: true,
          };
        }
      } catch (error: any) {
        console.error("Error handling bridge_asset tool:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ **Error during Bridge Asset operation:** ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Portfolio Tool - Check wallet balances using thirdweb SDK
  server.registerTool(
    "get_portfolio",
    {
      title: "Get Wallet Portfolio",
      description: "Get wallet balances (native tokens and ERC20 tokens) across multiple chains using thirdweb SDK.",
      inputSchema: {
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Wallet address to check balances for"),
        chainIds: z.array(z.number()).optional().describe("Array of chain IDs to check (e.g., [1, 137, 8453]). If not provided, checks all supported chains"),
        tokenAddresses: z.record(z.array(z.string())).optional().describe("Optional: Object mapping chainId to array of ERC20 token addresses to check (e.g., {1: ['0x...', '0x...'], 137: ['0x...']})"),
      },
    },
    async ({ address, chainIds, tokenAddresses }: {
      address: string;
      chainIds?: number[];
      tokenAddresses?: { [chainId: number]: string[] };
    }) => {
      try {
        // Default to all supported chains if not specified
        const chainsToCheck = chainIds || [1, 10, 137, 42161, 8453, 421614, 84532];

        const result = await getPortfolio(address, chainsToCheck, tokenAddresses);

        if (result.error && result.balances.length === 0) {
          return {
            content: [
              {
                type: "text",
                text: `❌ **Error: Failed to Get Portfolio**\n\nDetails: ${result.error}`,
              },
            ],
            isError: true,
          };
        }

        // Format balances for display
        const balanceText = result.balances
          .map(balance => {
            const chainName = balance.chainName || `Chain ${balance.chainId}`;
            const tokenName = balance.name || balance.symbol;
            return `- **${chainName}**: ${balance.displayValue} ${balance.symbol}${balance.address !== "native" ? ` (${tokenName})` : ""}`;
          })
          .join("\n");

        const errorText = result.error ? `\n\n⚠️ **Warnings:**\n${result.error}` : "";

        return {
          content: [
            {
              type: "text",
              text: `💰 **Wallet Portfolio**\n\n**Address:** ${address}\n\n**Balances:**\n${balanceText || "No balances found"}${errorText}`,
            },
          ],
          structuredContent: {
            address: result.address,
            balances: result.balances,
            totalChains: chainsToCheck.length,
            chainsChecked: chainsToCheck,
            errors: result.error ? [result.error] : [],
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error: any) {
        console.error("Error handling get_portfolio tool:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ **Error during Portfolio Check:** ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  // Get Wallet Balance Tool - Check single token balance on a specific chain
  server.registerTool(
    "get_wallet_balance",
    {
      title: "Get Wallet Balance",
      description: "Get wallet balance for a specific token (native or ERC20) on a specific chain using thirdweb SDK.",
      inputSchema: {
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Wallet address to check balance for"),
        chainId: z.number().describe("Chain ID to check balance on (e.g., 1 for Ethereum, 137 for Polygon, 8453 for Base)"),
        tokenAddress: z.string().optional().describe("Optional: ERC20 token address. If not provided, returns native token balance (ETH, MATIC, etc.)"),
      },
    },
    async ({ address, chainId, tokenAddress }: {
      address: string;
      chainId: number;
      tokenAddress?: string;
    }) => {
      try {
        const chainInfo = getPortfolioChainById(chainId);

        if (!chainInfo) {
          const supportedChains = [
            { id: 1, name: "Ethereum Mainnet" },
            { id: 10, name: "Optimism Mainnet" },
            { id: 137, name: "Polygon Mainnet" },
            { id: 42161, name: "Arbitrum One" },
            { id: 8453, name: "Base Mainnet" },
            { id: 421614, name: "Arbitrum Sepolia" },
            { id: 84532, name: "Base Sepolia" },
          ];

          return {
            content: [
              {
                type: "text",
                text: `❌ **Error: Unsupported Chain ID**\n\nChain ID ${chainId} is not supported.\n\n**Supported Chains:**\n${supportedChains.map(c => `- ${c.name} (Chain ID: ${c.id})`).join('\n')}`,
              },
            ],
            isError: true,
          };
        }

        const result = await getWalletTokenBalance(address, chainId, tokenAddress);

        if (result.error || !result.balance) {
          return {
            content: [
              {
                type: "text",
                text: `❌ **Error: Failed to Get Balance**\n\nDetails: ${result.error || 'Unknown error'}`,
              },
            ],
            isError: true,
          };
        }

        const balance = result.balance;
        const tokenType = tokenAddress ? "ERC20 Token" : "Native Token";

        return {
          content: [
            {
              type: "text",
              text: `💰 **Wallet Balance**\n\n**Address:** ${address}\n**Chain:** ${balance.chainName} (ID: ${balance.chainId})\n**Token:** ${balance.name} (${balance.symbol})\n**Type:** ${tokenType}\n**Balance:** ${balance.displayValue} ${balance.symbol}`,
            },
          ],
          structuredContent: {
            address,
            chainId: balance.chainId,
            chainName: balance.chainName,
            tokenAddress: balance.address,
            tokenName: balance.name,
            tokenSymbol: balance.symbol,
            balance: balance.displayValue,
            value: balance.value.toString(),
            decimals: balance.decimals,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error: any) {
        console.error("Error handling get_wallet_balance tool:", error);
        return {
          content: [
            {
              type: "text",
              text: `❌ **Error during Balance Check:** ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
});

// GET handler - Return server info
export async function GET() {
  try {
    const serverInfo = {
      name: "NullBridge MCP",
      version: "1.0.0",
      description: "Cross-Chain Asset Bridge Agent with thirdweb SDK integration for AI agents",
      tools: ["bridge_asset", "get_portfolio", "get_wallet_balance"],
      supported_chains: [
        { id: 1, name: "Ethereum Mainnet" },
        { id: 10, name: "Optimism Mainnet" },
        { id: 137, name: "Polygon Mainnet" },
        { id: 42161, name: "Arbitrum One" },
        { id: 8453, name: "Base Mainnet" },
        { id: 421614, name: "Arbitrum Sepolia" },
        { id: 84532, name: "Base Sepolia" },
      ],
      endpoints: {
        mcp: "/mcp",
        config: "/mcp/config",
        privacy: "/api/privacy-policy",
        bridge: "/api/mcp/bridge-asset",
        bridgeConfirm: "/bridge/confirm",
      },
      homepage: "https://github.com/envexx/NullBridge",
    };

    return Response.json(serverInfo, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get server info', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST handler - MCP JSON-RPC requests
export const POST = handler;

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
