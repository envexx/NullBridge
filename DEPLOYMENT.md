# NullBridge MCP - Deployment Guide

## 🚀 Deploy ke Vercel

### Opsi 1: Deploy via Vercel Dashboard (Recommended)

1. **Buka Vercel Dashboard**
   - Kunjungi https://vercel.com
   - Login dengan GitHub account

2. **Import Project**
   - Klik "Add New..." → "Project"
   - Pilih repository: `envexx/NullBridge`
   - Atau paste URL: `https://github.com/envexx/NullBridge`

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detect)
   - **Root Directory**: `mcp-aura` (penting!)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

4. **Environment Variables**
   Tambahkan environment variables berikut:
   ```
   THIRDWEB_CLIENT_ID=your_thirdweb_client_id
   THIRDWEB_SECRET_KEY=your_thirdweb_secret_key
   NEXT_PUBLIC_BASE_URL=https://nullbridge.vercel.app
   NEXT_PUBLIC_APP_URL=https://nullbridge.vercel.app
   ```

5. **Deploy**
   - Klik "Deploy"
   - Tunggu build selesai (2-5 menit)
   - Setelah selesai, dapatkan URL deployment

6. **Set Custom Domain (Optional)**
   - Jika ingin menggunakan `nullbridge.vercel.app`
   - Go to Project Settings → Domains
   - Add domain: `nullbridge.vercel.app`

### Opsi 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login ke Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd mcp-aura
   vercel
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add THIRDWEB_CLIENT_ID
   vercel env add THIRDWEB_SECRET_KEY
   vercel env add NEXT_PUBLIC_BASE_URL
   vercel env add NEXT_PUBLIC_APP_URL
   ```

5. **Deploy ke Production**
   ```bash
   vercel --prod
   ```

### Opsi 3: Auto-Deploy dari GitHub

1. **Connect Repository di Vercel**
   - Vercel akan otomatis detect push ke branch `main`
   - Setiap push akan trigger deployment baru

2. **Set Environment Variables di Vercel Dashboard**
   - Project Settings → Environment Variables
   - Add semua variables yang diperlukan

3. **Configure Root Directory**
   - Project Settings → General → Root Directory
   - Set ke: `mcp-aura`

## ✅ Verifikasi Deployment

Setelah deployment selesai, verifikasi dengan:

1. **Cek MCP Endpoint**
   ```
   GET https://nullbridge.vercel.app/mcp
   ```
   Expected response: MCP server info JSON

2. **Cek Health**
   ```
   GET https://nullbridge.vercel.app/
   ```
   Expected: Homepage loads

3. **Test Bridge Endpoint**
   ```
   POST https://nullbridge.vercel.app/api/mcp/bridge-asset
   ```

## 🔧 Troubleshooting

### Error: DEPLOYMENT_NOT_FOUND

**Penyebab:**
- Deployment belum dibuat
- Deployment sudah expired/dihapus
- Domain tidak terhubung dengan deployment

**Solusi:**
1. Cek Vercel Dashboard → Projects
2. Pastikan project `NullBridge` ada dan aktif
3. Jika tidak ada, buat deployment baru
4. Jika ada tapi domain tidak match, update domain di settings

### Error: Build Failed

**Penyebab:**
- Missing dependencies
- Build errors
- Environment variables tidak set

**Solusi:**
1. Cek build logs di Vercel Dashboard
2. Pastikan semua dependencies di `package.json`
3. Set semua required environment variables
4. Test build lokal: `npm run build`

### Error: Route Not Found (404)

**Penyebab:**
- Route tidak ter-deploy
- Root directory salah

**Solusi:**
1. Pastikan Root Directory = `mcp-aura`
2. Pastikan file `app/mcp/route.ts` ada
3. Rebuild dan redeploy

## 📝 Checklist Deployment

- [ ] Repository terhubung dengan Vercel
- [ ] Root Directory = `mcp-aura`
- [ ] Environment variables sudah di-set
- [ ] Build berhasil tanpa error
- [ ] Deployment URL bisa diakses
- [ ] `/mcp` endpoint merespons
- [ ] Custom domain (optional) sudah di-set

## 🔗 Links Penting

- **Vercel Dashboard**: https://vercel.com/dashboard
- **GitHub Repository**: https://github.com/envexx/NullBridge
- **Production URL**: https://nullbridge.vercel.app
- **MCP Endpoint**: https://nullbridge.vercel.app/mcp

---

**Note**: Setelah deployment, pastikan URL di `openai-schema.json` dan `mcp-config.json` sesuai dengan URL deployment yang sebenarnya.

