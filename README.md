# SIPILPRO - Sistem Manajemen Proyek Konstruksi

Aplikasi web untuk manajemen proyek konstruksi dengan fitur absensi multi-site dan pencatatan keuangan.

## Fitur

- 📊 **Dashboard** - Overview proyek, hutang, dan saldo kas
- 👷 **Absensi** - Input kehadiran dengan multi-session dan auto-calculate lembur
- 🛒 **Belanja** - Input nota dengan split-bill per proyek
- 💳 **Hutang** - Monitoring hutang vendor dengan due date tracking
- 🏗️ **Proyek** - List proyek dengan cost breakdown

## Quick Start

```bash
npm install
npm run dev
```

Buka http://localhost:5173

---

## Integrasi Google Sheets (Backend)

Aplikasi ini dapat menggunakan Google Sheets sebagai database. Ikuti langkah berikut:

### Step 1: Buat Google Spreadsheet

1. Buka [sheets.google.com](https://sheets.google.com)
2. Buat spreadsheet baru dengan nama "SIPILPRO Database"
3. Copy **Spreadsheet ID** dari URL:
   ```
   https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
   ```

### Step 2: Buat Google Apps Script

1. Buka [script.google.com](https://script.google.com)
2. Klik "New Project"
3. Hapus semua kode default
4. Copy-paste isi file `google-apps-script/Code.gs`
5. Ganti `YOUR_SPREADSHEET_ID_HERE` dengan Spreadsheet ID Anda
6. Simpan project (Ctrl+S)

### Step 3: Setup Spreadsheet (Sekali Saja)

1. Di Apps Script Editor, pilih function `setupSpreadsheet`
2. Klik tombol ▶️ Run
3. Izinkan akses saat diminta
4. Spreadsheet akan terisi dengan sheets dan sample data

### Step 4: Deploy Web App

1. Klik "Deploy" > "New deployment"
2. Pilih type: "Web app"
3. Settings:
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik "Deploy"
5. Copy **Web App URL** yang diberikan

### Step 5: Configure React App

1. Buka file `src/services/api.js`
2. Ganti URL:
   ```javascript
   export const API_URL =
     "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
   ```
3. Restart dev server

---

## Struktur Spreadsheet

| Sheet   | Columns                                                                |
| ------- | ---------------------------------------------------------------------- |
| Proyek  | id, name, location, status                                             |
| Tukang  | id, name, skill, rateNormal, rateOvertime, rateHoliday                 |
| Vendor  | id, name, address, phone                                               |
| Absensi | id, date, workerId, sessions, totalHours, isHoliday, wage              |
| Belanja | id, invoiceNo, date, vendorId, total, status, dueDate, items, paidDate |

---

## Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Vanilla CSS (Dark Theme)
- **Icons**: Lucide React
- **Date**: date-fns
- **Backend**: Google Apps Script + Google Sheets
