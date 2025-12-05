# Wallet Balance Endpoint Documentation

## Endpoint: `/api/mcp/wallet-balance`

### Overview
Endpoint untuk mendapatkan balance wallet menggunakan thirdweb SDK v5, sesuai dengan contoh kode yang diberikan.

### Request Format

**Method:** `POST`

**Content-Type:** `application/json`

**Parameters:**
```json
{
  "walletAddress": "0xebf3e11713079039b2cfba51a4dba8092e1480b6", // atau "address"
  "chain": "ethereum", // atau "chainId": 1
  "token": "ETH" // optional, untuk native token atau tokenAddress untuk ERC20
}
```

**Supported Parameters:**
- `walletAddress` (string, required) - Alamat wallet yang akan dicek balance-nya
- `address` (string, alternative) - Alternatif untuk walletAddress
- `chain` (string, required jika chainId tidak ada) - Nama chain: "ethereum", "base", "polygon", dll.
- `chainId` (number, required jika chain tidak ada) - ID chain: 1, 8453, 137, dll.
- `token` (string, optional) - Token symbol seperti "ETH", "MATIC" untuk native token, atau alamat token ERC20 (0x...)
- `tokenAddress` (string, optional) - Alamat token ERC20 jika ingin cek balance token tertentu

### Response Format

**Success Response (200):**
```json
{
  "status": "success",
  "walletAddress": "0xebf3e11713079039b2cfba51a4dba8092e1480b6",
  "chainId": 1,
  "chainName": "Ethereum Mainnet",
  "tokenAddress": "native",
  "tokenName": "Ethereum",
  "tokenSymbol": "ETH",
  "balance": "1.5",
  "value": "1500000000000000000",
  "decimals": 18,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**Error Response (400/500):**
```json
{
  "status": "failed",
  "error": "Error message here",
  "walletAddress": "0x...",
  "chainId": 1,
  "chainName": "Ethereum Mainnet"
}
```

### Supported Chains

- `ethereum` / `1` - Ethereum Mainnet
- `optimism` / `10` - Optimism Mainnet
- `polygon` / `137` - Polygon Mainnet
- `arbitrum` / `42161` - Arbitrum One
- `base` / `8453` - Base Mainnet
- `sepolia` / `11155111` - Ethereum Sepolia
- `optimism-sepolia` / `11155420` - Optimism Sepolia
- `polygon-amoy` / `80002` - Polygon Amoy
- `arbitrum-sepolia` / `421614` - Arbitrum Sepolia
- `base-sepolia` / `84532` - Base Sepolia

### Implementation Details

Endpoint ini menggunakan:
- `getWalletBalance` dari `thirdweb/wallets` (sesuai contoh)
- `thirdwebClient` dari `@/app/lib/thirdweb-client`
- Chain objects dari `thirdweb/chains`

### Example Usage

**Check Native ETH Balance:**
```bash
curl -X POST https://null-bridge.vercel.app/api/mcp/wallet-balance \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xebf3e11713079039b2cfba51a4dba8092e1480b6",
    "chain": "ethereum",
    "token": "ETH"
  }'
```

**Check ERC20 Token Balance:**
```bash
curl -X POST https://null-bridge.vercel.app/api/mcp/wallet-balance \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0xebf3e11713079039b2cfba51a4dba8092e1480b6",
    "chain": "ethereum",
    "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  }'
```

### Notes

- Jika `token` adalah simbol native token (ETH, MATIC), tidak perlu mengirim `tokenAddress` (undefined = native)
- Jika `token` adalah alamat token (0x...), akan digunakan sebagai `tokenAddress`
- Endpoint mengembalikan balance dalam format human-readable (`displayValue`) dan raw value dalam wei (`value`)
- Endpoint mendukung CORS untuk akses dari browser

