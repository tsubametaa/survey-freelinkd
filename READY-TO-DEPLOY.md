# 🚀 READY TO DEPLOY - Instruksi Cepat

## ✅ Masalah Sudah Diperbaiki

**Error:** `Environment Variable "MONGODB_URI" references Secret "mongodb-uri", which does not exist.`

**Status:** ✅ FIXED

**Perbaikan:**

1. ✅ Hapus reference ke secret `@mongodb-uri` dari `vercel.json`
2. ✅ Update `db.ts` agar tidak throw error saat build time
3. ✅ Tambah retry logic untuk MongoDB connection
4. ✅ Increase timeout untuk serverless cold starts
5. ✅ Build berhasil tanpa error

## 🎯 Langkah Deploy (PENTING!)

### 1. Push Code ke Git

```bash
git add .
git commit -m "Fix: MongoDB connection for production serverless"
git push origin main
```

### 2. Set Environment Variables di Vercel

**WAJIB DILAKUKAN!** Buka Vercel Dashboard:

1. Login ke https://vercel.com
2. Pilih project: **survey-freelinkd** atau **freelinkd-kuesioner**
3. Klik **Settings** → **Environment Variables**
4. Tambah 2 variables:

```
Key: MONGODB_URI
Value: mongodb+srv://freelinkd-admin:masaryoganteng@freelinkddb.qw4pmtq.mongodb.net/freelinkd-db?retryWrites=true&w=majority&authSource=admin&appName=FreelinkdDB
Environment: ☑ Production ☑ Preview ☑ Development
```

```
Key: MONGODB_DB_NAME
Value: freelinkd-db
Environment: ☑ Production ☑ Preview ☑ Development
```

5. **SAVE** kedua variables

### 3. Redeploy

Setelah environment variables di-set:

**Option A - Via Vercel Dashboard:**

- Klik **Deployments**
- Klik **⋮** di deployment terbaru
- Pilih **Redeploy**
- Klik **Redeploy** lagi untuk confirm

**Option B - Via Git Push:**

- Push commit baru atau trigger redeploy
- Vercel akan auto-deploy dengan env variables yang baru

### 4. Test Form

1. Buka https://survey.freelinkd.com
2. Isi form kuesioner lengkap
3. Submit
4. ✅ Harus berhasil tanpa error 500!

### 5. Verifikasi Data

1. Buka MongoDB Atlas
2. Browse Collections → `freelinkd-db` → `kuesioner`
3. Check apakah data baru masuk

## 🔍 Jika Masih Error

### Cek Function Logs:

1. Vercel Dashboard → **Deployments**
2. Click deployment terbaru
3. Click **View Function Logs**
4. Filter: `/api/submit-questionnaire`
5. Lihat error detail dengan emoji logs:
   - 🔌 = Connecting to MongoDB
   - ✅ = Success
   - ❌ = Error

### Common Issues:

**Error: "Missing MONGODB_URI"**
→ Environment variable belum di-set di Vercel
→ Pastikan spelling benar: `MONGODB_URI` (all caps)

**Error: "MongoServerError: bad auth"**
→ Username/password salah
→ Check credentials di MongoDB Atlas

**Error: "Connection timeout"**
→ Network Access di MongoDB Atlas belum allow 0.0.0.0/0
→ Tambahkan IP whitelist

## 📁 Files Modified

- ✅ `app/lib/db.ts` - Fixed build-time error, added retry logic
- ✅ `app/api/submit-questionnaire/route.ts` - Added 3x retry, increased timeout
- ✅ `vercel.json` - Removed secret reference
- ✅ `.env.production` - Updated for local build
- ✅ `VERCEL-ENV-SETUP.md` - Detailed setup guide

## 💡 Key Changes

**db.ts:**

- Warning instead of throw during build
- Lazy initialization of MongoClient
- Better error messages pointing to Vercel settings

**API Route:**

- 3x retry with 1s delay between attempts
- maxDuration: 15 seconds (from 10)
- Enhanced logging with emojis for easy tracking

**MongoDB Client:**

- serverSelectionTimeoutMS: 15000ms
- socketTimeoutMS: 60000ms
- connectTimeoutMS: 15000ms
- Optimized for serverless cold starts

## ✅ Checklist

- [ ] Build berhasil (`npm run build`) ✅ DONE
- [ ] Push code ke Git repository
- [ ] Set `MONGODB_URI` di Vercel Dashboard
- [ ] Set `MONGODB_DB_NAME` di Vercel Dashboard
- [ ] Redeploy dari Vercel
- [ ] Test submit form di production
- [ ] Verifikasi data di MongoDB Atlas
- [ ] Check Function Logs jika ada issue

---

**Status:** ✅ READY TO DEPLOY  
**Updated:** November 12, 2025  
**Next Step:** Push code & set environment variables di Vercel Dashboard
