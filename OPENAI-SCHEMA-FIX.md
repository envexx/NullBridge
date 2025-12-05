# OpenAI Schema Fix - RequestBody & Response Schemas

## Masalah

ChatGPT mendapatkan string kosong dan tidak tahu parameter apa yang harus dikirim karena `openai-schema.json` tidak memiliki:
- `requestBody` schema untuk POST endpoints
- `responses` schema untuk semua endpoints
- Parameter schema untuk GET endpoints

## Solusi

Telah ditambahkan schema lengkap untuk semua endpoints:

### 1. `/mcp` GET
- Menambahkan `responses` schema dengan informasi server

### 2. `/mcp` POST
- Menambahkan `requestBody` schema untuk JSON-RPC format
- Menambahkan `responses` schema

### 3. `/api/mcp/bridge-asset` POST
- **requestBody schema** dengan parameter:
  - `fromChainId` (number, required)
  - `toChainId` (number, required)
  - `fromTokenAddress` (string, required)
  - `toTokenAddress` (string, required)
  - `amount` (string, required)
  - `toAddress` (string, optional)
  - `confirmed` (boolean, optional, default: false)
- **responses schema** dengan format response yang jelas

### 4. `/api/mcp/portfolio` POST
- **requestBody schema** dengan parameter:
  - `address` (string, required)
  - `chainIds` (array, optional)
  - `tokenAddresses` (object, optional)
- **responses schema**

### 5. `/api/mcp/wallet-balance` POST
- **requestBody schema** dengan parameter:
  - `walletAddress` atau `address` (string)
  - `chain` (string) atau `chainId` (number)
  - `token` (string, optional)
  - `tokenAddress` (string, optional)
- **responses schema**

### 6. `/api/privacy-policy` GET
- Menambahkan endpoint privacy policy ke schema
- **responses schema**

## Hasil

Sekarang ChatGPT akan tahu:
- Parameter apa yang harus dikirim untuk setiap endpoint
- Format request body yang benar
- Format response yang akan diterima
- Contoh nilai untuk setiap parameter

## Testing

Setelah schema diperbarui, ChatGPT harusnya bisa:
1. Memanggil `/api/mcp/bridge-asset` dengan parameter lengkap
2. Memanggil `/api/mcp/wallet-balance` dengan chain, token, dan walletAddress
3. Memahami format response dari setiap endpoint

## Catatan

- Schema menggunakan format OpenAPI 3.1.0
- Semua endpoints menggunakan format JSON
- CORS headers sudah disetel untuk semua endpoints
- Privacy policy endpoint ditambahkan untuk compliance

