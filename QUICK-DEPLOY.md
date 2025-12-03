# 🚀 Quick Deploy Guide - NullBridge MCP

## ⚠️ Masalah: DEPLOYMENT_NOT_FOUND

Error ini berarti deployment belum dibuat di Vercel atau sudah expired.

## ✅ Solusi: Buat Deployment Baru

### Langkah 1: Buka Vercel Dashboard
1. Buka https://vercel.com
2. Login dengan GitHub account (yang punya akses ke repo `envexx/NullBridge`)

### Langkah 2: Import Project
1. Klik **"Add New..."** → **"Project"**
2. Pilih repository: **`envexx/NullBridge`**
3. Atau paste URL: `https://github.com/envexx/NullBridge`

### Langkah 3: Configure Project Settings

**PENTING**: Set Root Directory!
- **Root Directory**: `mcp-aura` ⚠️
- **Framework Preset**: Next.js (auto-detect)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### Langkah 4: Set Environment Variables

Tambahkan environment variables berikut sebelum deploy:

| Variable Name | Value | Required |
|--------------|-------|----------|
| `THIRDWEB_CLIENT_ID` | Your thirdweb client ID | ✅ Yes |
| `THIRDWEB_SECRET_KEY` | Your thirdweb secret key | ✅ Yes |
| `NEXT_PUBLIC_BASE_URL` | `https://nullbridge.vercel.app` | Optional |
| `NEXT_PUBLIC_APP_URL` | `https://nullbridge.vercel.app` | Optional |

**Cara set:**
- Scroll ke bawah di halaman import project
- Section "Environment Variables"
- Add each variable

### Langkah 5: Deploy
1. Klik **"Deploy"**
2. Tunggu build selesai (2-5 menit)
3. Setelah selesai, dapatkan URL deployment (misalnya: `nullbridge-xxx.vercel.app`)

### Langkah 6: Set Custom Domain (Optional)

Jika ingin menggunakan `nullbridge.vercel.app`:
1. Go to **Project Settings** → **Domains**
2. Add domain: `nullbridge.vercel.app`
3. Vercel akan memberikan instruksi untuk verify domain

## 🧪 Test Deployment

Setelah deployment selesai, test endpoint:

### 1. Test MCP Endpoint
```bash
curl https://nullbridge.vercel.app/mcp
```

Expected: JSON response dengan MCP server info

### 2. Test Homepage
```bash
curl https://nullbridge.vercel.app/
```

Expected: HTML homepage

### 3. Test di Browser
Buka: https://nullbridge.vercel.app/mcp

## 🔄 Update URL di Config Files

Setelah dapat URL deployment, update:

1. **openai-schema.json**
   ```json
   "servers": [{
     "url": "https://nullbridge.vercel.app",
     ...
   }]
   ```

2. **mcp-config.json**
   ```json
   "serverUrl": "https://nullbridge.vercel.app/mcp"
   ```

3. **baseUrl.ts** (sudah auto-detect dari env vars)

4. Push perubahan ke GitHub

## 📋 Checklist

- [ ] Login ke Vercel Dashboard
- [ ] Import project `envexx/NullBridge`
- [ ] Set Root Directory = `mcp-aura`
- [ ] Set Environment Variables
- [ ] Deploy project
- [ ] Dapatkan deployment URL
- [ ] Test `/mcp` endpoint
- [ ] Update URL di config files (jika perlu)
- [ ] Push perubahan ke GitHub

## 🆘 Masalah Lain?

### Build Error?
- Cek build logs di Vercel Dashboard
- Pastikan semua dependencies ada di `package.json`
- Test build lokal: `cd mcp-aura && npm run build`

### 404 Error setelah deploy?
- Pastikan Root Directory = `mcp-aura`
- Pastikan file `app/mcp/route.ts` ada
- Cek build logs untuk error

### Domain tidak bisa di-set?
- Pastikan domain tidak digunakan oleh project lain
- Jika menggunakan custom domain, pastikan DNS sudah di-set
- Untuk `*.vercel.app` subdomain, tidak perlu DNS setup

---

**Setelah deployment selesai, ChatGPT MCP connection akan bekerja!** 🎉

