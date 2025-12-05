<div align="center">
  <h1>NullBridge MCP</h1>
  <h2>Cross-Chain Asset Bridge Agent</h2>
  <p><em>AI-Powered Cross-Chain Asset Bridging using thirdweb</em></p>
  <br>
  <p>
    <a href="#installation">Get Started</a> •
    <a href="#api-endpoints">API Docs</a> •
    <a href="#deployment">Deploy</a> •
    <a href="#support">Support</a>
  </p>
  <br>
</div>

---

## 🚀 Overview

**NullBridge MCP** is an advanced AI-powered cross-chain asset bridge agent that integrates with ChatGPT through the Model Context Protocol (MCP). Built for intelligent Web3 cross-chain operations, it provides seamless asset bridging across multiple blockchains using thirdweb infrastructure.

### ✨ Key Features

- 🌉 **Cross-Chain Bridging** - Bridge assets across Ethereum, Arbitrum, Base, Polygon, Optimism, and more
- ⚡ **thirdweb Integration** - Powered by thirdweb REST API for reliable bridge infrastructure
- 🔒 **Manual Confirmation** - Secure transaction confirmation via redirect URL
- 🤖 **AI-Powered** - Natural language bridge interactions through ChatGPT
- 🌐 **Multi-Chain Support** - Unified operations across 7+ blockchain networks
- 💎 **Native Token Support** - Bridge native tokens (ETH, MATIC, etc.) using special address

### 🏗️ Architecture

This project demonstrates the **OpenAI Apps SDK** integration with MCP server, featuring:
- **Tool Registration** with ChatGPT-specific metadata
- **Cross-Chain Bridge** functionality using thirdweb REST API
- **Manual Confirmation Flow** via redirect URL
- **Cross-Origin RSC** handling for seamless navigation

## Key Components

### 1. MCP Server Route (`app/mcp/route.ts`)

The core MCP server implementation that exposes the `bridge_asset` tool to ChatGPT.

**Key features:**
- **Tool registration** with OpenAI-specific metadata
- **Bridge asset tool** for cross-chain transactions
- **Confirmation URL generation** for manual transaction confirmation

### 2. Bridge Agent (`app/lib/bridge-agent.ts`)

Core logic for performing cross-chain swaps using thirdweb REST API.

**Key functions:**
- `performCrossChainSwap` - Prepares bridge transaction and returns confirmation URL
- `executeConfirmedSwap` - Executes the bridge transaction after user confirmation

### 3. thirdweb Bridge API (`app/lib/thirdweb-bridge-api.ts`)

Direct integration with thirdweb REST API for bridge operations.

**Key functions:**
- `bridgeSwap` - Execute cross-chain swap via thirdweb API
- `getBridgeChains` - Get supported chains
- `getBridgeRoutes` - Get available bridge routes

### 4. Bridge Confirmation Page (`app/bridge/confirm/page.tsx`)

Frontend page for manual transaction confirmation. Users review transaction details and confirm the bridge operation.

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- npm or pnpm
- Git
- thirdweb Client ID and Secret Key

### Quick Start

```bash
# Clone the repository
git clone https://github.com/envexx/NullBridge.git
cd NullBridge

# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Environment Setup

Create a `.env.local` file with required API keys:

```env
# thirdweb Configuration
THIRDWEB_CLIENT_ID=your_thirdweb_client_id
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key

# Optional: Base URL for production
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 🔧 Configuration

### Testing the MCP Server

The MCP server is available at:
```
http://localhost:3000/mcp
```

### Connecting from ChatGPT

1. Deploy your NullBridge app to your preferred hosting platform
2. In ChatGPT, navigate to **Settings → [Connectors](https://chatgpt.com/#settings/Connectors) → Create** and add your MCP server URL with the `/mcp` path (e.g., `https://nullbridge.vercel.app/mcp`)

**Note:** Connecting MCP servers to ChatGPT requires developer mode access. See the [connection guide](https://developers.openai.com/apps-sdk/deploy/connect-chatgpt) for setup instructions.

## 📡 API Endpoints

### Base URL
```
https://your-deployment-url.vercel.app/api
```

### 🌉 Cross-Chain Bridge

#### Bridge Asset
```http
POST /api/mcp/bridge-asset
```

**Request:**
```json
{
  "fromChainId": 42161,
  "toChainId": 8453,
  "fromTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "toTokenAddress": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
  "amount": "0.1",
  "toAddress": "0x742d35Cc6634C0532925a3b8D0b4E4f7E1D4D4f4",
  "confirmed": false
}
```

**Response (Pending Confirmation):**
```json
{
  "status": "pending_confirmation",
  "message": "Please confirm the transaction via the confirmation URL.",
  "confirmationUrl": "https://nullbridge.vercel.app/bridge/confirm?..."
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Cross-chain swap initiated successfully.",
  "transactionId": "tx_abc123",
  "explorerUrl": "https://arbiscan.io/tx/0x1234..."
}
```

## 🚀 Deployment

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/envexx/NullBridge)

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel
npm i -g vercel
vercel --prod

# Or deploy to Netlify
npm run build
npm i -g netlify-cli
netlify deploy --prod --dir .next
```

### Environment Variables

Set these in your deployment platform:

```env
THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 📋 Supported Chains

| Chain Name | Chain ID | Network Type |
|------------|----------|--------------|
| Ethereum | 1 | Mainnet |
| Arbitrum | 42161 | Mainnet |
| Base | 8453 | Mainnet |
| Polygon | 137 | Mainnet |
| Optimism | 10 | Mainnet |
| Arbitrum Sepolia | 421614 | Testnet |
| Base Sepolia | 84532 | Testnet |

## 🔄 Usage Flow

1. AI agent calls `bridge_asset` tool with bridge parameters
2. System prepares transaction and returns confirmation URL
3. User is redirected to confirmation page (`/bridge/confirm`)
4. User reviews transaction details
5. User manually confirms transaction
6. Transaction is executed and submitted to blockchain via thirdweb
7. User receives transaction hash and explorer URL

## 🆘 Support & Community

- 📖 **Documentation**: [docs.envexx.dev/nullbridge](https://docs.envexx.dev/nullbridge)
- 💬 **Discord**: [discord.gg/envexx](https://discord.gg/envexx)
- 🐛 **Issues**: [github.com/envexx/NullBridge/issues](https://github.com/envexx/NullBridge/issues)
- 📧 **Email**: support@envexx.dev

## 📄 License

**NullBridge MCP** is built by ENVXX for the decentralized future

---

<div align="center">
  <p><strong>Built with ❤️ by ENVXX Team</strong></p>
  <p>
    <a href="https://envexx.dev">Website</a> •
    <a href="https://twitter.com/envexx">Twitter</a> •
    <a href="https://github.com/envexx">GitHub</a>
  </p>
</div>
