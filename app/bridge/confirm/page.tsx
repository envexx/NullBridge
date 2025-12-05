'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { baseURL } from '@/baseUrl';
import { getChainById } from '@/app/lib/bridge-agent';
import { useAccount, useChainId, useSwitchChain, useSendTransaction, useWaitForTransactionReceipt, useConnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';

interface SwapConfirmationProps {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  toAddress?: string;
}


function BridgeConfirmContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [steps, setSteps] = useState<any[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const fromChainId = parseInt(searchParams.get('fromChainId') || '0');
  const toChainId = parseInt(searchParams.get('toChainId') || '0');
  const fromTokenAddress = searchParams.get('fromTokenAddress') || '';
  const toTokenAddress = searchParams.get('toTokenAddress') || '';
  const amount = searchParams.get('amount') || '';
  const toAddress = searchParams.get('toAddress') || '';

  const fromChain = getChainById(fromChainId);
  const toChain = getChainById(toChainId);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect, connectors, isPending: isConnecting } = useConnect();

  // Set wallet address from connected account
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    }
  }, [isConnected, address]);

  // Connect wallet using wagmi connector
  const connectWallet = async () => {
    try {
      // Find MetaMask or injected connector
      const injectedConnector = connectors.find(
        (c) => c.id === 'injected' || c.id === 'metaMask'
      );
      
      if (injectedConnector) {
        await connect({ connector: injectedConnector });
      } else if (connectors.length > 0) {
        // Use first available connector
        await connect({ connector: connectors[0] });
      } else {
        setError('No wallet connectors available. Please install MetaMask or another compatible wallet.');
      }
    } catch (err: any) {
      setError(`Failed to connect wallet: ${err.message}`);
    }
  };

  const { sendTransactionAsync } = useSendTransaction();
  const { switchChainAsync } = useSwitchChain();

  // Execute a single transaction step using wagmi
  const executeTransactionStep = async (step: any) => {
    if (!step.transaction) {
      throw new Error('Invalid transaction step: missing transaction data');
    }

    const { to, data, value, chainId: stepChainId } = step.transaction;

    // Switch chain if needed
    if (stepChainId && stepChainId !== chainId) {
      setCurrentStep(`Switching to chain ${stepChainId}...`);
      await switchChainAsync({ chainId: stepChainId });
      // Wait a bit for chain switch
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    setCurrentStep(`Executing ${step.action || 'transaction'}...`);

    // Send transaction using wagmi
    // Convert value to BigInt if it's a string
    const valueBigInt = typeof value === 'string' ? BigInt(value) : BigInt(value || '0');
    
    const txHash = await sendTransactionAsync({
      to: to as `0x${string}`,
      data: data as `0x${string}`,
      value: valueBigInt,
    });

    setCurrentStep(`Waiting for confirmation...`);
    
    return {
      hash: txHash,
    };
  };

  // Execute bridge swap
  const executeSwap = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);
    setCurrentStep('Preparing bridge transaction...');

    try {
      // Step 1: Get prepared steps from API
      const prepareResponse = await fetch(`${baseURL}/api/mcp/bridge-asset`, {
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
          toAddress: toAddress || address,
          confirmed: true,
        }),
      });

      if (!prepareResponse.ok) {
        const errorData = await prepareResponse.json();
        throw new Error(errorData.error || `HTTP ${prepareResponse.status}: ${prepareResponse.statusText}`);
      }

      const prepareResult = await prepareResponse.json();

      if (prepareResult.status !== 'success' || !prepareResult.steps || !prepareResult.transactions) {
        throw new Error(prepareResult.error || 'Failed to prepare bridge transaction');
      }

      setSteps(prepareResult.steps);

      // Step 2: Verify wallet is connected (already checked at start)
      if (!address) {
        throw new Error('Wallet not connected');
      }

      // Step 3: Execute each transaction step using wagmi
      const executedTransactions: any[] = [];
      
      // Execute transactions from steps
      // Each step may contain multiple transactions
      for (let i = 0; i < prepareResult.steps.length; i++) {
        const step = prepareResult.steps[i];
        setCurrentStep(`Step ${i + 1}/${prepareResult.steps.length}: ${step.action || 'Processing'}...`);
        
        // Execute each transaction in the step
        if (step.transactions && Array.isArray(step.transactions)) {
          for (const tx of step.transactions) {
            const result = await executeTransactionStep({
              transaction: tx,
              action: step.action,
            });
            executedTransactions.push(result);
            
            // Wait a bit between transactions
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        } else if (step.transaction) {
          // Single transaction in step
          const result = await executeTransactionStep(step);
          executedTransactions.push(result);
          
          // Wait a bit between steps
          if (i < prepareResult.steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
          }
        }
      }

      // Step 4: Get the last transaction hash
      const lastTx = executedTransactions[executedTransactions.length - 1];
      const finalTxHash = lastTx.hash;

      setTransactionHash(finalTxHash);
      setSuccess(true);
      setCurrentStep('Transaction completed successfully!');

      // Generate explorer URL
      const chain = getChainById(fromChainId);
      if (chain && chain.explorerUrl) {
        setExplorerUrl(`${chain.explorerUrl}/tx/${finalTxHash}`);
      }

    } catch (err: any) {
      console.error('Error during swap execution:', err);
      setError(err.message || 'An error occurred while executing the swap');
      setCurrentStep('');
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
            {transactionHash && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-2">Transaction Hash:</p>
                <p className="text-sm font-mono text-gray-900 break-all">{transactionHash}</p>
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
                {walletAddress && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Wallet:</span>
                    <span className="font-mono text-sm text-gray-900 break-all">{walletAddress}</span>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {currentStep && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800">{currentStep}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                ⚠️ Please review the transaction details above carefully. Once you confirm, the transaction will be executed using your connected wallet.
              </p>
            </div>

            {!isConnected && (
              <div className="mb-4">
                <ConnectButton.Custom>
                  {({
                    account,
                    chain,
                    openAccountModal,
                    openChainModal,
                    openConnectModal,
                    authenticationStatus,
                    mounted,
                  }) => {
                    const ready = mounted && authenticationStatus !== 'loading';
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === 'authenticated');

                    return (
                      <div
                        {...(!ready && {
                          'aria-hidden': true,
                          'style': {
                            opacity: 0,
                            pointerEvents: 'none',
                            userSelect: 'none',
                          },
                        })}
                      >
                        {(() => {
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal}
                                type="button"
                                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                                disabled={isConnecting}
                              >
                                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                              </button>
                            );
                          }

                          return null;
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>
            )}

            <button
              onClick={executeSwap}
              disabled={loading || !isConnected}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (currentStep || 'Processing...') : 'Confirm and Execute Bridge'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BridgeConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <BridgeConfirmContent />
    </Suspense>
  );
}
