"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { MessageSquare } from "lucide-react";
import { useAccount } from "wagmi";
import {
  useWidgetProps,
  useMaxHeight,
  useDisplayMode,
  useRequestDisplayMode,
  useIsChatGptApp,
} from "./hooks";

export default function Home() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const toolOutput = useWidgetProps<{
    name?: string;
    result?: { structuredContent?: { name?: string } };
  }>();
  const maxHeight = useMaxHeight() ?? undefined;
  const displayMode = useDisplayMode();
  const requestDisplayMode = useRequestDisplayMode();
  const isChatGptApp = useIsChatGptApp();

  const name = toolOutput?.result?.structuredContent?.name || toolOutput?.name;

  useEffect(() => {
    if (isConnected) {
      router.push('/chatbot');
    }
  }, [isConnected, router]);

  return (
    <div className="min-h-screen bg-black text-white">
      {displayMode !== "fullscreen" && (
        <button
          aria-label="Enter fullscreen"
          className="fixed top-4 right-4 z-50 rounded-full bg-gray-900 border border-gray-700 text-white p-2.5 hover:bg-gray-800 transition-colors cursor-pointer"
          onClick={() => requestDisplayMode("fullscreen")}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"
            />
          </svg>
        </button>
      )}
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {!isChatGptApp && (
            <div className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                  <span className="font-bold text-sm">AI</span>
                </div>
                <div className="text-sm text-gray-300">
                  This app works best when connected to ChatGPT via MCP
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-4 mb-8">
              <Image
                src="/nullbridge.png"
                alt="NullBridge Logo"
                width={80}
                height={80}
                className="rounded-xl"
                priority
              />
              <h1 className="text-6xl font-bold text-white tracking-tight">
                NULLBRIDGE
              </h1>
            </div>
            
            <div className="mb-6">
              <p className="text-2xl font-light text-gray-300 mb-2">
                Cross-Chain Asset Bridge
              </p>
              <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                Seamlessly bridge your assets across Ethereum, Arbitrum, Base, Polygon, and Optimism. Powered by thirdweb infrastructure for secure, fast, and reliable cross-chain transfers.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/chatbot"
                className="px-8 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center gap-2 justify-center font-semibold border border-gray-300"
              >
                <MessageSquare className="w-5 h-5" />
                Start Bridging
              </Link>
              <Link
                href="/portfolio"
                className="px-8 py-3 bg-transparent border border-white text-white rounded-lg hover:bg-white hover:text-black transition-all duration-300 flex items-center gap-2 justify-center font-semibold"
              >
                View Portfolio
              </Link>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-700 rounded-full text-sm font-medium">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300">MCP Server Active</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Cross-Chain Bridge Features
          </h2>
          <p className="text-lg text-gray-400">
            Secure, fast, and reliable asset bridging across multiple blockchain networks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {/* Multi-Chain Support */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold text-xl">🌉</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Multi-Chain Support
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Bridge assets across Ethereum, Arbitrum, Base, Polygon, and Optimism with a single interface.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Active
            </div>
          </div>

          {/* Fast & Secure */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold text-xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Fast & Secure
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Powered by thirdweb infrastructure for secure, fast, and reliable cross-chain transfers with minimal slippage.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Built-in
            </div>
          </div>

          {/* Native & ERC20 Tokens */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold text-xl">🪙</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Native & ERC20 Tokens
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Bridge native tokens (ETH, MATIC, etc.) and ERC20 tokens across supported chains seamlessly.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Supported
            </div>
          </div>

          {/* Wallet Integration */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold text-xl">🔗</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Wallet Integration
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Connect with MetaMask, Coinbase Wallet, WalletConnect, and more. Non-custodial - you control your keys.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Available
            </div>
          </div>

          {/* Portfolio Tracking */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold text-xl">📊</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Portfolio Tracking
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Track your assets across all chains with real-time balance updates and transaction history.
            </p>
            <Link
              href="/portfolio"
              className="text-white hover:text-gray-300 flex items-center gap-1 font-medium mt-auto"
            >
              View Portfolio →
            </Link>
          </div>

          {/* MCP Integration */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all flex flex-col h-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4">
              <span className="text-black font-bold text-xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              MCP Integration
            </h3>
            <p className="text-gray-400 mb-4 flex-grow">
              Use with ChatGPT and other AI assistants via Model Context Protocol for intelligent bridge operations.
            </p>
            <div className="text-green-400 font-medium mt-auto">
              Available
            </div>
          </div>
        </div>
      </div>

      {/* API Integration */}
      <div className="bg-gray-900 py-16 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Supported Networks
            </h2>
            <p className="text-lg text-gray-400">
              Bridge assets between these blockchain networks
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Ethereum', chainId: 1, color: 'bg-blue-500' },
              { name: 'Arbitrum', chainId: 42161, color: 'bg-blue-600' },
              { name: 'Base', chainId: 8453, color: 'bg-blue-400' },
              { name: 'Polygon', chainId: 137, color: 'bg-purple-500' },
              { name: 'Optimism', chainId: 10, color: 'bg-red-500' },
            ].map((chain) => (
              <div key={chain.chainId} className="bg-black border border-gray-700 rounded-xl p-4 text-center">
                <div className={`w-12 h-12 ${chain.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                  <span className="text-white font-bold text-sm">{chain.name[0]}</span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{chain.name}</h3>
                <p className="text-xs text-gray-400">Chain ID: {chain.chainId}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-black mb-4">
            Ready to Bridge Your Assets?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Connect your wallet and start bridging assets across multiple blockchain networks in seconds
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chatbot"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Try Chatbot
            </Link>
            <Link
              href="/portfolio"
              className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              Start Analysis
            </Link>
            <a
              href="https://github.com/envexx/NullBridge"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-black text-black rounded-lg hover:bg-black hover:text-white transition-colors font-semibold flex items-center justify-center gap-2"
            >
              View Documentation
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2025 ENVXX. Built for the decentralized future.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <a 
                href="https://github.com/envexx/NullBridge" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a 
                href="https://nullbridge.vercel.app/api/privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                API
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
