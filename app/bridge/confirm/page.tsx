'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { baseURL } from '@/baseUrl';
import { getChainById } from '@/app/lib/bridge-agent';

interface SwapConfirmationProps {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  toAddress?: string;
}

export default function BridgeConfirmPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  const fromChainId = parseInt(searchParams.get('fromChainId') || '0');
  const toChainId = parseInt(searchParams.get('toChainId') || '0');
  const fromTokenAddress = searchParams.get('fromTokenAddress') || '';
  const toTokenAddress = searchParams.get('toTokenAddress') || '';
  const amount = searchParams.get('amount') || '';
  const toAddress = searchParams.get('toAddress') || '';

  const fromChain = getChainById(fromChainId);
  const toChain = getChainById(toChainId);

  const executeSwap = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseURL}/api/mcp/bridge-asset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromChainId,
          toChainId,
          fromTokenAddress,
          toTokenAddress,
          amount,
          toAddress: toAddress || undefined,
          confirmed: true,
        }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(true);
        setTransactionId(result.transactionId);
        setExplorerUrl(result.explorerUrl);
      } else {
        setError(result.error || 'Failed to execute swap');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while executing the swap');
    } finally {
      setLoading(false);
    }
  };

  if (!fromChain || !toChain) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Chain Configuration</h1>
          <p className="text-gray-700">
            The provided chain IDs are not supported. Please check your parameters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NullBridge - Confirm Bridge Transaction</h1>
          <p className="text-gray-600">Powered by thirdweb</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="mb-4">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">Transaction Submitted Successfully!</h2>
            {transactionId && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Transaction ID:</p>
                <p className="text-sm font-mono text-gray-900 break-all">{transactionId}</p>
              </div>
            )}
            {explorerUrl && (
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View on Explorer
              </a>
            )}
          </div>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">From Chain:</span>
                  <span className="font-semibold text-gray-900">{fromChain.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To Chain:</span>
                  <span className="font-semibold text-gray-900">{toChain.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">From Token:</span>
                  <span className="font-mono text-sm text-gray-900 break-all">{fromTokenAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To Token:</span>
                  <span className="font-mono text-sm text-gray-900 break-all">{toTokenAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-gray-900">{amount}</span>
                </div>
                {toAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Recipient:</span>
                    <span className="font-mono text-sm text-gray-900 break-all">{toAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                ⚠️ Please review the transaction details above carefully. Once you confirm, the transaction will be executed using thirdweb infrastructure.
              </p>
            </div>

            <button
              onClick={executeSwap}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : 'Confirm and Execute Bridge'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

