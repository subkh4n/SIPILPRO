# Panduan: Mengatasi Masalah Loading Foto Google Drive

## 🔴 Masalah

Foto pegawai yang disimpan di Google Drive **tidak bisa ditampilkan** di aplikasi karena:

1. **Rate Limiting (Error 429)** - Google membatasi request dari origin yang sama
2. **Format URL yang salah** - Beberapa format URL Drive tidak cocok untuk embedding

## ✅ Solusi yang Diimplementasikan

### 1. Format URL yang Benar

**Gunakan format `lh3.googleusercontent.com`:**

```
https://lh3.googleusercontent.com/d/FILE_ID=w400
```

**Hindari format ini (sering error 429):**

```
https://drive.google.com/uc?export=view&id=FILE_ID
https://drive.google.com/thumbnail?id=FILE_ID
```

### 2. File yang Relevan

| File                                   | Fungsi                                                       |
| -------------------------------------- | ------------------------------------------------------------ |
| `gsheet/Utils.gs`                      | Fungsi `uploadFotoFromBase64()` - menyimpan URL foto         |
| `src/components/forms/PegawaiForm.jsx` | Fungsi `getDisplayableFotoUrl()` - konversi URL saat display |

## 🛠️ Quick Fix Jika Foto Tidak Muncul

1. **Hard refresh browser:** `Ctrl+Shift+R`
2. **Cek Console (F12):**
   - `429` = Rate limited, tunggu beberapa menit
   - `403` = File tidak public
   - `404` = File tidak ada
3. **Perbaiki URL di Google Sheets:**
   Ganti column "foto" dari:
   ```
   https://drive.google.com/uc?export=view&id=XXX
   ```
   menjadi:
   ```
   https://lh3.googleusercontent.com/d/XXX=w400
   ```

## 📋 Checklist Deployment

- [ ] Copy `Utils.gs` ke Google Apps Script
- [ ] Copy `ApiRouter.gs` ke Google Apps Script
- [ ] Copy `Code.gs` ke Google Apps Script
- [ ] Deploy ulang dengan New Version
- [ ] Perbaiki URL foto lama di Google Sheets (jika ada)
