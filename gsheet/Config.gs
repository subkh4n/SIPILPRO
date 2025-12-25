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
  },

  // Column Headers per Sheet
  HEADERS: {
    PROYEK: ["id", "name", "location", "status", "startDate", "endDate", "rap"],
    TUKANG: [
      "id",
      "name",
      "skill",
      "phone",
      "rateNormal",
      "rateOvertime",
      "rateHoliday",
      "status",
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
