/**
 * SIPILPRO - Configuration File
 * Konfigurasi terpusat untuk semua settings
 */

// ============================================
// SPREADSHEET CONFIGURATION
// ============================================
const CONFIG = {
  // GANTI DENGAN SPREADSHEET ID ANDA!
  SPREADSHEET_ID: "1hnMCHRbm5fYtr_LgqwqaeNcx3qMZX-zORr0r4TlmgMk",

  // Sheet Names - Sesuaikan dengan nama sheet Anda
  SHEETS: {
    PROYEK: "Proyek",
    TUKANG: "Tukang",
    VENDOR: "Vendor",
    ABSENSI: "Absensi",
    BELANJA: "Belanja",
    KALENDER: "Kalender",
    SETTINGS: "Settings",
    // Master Data Sheets
    MASTER_JABATAN: "MasterJabatan",
    MASTER_GOLONGAN: "MasterGolongan",
    MASTER_JAM_MASUK: "MasterJamMasuk",
  },

  // Column Headers per Sheet
  HEADERS: {
    PROYEK: ["id", "name", "location", "status", "startDate", "endDate", "rap"],
    TUKANG: [
      "id",
      "nip",
      "name",
      "jabatan",
      "skill",
      "tipe",
      "phone",
      "alamat",
      "rateNormal",
      "rateOvertime",
      "rateHoliday",
      "status",
      "foto",
      "tanggalMasuk",
      "tanggalLahir",
      "noKTP",
      "bpjs",
    ],
    VENDOR: ["id", "name", "address", "phone", "email", "status"],
    ABSENSI: [
      "id",
      "date",
      "workerId",
      "sessions",
      "totalHours",
      "isHoliday",
      "wage",
    ],
    BELANJA: [
      "id",
      "invoiceNo",
      "date",
      "vendorId",
      "total",
      "status",
      "dueDate",
      "items",
      "paidDate",
    ],
    KALENDER: ["id", "date", "name", "type"],
    // Master Data Headers
    MASTER_JABATAN: ["id", "nama", "deskripsi", "status"],
    MASTER_GOLONGAN: ["id", "golongan", "gajiPokok", "tunjangan", "status"],
    MASTER_JAM_MASUK: ["id", "nama", "jamMasuk", "jamKeluar", "toleransiMenit", "status"],
  },

  // Status Options
  STATUS: {
    ACTIVE: "active",
    INACTIVE: "inactive",
    PENDING: "pending",
    PAID: "paid",
    UNPAID: "unpaid",
  },
};

/**
 * Get Spreadsheet instance
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getSpreadsheet() {
  return SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
}

/**
 * Get specific sheet by name
 * @param {string} sheetName
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet(sheetName) {
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" tidak ditemukan`);
  }
  return sheet;
}
