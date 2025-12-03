import { baseURL } from "@/baseUrl";
import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { performCrossChainSwap, getChainById } from "@/app/lib/bridge-agent";

const getAppsSdkCompatibleHtml = async (baseUrl: string, path: string) => {
  const result = await fetch(`${baseUrl}${path}`);
  return await result.text();
};

type ContentWidget = {
  id: string;
  title: string;
  templateUri: string;
  invoking: string;
  invoked: string;
  html: string;
  description: string;
  widgetDomain: string;
};

function widgetMeta(widget: ContentWidget) {
  return {
    "openai/outputTemplate": widget.templateUri,
    "openai/toolInvocation/invoking": widget.invoking,
    "openai/toolInvocation/invoked": widget.invoked,
    "openai/widgetAccessible": false,
    "openai/resultCanProduceWidget": true,
  } as const;
}

const handler = createMcpHandler(async (server) => {
  // Note: Portfolio and Strategy widgets removed - NullBridge focuses on cross-chain bridging

  // Action Status Tool
  server.registerTool(
    "get_action_status",
    {
      title: "Get Action Status",
      description: "Retrieve the latest status of a prepared DeFi action, including transaction hash and history.",
      inputSchema: {
        actionId: z.string().describe("Action identifier returned by execute_action"),
      },
    },
    async ({ actionId }: { actionId: string }) => {
      (global as any).actionStore = (global as any).actionStore || new Map();
      const actionStore: Map<string, any> = (global as any).actionStore;
      const actionData = actionStore.get(actionId);

      if (!actionData) {
        return {
          content: [
            {
              type: "text",
              text: `No action found for ID ${actionId}. It may have expired or never existed.`,
            },
          ],
          isError: true,
        };
      }

      const statusSummary = [`Status: ${actionData.status}`, `Updated: ${actionData.updatedAt}`];

      if (actionData.txHash) {
        statusSummary.push(`Transaction Hash: ${actionData.txHash}`);
      }

      if (actionData.error) {
        statusSummary.push(`Error: ${actionData.error}`);
      }

      return {
        content: [
          {
            type: "text",
            text: statusSummary.join("\n"),
          },
        ],
        structuredContent: {
          actionId,
          status: actionData.status,
          txHash: actionData.txHash,
          error: actionData.error ?? null,
          metadata: actionData.statusMetadata ?? null,
          history: actionData.history ?? [],
          updatedAt: actionData.updatedAt,
        },
      };
    }
  );

  // Note: Strategy resource removed - NullBridge focuses on cross-chain bridging

  // Note: Portfolio and Strategy tools removed - NullBridge focuses on cross-chain bridging

  // Bridge Asset Tool (Cross-Chain Bridge using thirdweb)
  server.registerTool(
    "bridge_asset",
    {
      title: "Bridge Asset Across Chains",
      description: "Bridge/swap assets across different blockchain networks using thirdweb. Returns a confirmation URL for manual transaction confirmation.",
      inputSchema: {
        fromChainId: z.number().describe("ID of the source chain (e.g., 42161 for Arbitrum, 8453 for Base)"),
        toChainId: z.number().describe("ID of the destination chain (e.g., 8453 for Base, 42161 for Arbitrum)"),
        fromTokenAddress: z.string().describe("Address of the token to swap from (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native tokens)"),
        toTokenAddress: z.string().describe("Address of the token to swap to"),
        amount: z.string().describe("Amount of tokens to swap in human-readable format (e.g., '0.5', '1.0')"),
        toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional().describe("Wallet address that will receive the assets"),
      },
    },
    async ({ fromChainId, toChainId, fromTokenAddress, toTokenAddress, amount, toAddress }) => {
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
4. Confirm the swap transaction manually

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
                text: `❌ **Error: Failed to Prepare Swap Transaction**

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

  // Transfer Tokens Tool
  server.registerTool(
    "transfer_tokens",
    {
      title: "Transfer Tokens",
      description: "Transfer tokens between wallets with fee estimation and balance validation",
      inputSchema: {
        fromAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Sender wallet address"),
        toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).describe("Recipient wallet address"),
        token: z.string().describe("Token symbol or address to transfer"),
        amount: z.string().describe("Amount to transfer"),
        network: z.enum(["ethereum", "polygon", "arbitrum", "optimism", "base", "bnb", "avalanche", "celo"]).describe("Blockchain network"),
        memo: z.string().optional().describe("Optional memo for the transfer"),
      },
    },
    async ({ fromAddress, toAddress, token, amount, network, memo }) => {
      try {
        const response = await fetch(`${baseURL}/api/mcp/transfer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromAddress,
            toAddress,
            token,
            amount,
            network,
            memo
          })
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to prepare transfer');
        }

        const { data } = result;
        
        return {
          content: [
            {
              type: "text",
              text: `Transfer prepared: ${amount} ${token} from ${fromAddress} to ${toAddress}\n\nCurrent Balance: ${data.balanceCheck.currentBalance}\nAfter Transfer: ${data.balanceCheck.afterTransfer}\nEstimated Gas: ${data.estimatedFees.totalFeeETH} ETH ($${data.estimatedFees.totalFeeUSD})\n\nNext: User needs to sign transaction in wallet.`,
            },
          ],
          structuredContent: {
            transferId: data.transferId,
            fromAddress,
            toAddress,
            token,
            amount,
            network,
            estimatedFees: data.estimatedFees,
            balanceCheck: data.balanceCheck,
            requiresSignature: true,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error preparing transfer: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Estimate Fees Tool
  server.registerTool(
    "estimate_fees",
    {
      title: "Estimate Transaction Fees",
      description: "Get real-time gas fee estimates for different types of transactions across networks",
      inputSchema: {
        network: z.enum(["ethereum", "polygon", "arbitrum", "optimism", "base", "bnb", "avalanche", "celo"]).describe("Blockchain network"),
        operation: z.enum(["swap", "transfer", "stake", "bridge"]).describe("Type of operation"),
        tokenAddress: z.string().optional().describe("Token contract address (for ERC20 transfers)"),
      },
    },
    async ({ network, operation, tokenAddress }) => {
      try {
        // Mock fee estimation - in production, this would call actual gas estimation APIs
        const baseFees = {
          ethereum: { swap: '0.015', transfer: '0.005', stake: '0.02', bridge: '0.03' },
          polygon: { swap: '0.01', transfer: '0.005', stake: '0.015', bridge: '0.02' },
          arbitrum: { swap: '0.002', transfer: '0.001', stake: '0.003', bridge: '0.005' },
          optimism: { swap: '0.003', transfer: '0.001', stake: '0.004', bridge: '0.006' },
          base: { swap: '0.001', transfer: '0.0005', stake: '0.002', bridge: '0.003' },
          bnb: { swap: '0.005', transfer: '0.002', stake: '0.01', bridge: '0.015' },
          avalanche: { swap: '0.01', transfer: '0.005', stake: '0.015', bridge: '0.02' },
          celo: { swap: '0.01', transfer: '0.005', stake: '0.015', bridge: '0.02' }
        };

        const feeETH = baseFees[network][operation];
        const feeUSD = (parseFloat(feeETH) * 2500).toFixed(2); // Mock ETH price

        return {
          content: [
            {
              type: "text",
              text: `Fee Estimate for ${operation} on ${network}:\n\nGas Fee: ${feeETH} ETH (~$${feeUSD})\nNetwork: ${network}\nOperation: ${operation}${tokenAddress ? `\nToken: ${tokenAddress}` : ''}`,
            },
          ],
          structuredContent: {
            network,
            operation,
            tokenAddress,
            estimatedFee: {
              eth: feeETH,
              usd: feeUSD
            },
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error estimating fees: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );

  // Get Transaction Status Tool
  server.registerTool(
    "get_transaction_status",
    {
      title: "Get Transaction Status",
      description: "Check the status of a blockchain transaction and get confirmation details",
      inputSchema: {
        txHash: z.string().describe("Transaction hash to check"),
        network: z.enum(["ethereum", "polygon", "arbitrum", "optimism", "base", "bnb", "avalanche", "celo"]).describe("Blockchain network"),
      },
    },
    async ({ txHash, network }) => {
      try {
        const response = await fetch(`${baseURL}/api/mcp/transfer?txHash=${txHash}&network=${network}`);
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to get transaction status');
        }

        const { data } = result;
        
        return {
          content: [
            {
              type: "text",
              text: `Transaction Status: ${data.status}\n\nTx Hash: ${txHash}\nNetwork: ${network}\nBlock: ${data.blockNumber || 'Pending'}\nGas Used: ${data.gasUsed || 'N/A'}\n\nExplorer: ${data.explorerUrl}`,
            },
          ],
          structuredContent: {
            txHash,
            network,
            status: data.status,
            blockNumber: data.blockNumber,
            gasUsed: data.gasUsed,
            explorerUrl: data.explorerUrl,
            timestamp: new Date().toISOString(),
          },
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error checking transaction: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
        };
      }
    }
  );
});

export const GET = handler;
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
