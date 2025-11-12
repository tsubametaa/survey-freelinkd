# Panduan Deployment ke Vercel

## Langkah-Langkah Deploy

### 1. Persiapan Environment Variables di Vercel

Setelah project di-push ke repository, buka dashboard Vercel dan set environment variables berikut:

```bash
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=freelinkd-db
NODE_ENV=production
```

**Penting:** Pastikan `MONGODB_URI` Anda sudah benar dan cluster MongoDB Atlas Anda:

- ✅ Mengizinkan koneksi dari semua IP (0.0.0.0/0) di Network Access
- ✅ Database user memiliki permission yang tepat (readWrite)
- ✅ Connection string menggunakan format yang benar

### 2. Deploy ke Vercel

```bash
# Install Vercel CLI (jika belum)
npm i -g vercel

# Login ke Vercel
vercel login

# Deploy
vercel --prod
```

Atau deploy melalui GitHub integration di dashboard Vercel.

### 3. Verifikasi Deployment

Setelah deploy berhasil, test dengan:

1. Buka URL production Anda
2. Isi form kuesioner lengkap
3. Submit form
4. Cek logs di Vercel dashboard jika ada error
5. Verifikasi data masuk ke MongoDB Atlas

### 4. Troubleshooting

#### Error: "Internal Server Error" saat submit

**Solusi:**

- Cek Vercel logs: Dashboard > Project > Deployments > Click deployment > View Function Logs
- Pastikan MONGODB_URI sudah di-set dengan benar di Vercel Environment Variables
- Pastikan MongoDB Atlas mengizinkan koneksi dari 0.0.0.0/0

#### Error: "MongoServerError: bad auth"

**Solusi:**

- Username/password MongoDB salah
- Pastikan password tidak mengandung karakter khusus yang perlu di-encode
- Generate password baru di MongoDB Atlas jika perlu

#### Error: "Connection timeout"

**Solusi:**

- Cek Network Access di MongoDB Atlas
- Tambahkan IP 0.0.0.0/0 untuk allow all (untuk production)
- Pastikan cluster MongoDB tidak dalam maintenance

#### Data tidak masuk ke database

**Solusi:**

- Cek Vercel Function Logs untuk error details
- Pastikan collection "kuesioner" ada di database (akan auto-create jika belum ada)
- Test koneksi MongoDB dengan MongoDB Compass

### 5. Monitoring

Setelah deploy, monitor:

- **Vercel Analytics:** Untuk traffic dan performance
- **Vercel Logs:** Untuk error tracking
- **MongoDB Atlas Monitoring:** Untuk database performance

### 6. Update Environment Variables

Jika perlu update environment variables:

1. Buka Vercel Dashboard > Project > Settings > Environment Variables
2. Edit atau tambah variable
3. Redeploy dengan: `vercel --prod` atau trigger via Git push

---

## Perbaikan yang Dilakukan

### ✅ Masalah: Internal Server Error di Production (FIXED - Nov 12, 2025)

**Penyebab:**

1. MongoDB connection tidak stabil di serverless environment
2. Timeout koneksi MongoDB terlalu pendek untuk cold starts
3. Tidak ada retry logic untuk koneksi yang gagal
4. MongoClient initialization tidak optimal untuk production

**Solusi yang Diterapkan:**

1. ✅ **Increased Timeouts:**

   - `serverSelectionTimeoutMS: 15000` (dari 10000)
   - `socketTimeoutMS: 60000` (dari 45000)
   - `connectTimeoutMS: 15000` (tambah baru)
   - `maxDuration: 15` (dari 10)

2. ✅ **Retry Logic:**

   - Tambah 3x retry untuk MongoDB connection
   - Delay 1 detik antara retry
   - Better error logging per attempt

3. ✅ **Production-Optimized Client:**

   - Create new MongoClient per invocation di production
   - Cache client di development untuk performance
   - Tambah ping test setelah koneksi untuk validasi

4. ✅ **Enhanced Logging:**

   ```typescript
   console.log("🔌 Connecting to MongoDB...");
   console.log("Environment:", process.env.NODE_ENV);
   console.log("MongoDB URI exists:", !!resolvedUri);
   console.log("Database name:", mongoDbName);
   ```

5. ✅ **Better Error Handling:**
   - Detailed error type logging
   - Stack trace in development
   - Graceful degradation jika revalidate gagal

### Code Changes Summary:

**`app/lib/db.ts`:**

```typescript
// Production: Create new client for serverless
if (process.env.NODE_ENV === "development") {
  // Cache globally in dev
} else {
  const client = new MongoClient(resolvedUri, clientOptions);
  clientPromise = client.connect();
}

// Tambah ping test
await db.admin().ping();
console.log("Database ping successful");
```

**`app/api/submit-questionnaire/route.ts`:**

```typescript
// Retry logic
let retries = 3;
while (retries > 0) {
  try {
    db = await getMongoDb();
    break;
  } catch (error) {
    retries--;
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}
```

### ✅ Environment Variables

Sekarang support fallback:

```typescript
const resolvedUri =
  process.env.MONGODB_URI ?? process.env.NEXT_PUBLIC_MONGODB_URI ?? "";
```

### ✅ Database Connection

Tambah error handling dan logging di `getMongoDb()`:

```typescript
export async function getMongoDb() {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    const connectedClient = await clientPromise;
    console.log("✅ MongoDB client connected");
    const db = connectedClient.db(mongoDbName);
    console.log("✅ Database instance retrieved:", mongoDbName);
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error(
      `Failed to connect to MongoDB: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
```

## Files Modified

- ✅ `app/api/submit-questionnaire/route.ts` - Enhanced error handling & logging
- ✅ `app/lib/db.ts` - Better MongoDB connection config
- ✅ `app/types/kuesioner.ts` - Fixed type definitions
- ✅ `vercel.json` - Added Vercel configuration
- ✅ `.env.example` - Added example environment variables

## Checklist Deployment

- [ ] Push semua changes ke Git repository
- [ ] Set environment variables di Vercel dashboard
- [ ] Verifikasi MongoDB Atlas Network Access (0.0.0.0/0)
- [ ] Deploy ke Vercel
- [ ] Test submit form di production
- [ ] Cek Vercel Function Logs
- [ ] Verifikasi data masuk ke MongoDB Atlas
- [ ] Test admin dashboard untuk lihat data

---

**Dibuat:** November 2025  
**Framework:** Next.js 16 + MongoDB + Vercel
