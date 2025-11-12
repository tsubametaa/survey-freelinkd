# Setup Environment Variables di Vercel

## ⚠️ PENTING - Langkah Wajib Sebelum Deploy

Setelah push code ke GitHub/GitLab, **SEBELUM** atau **SEGERA SETELAH** deploy pertama kali, Anda **HARUS** set environment variables di Vercel Dashboard.

## 📋 Langkah-Langkah

### 1. Buka Vercel Dashboard

- Login ke [vercel.com](https://vercel.com)
- Pilih project Anda: **freelinkd-kuesioner** atau **survey-freelinkd**

### 2. Masuk ke Settings

- Klik tab **Settings** di menu atas
- Pilih **Environment Variables** di sidebar kiri

### 3. Tambah Environment Variables

Tambahkan 2 variables berikut:

#### Variable 1: MONGODB_URI

```
Key: MONGODB_URI
Value: mongodb+srv://freelinkd-admin:masaryoganteng@freelinkddb.qw4pmtq.mongodb.net/freelinkd-db?retryWrites=true&w=majority&authSource=admin&appName=FreelinkdDB
Environment: Production, Preview, Development (centang semua)
```

#### Variable 2: MONGODB_DB_NAME

```
Key: MONGODB_DB_NAME
Value: freelinkd-db
Environment: Production, Preview, Development (centang semua)
```

### 4. Save dan Redeploy

- Klik **Save** untuk setiap variable
- Setelah semua tersimpan, klik **Deployments** di menu atas
- Cari deployment terbaru (yang paling atas)
- Klik tombol **⋮** (three dots) di kanan
- Pilih **Redeploy**
- Centang **Use existing Build Cache** (optional, untuk lebih cepat)
- Klik **Redeploy**

### 5. Verifikasi

Setelah redeploy selesai:

- Buka URL production: https://survey.freelinkd.com
- Test submit form kuesioner
- Jika masih error, cek **Function Logs**:
  - Deployments > Click deployment terbaru > View Function Logs
  - Cari log dari `/api/submit-questionnaire`

## 🔧 Troubleshooting

### Error: "Missing MONGODB_URI environment variable"

**Solusi:** Environment variable belum di-set atau typo di nama variable.

- Double check spelling: `MONGODB_URI` (huruf besar semua)
- Pastikan sudah save dan redeploy

### Error: "MongoServerError: bad auth"

**Solusi:** Credential MongoDB salah

- Pastikan username: `freelinkd-admin`
- Pastikan password: `masaryoganteng`
- Atau generate credential baru di MongoDB Atlas

### Error: "Connection timeout"

**Solusi:** Network Access di MongoDB Atlas belum di-set

1. Buka [MongoDB Atlas](https://cloud.mongodb.com)
2. Pilih cluster: **FreelinkdDB**
3. Klik **Network Access** di sidebar kiri
4. Klik **+ ADD IP ADDRESS**
5. Pilih **ALLOW ACCESS FROM ANYWHERE**
6. Input IP: `0.0.0.0/0`
7. Klik **Confirm**

### Form tetap error 500 setelah redeploy

**Solusi:** Cek Function Logs untuk detail error

1. Vercel Dashboard > Deployments
2. Click deployment terbaru
3. Click **View Function Logs**
4. Filter by `/api/submit-questionnaire`
5. Lihat error message detail

## 📸 Screenshot Guide

### Lokasi Environment Variables

```
Vercel Dashboard
└── Your Project
    └── Settings (tab)
        └── Environment Variables (sidebar)
            └── + Add New
```

### Format Variable

```
┌─────────────────────────────────────────────┐
│ Key                                         │
│ MONGODB_URI                                 │
├─────────────────────────────────────────────┤
│ Value                                       │
│ mongodb+srv://freelinkd-admin:...           │
├─────────────────────────────────────────────┤
│ Environment                                 │
│ ☑ Production                                │
│ ☑ Preview                                   │
│ ☑ Development                               │
└─────────────────────────────────────────────┘
        [Cancel]  [Save]
```

## ✅ Checklist

- [ ] Login ke Vercel Dashboard
- [ ] Buka project settings
- [ ] Tambah `MONGODB_URI` dengan value lengkap
- [ ] Tambah `MONGODB_DB_NAME` dengan value `freelinkd-db`
- [ ] Centang semua environment (Production, Preview, Development)
- [ ] Save semua variables
- [ ] Redeploy dari Deployments tab
- [ ] Test submit form di production
- [ ] Verifikasi data masuk ke MongoDB Atlas

---

**Catatan:** File `vercel.json` sudah diperbaiki untuk tidak reference secret yang tidak exist. Environment variables sekarang harus di-set manual via Vercel Dashboard.

**Updated:** November 12, 2025
