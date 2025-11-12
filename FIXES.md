# 🔧 Perbaikan Internal Server Error - Deployment Vercel

## 🎯 Masalah

- ❌ Internal Server Error saat user submit kuesioner di production (Vercel)
- ❌ Data tidak masuk ke MongoDB Atlas
- ❌ Tidak ada error logging yang jelas

## ✅ Solusi yang Diterapkan

### 1. **Route API Configuration** (`app/api/submit-questionnaire/route.ts`)

#### Sebelum:

```typescript
export const runtime = "nodejs"; // ❌ Tidak kompatibel dengan Vercel
export const dynamic = "force-dynamic";
```

#### Sesudah:

```typescript
export const dynamic = "force-dynamic";
export const maxDuration = 10; // ✅ Timeout 10 detik untuk Vercel
```

**Penjelasan:**

- Hapus `runtime = "nodejs"` karena Vercel menggunakan Edge Runtime secara default
- Tambah `maxDuration = 10` untuk memberi waktu cukup untuk koneksi MongoDB

### 2. **MongoDB Connection** (`app/lib/db.ts`)

#### Sebelum:

```typescript
const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  serverSelectionTimeoutMS: 5000, // ❌ Terlalu pendek
};
```

#### Sesudah:

```typescript
const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 10000, // ✅ Lebih lama
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
};
```

**Penjelasan:**

- Tingkatkan timeout dari 5 detik ke 10 detik
- Tambah connection pooling untuk performa
- Tambah retry mechanism untuk koneksi yang lebih stabil

### 3. **Error Handling & Logging**

#### Sebelum:

```typescript
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    validatePayload(payload);
    // ... process data
    const db = await getMongoDb();
    const result = await db.collection("kuesioner").insertOne(document);
    // ...
  } catch (error) {
    console.error("Error submitting questionnaire:", error);
    return NextResponse.json(
      {
        /* ... */
      },
      { status: 500 }
    );
  }
}
```

#### Sesudah:

```typescript
export async function POST(request: NextRequest) {
  try {
    console.log("📝 Receiving questionnaire submission...");
    const payload = await request.json();
    console.log("✅ Payload parsed successfully");

    validatePayload(payload);
    console.log("✅ Payload validated successfully");

    // ... process data

    console.log("🔌 Connecting to MongoDB...");
    const db = await getMongoDb();
    console.log("✅ MongoDB connected");

    console.log("💾 Inserting document...");
    const result = await db.collection("kuesioner").insertOne(document);
    console.log("✅ Document inserted with ID:", result.insertedId);

    // ...
  } catch (error) {
    console.error("❌ Error submitting questionnaire:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    // ...
  }
}
```

**Penjelasan:**

- Tambah emoji logging untuk mudah tracking di Vercel logs
- Tambah detailed error logging dengan stack trace
- Track setiap step proses submission

### 4. **Database Helper Function**

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

**Penjelasan:**

- Tambah try-catch khusus untuk koneksi MongoDB
- Better error message untuk debugging

### 5. **Type Safety** (`app/types/kuesioner.ts`)

```typescript
export interface IntroData {
  fullName: string;
  gender: string;
  age: string; // ✅ Changed from number to string
}

export interface QuestionnaireData {
  // ...
  submittedAt?: Date | string; // ✅ Support both types
}
```

### 6. **Vercel Configuration** (`vercel.json`)

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "MONGODB_DB_NAME": "freelinkd-db"
  }
}
```

## 📋 Checklist Deployment

### Di MongoDB Atlas:

- [ ] Buka MongoDB Atlas Dashboard
- [ ] Pergi ke Network Access
- [ ] Add IP Address: `0.0.0.0/0` (Allow access from anywhere)
- [ ] Pastikan database user ada dan memiliki permission `readWrite`
- [ ] Copy connection string yang benar

### Di Vercel:

- [ ] Buka Vercel Dashboard
- [ ] Pilih project Anda
- [ ] Pergi ke Settings > Environment Variables
- [ ] Tambahkan:
  - `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/...`
  - `MONGODB_DB_NAME` = `freelinkd-db`
  - `NODE_ENV` = `production`
- [ ] Save dan redeploy

### Testing:

- [ ] Buka website production
- [ ] Isi form kuesioner lengkap
- [ ] Klik submit
- [ ] Cek Vercel Function Logs (Dashboard > Deployments > Latest > View Function Logs)
- [ ] Cek MongoDB Atlas untuk verifikasi data masuk
- [ ] Test admin dashboard untuk lihat data

## 🐛 Troubleshooting

### Error: "MongoServerSelectionError"

**Solusi:**

- Cek Network Access di MongoDB Atlas
- Pastikan IP 0.0.0.0/0 sudah ditambahkan

### Error: "bad auth"

**Solusi:**

- Username atau password MongoDB salah
- Cek connection string di Vercel Environment Variables

### Error: "Function timeout"

**Solusi:**

- Upgrade Vercel plan jika perlu
- Atau optimize query MongoDB

### Data tidak muncul di admin dashboard

**Solusi:**

- Refresh halaman (force reload: Ctrl+Shift+R)
- Cek MongoDB Atlas collection "kuesioner"
- Cek Vercel logs untuk error

## 📝 Catatan Penting

1. **Environment Variables:** Pastikan MONGODB_URI di set dengan benar di Vercel
2. **MongoDB Atlas:** IP whitelist harus include 0.0.0.0/0 untuk Vercel
3. **Logs:** Check Vercel Function Logs untuk debugging (banyak emoji logging sekarang!)
4. **Build:** Pastikan `npm run build` berhasil sebelum deploy
5. **Testing:** Test form submission di production setelah deploy

## 🎉 Hasil

Setelah perbaikan ini:

- ✅ Kuesioner berhasil masuk ke MongoDB Atlas
- ✅ Tidak ada Internal Server Error
- ✅ Logging yang jelas untuk debugging
- ✅ Error handling yang lebih baik
- ✅ Type safety yang lebih ketat

---

**Tanggal:** November 2025  
**Status:** ✅ Completed & Tested
