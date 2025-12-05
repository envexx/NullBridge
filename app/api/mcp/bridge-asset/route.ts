import { NextRequest, NextResponse } from 'next/server';
import { performCrossChainSwap, getChainById, executeConfirmedSwap } from '@/app/lib/bridge-agent';

// Helper function to serialize BigInt values in objects
function serializeBigInt(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt);
  }
  
  if (typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeBigInt(value);
    }
    return serialized;
  }
  
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fromChainId, toChainId, fromTokenAddress, toTokenAddress, amount, toAddress, confirmed } = body;

    if (!fromChainId || !toChainId || !fromTokenAddress || !toTokenAddress || !amount) {
      return NextResponse.json({
        status: "failed",
        error: "Missing required parameters.",
        required: ['fromChainId', 'toChainId', 'fromTokenAddress', 'toTokenAddress', 'amount']
      }, { status: 400 });
    }

    const fromChain = getChainById(fromChainId);
    const toChain = getChainById(toChainId);

    if (!fromChain || !toChain) {
      return NextResponse.json({
        status: "failed",
        error: "Unsupported chain ID provided."
      }, { status: 400 });
    }

    if (confirmed === true) {
      // Execute the confirmed swap
      const result = await executeConfirmedSwap(
        fromChainId,
        toChainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        toAddress
      );

      // executeConfirmedSwap returns "prepared" status with steps/transactions
      // The actual execution happens on the frontend using user's wallet
      if (result.status === "prepared" && result.steps && result.transactions) {
        // Serialize BigInt values before sending response
        const serializedSteps = serializeBigInt(result.steps);
        const serializedTransactions = serializeBigInt(result.transactions);
        
        return NextResponse.json({
          status: "success", // Changed to "success" for frontend compatibility
          message: "Bridge transaction prepared successfully. Please execute using your wallet on the confirmation page.",
          steps: serializedSteps,
          transactions: serializedTransactions,
          transactionId: result.transactionId,
          instructions: "The transaction has been prepared. Use the steps and transactions data to execute via your connected wallet."
        });
      } else if (result.status === "success") {
        const explorerUrl = fromChain.explorerUrl
          ? `${fromChain.explorerUrl}/tx/${result.transactionId}`
          : `https://etherscan.io/tx/${result.transactionId}`;

        return NextResponse.json({
          status: "success",
          message: "Cross-chain swap initiated successfully.",
          transactionId: result.transactionId,
          explorerUrl: explorerUrl
        });
      } else {
        return NextResponse.json({
          status: "failed",
          error: result.error || "Failed to prepare bridge transaction",
          message: "Cross-chain swap failed to execute.",
          details: result
        }, { status: 500 });
      }
    } else {
      // Return confirmation URL
      const result = await performCrossChainSwap(
        fromChainId,
        toChainId,
        fromTokenAddress,
        toTokenAddress,
        amount,
        toAddress
      );

      if (result.status === "pending_confirmation" && result.confirmationUrl) {
        return NextResponse.json({
          status: "pending_confirmation",
          message: "Please confirm the transaction via the confirmation URL.",
          confirmationUrl: result.confirmationUrl
        });
      } else {
        return NextResponse.json({
          status: "failed",
          error: result.error,
          message: "Failed to prepare swap transaction."
        }, { status: 500 });
      }
    }

  } catch (error: any) {
    console.error('Bridge asset error:', error);
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

