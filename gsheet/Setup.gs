/**
 * SIPILPRO - Setup Helper
 * Functions untuk setup spreadsheet awal
 */

/**
 * Setup spreadsheet dengan semua sheets yang dibutuhkan
 * Run this once to create all sheets
 */
function setupSpreadsheet() {
  const ss = getSpreadsheet();

  Logger.log("Setting up SIPILPRO Spreadsheet...");

  // Create all sheets
  Object.keys(CONFIG.SHEETS).forEach((key) => {
    const sheetName = CONFIG.SHEETS[key];
    const headers = CONFIG.HEADERS[key];

    if (headers) {
      createSheetIfNotExists(ss, sheetName, headers);
      Logger.log(`✓ Sheet "${sheetName}" ready`);
    }
  });

  // Add sample data
  addSampleData(ss);

  Logger.log("Setup complete!");
  return "Setup selesai! Semua sheet sudah dibuat.";
}

/**
 * Create sheet if not exists
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} sheetName
 * @param {Array<string>} headers
 */
function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Set headers
  if (headers && headers.length > 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.getRange(1, 1, 1, headers.length).setBackground("#f3f3f3");
  }

  return sheet;
}

/**
 * Add sample data to sheets
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 */
function addSampleData(ss) {
  // Sample Proyek
  const proyekSheet = ss.getSheetByName(CONFIG.SHEETS.PROYEK);
  if (proyekSheet && proyekSheet.getLastRow() === 1) {
    proyekSheet.appendRow([
      "proj-001",
      "Ruko Blok A",
      "Jl. Sudirman No.12",
      "active",
      "2024-01-01",
      "2024-12-31",
      500000000,
    ]);
    proyekSheet.appendRow([
      "proj-002",
      "Rumah Cluster B",
      "Perumahan Harmoni",
      "active",
      "2024-02-01",
      "2024-08-31",
      350000000,
    ]);
    proyekSheet.appendRow([
      "proj-003",
      "Gudang Industri",
      "Kawasan Industri Cikupa",
      "active",
      "2024-03-01",
      "2024-06-30",
      800000000,
    ]);
    Logger.log("✓ Sample Proyek added");
  }

  // Sample Tukang
  const tukangSheet = ss.getSheetByName(CONFIG.SHEETS.TUKANG);
  if (tukangSheet && tukangSheet.getLastRow() === 1) {
    tukangSheet.appendRow([
      "wrk-001",
      "Budi Santoso",
      "Ahli",
      "08123456789",
      25000,
      35000,
      40000,
      "active",
    ]);
    tukangSheet.appendRow([
      "wrk-002",
      "Agus Hidayat",
      "Ahli",
      "08234567890",
      25000,
      35000,
      40000,
      "active",
    ]);
    tukangSheet.appendRow([
      "wrk-003",
      "Dedi Kurniawan",
      "Pembantu",
      "08345678901",
      15000,
      20000,
      25000,
      "active",
    ]);
    tukangSheet.appendRow([
      "wrk-004",
      "Rudi Hartono",
      "Ahli-Las",
      "08456789012",
      30000,
      40000,
      50000,
      "active",
    ]);
    Logger.log("✓ Sample Tukang added");
  }

  // Sample Vendor
  const vendorSheet = ss.getSheetByName(CONFIG.SHEETS.VENDOR);
  if (vendorSheet && vendorSheet.getLastRow() === 1) {
    vendorSheet.appendRow([
      "vnd-001",
      "TB. Sinar Jaya",
      "Jl. Raya Serang KM.5",
      "021-12345678",
      "sinarjaya@email.com",
      "active",
    ]);
    vendorSheet.appendRow([
      "vnd-002",
      "TB. Abadi",
      "Jl. Industri No.10",
      "021-87654321",
      "abadi@email.com",
      "active",
    ]);
    vendorSheet.appendRow([
      "vnd-003",
      "Toko Besi Kuat",
      "Pasar Material Blok C",
      "0812-3456-7890",
      "besikuat@email.com",
      "active",
    ]);
    Logger.log("✓ Sample Vendor added");
  }

  // Sample Kalender (Hari Libur 2024)
  const kalenderSheet = ss.getSheetByName(CONFIG.SHEETS.KALENDER);
  if (kalenderSheet && kalenderSheet.getLastRow() === 1) {
    kalenderSheet.appendRow([
      "hol-001",
      "2024-01-01",
      "Tahun Baru",
      "national",
    ]);
    kalenderSheet.appendRow([
      "hol-002",
      "2024-04-10",
      "Idul Fitri",
      "national",
    ]);
    kalenderSheet.appendRow([
      "hol-003",
      "2024-04-11",
      "Idul Fitri",
      "national",
    ]);
    kalenderSheet.appendRow([
      "hol-004",
      "2024-05-01",
      "Hari Buruh",
      "national",
    ]);
    kalenderSheet.appendRow(["hol-005", "2024-06-17", "Idul Adha", "national"]);
    kalenderSheet.appendRow([
      "hol-006",
      "2024-08-17",
      "Hari Kemerdekaan",
      "national",
    ]);
    kalenderSheet.appendRow(["hol-007", "2024-12-25", "Natal", "national"]);
    Logger.log("✓ Sample Kalender added");
  }
}

/**
 * Reset all data (CAUTION - will delete all data!)
 */
function resetAllData() {
  const ss = getSpreadsheet();

  Object.keys(CONFIG.SHEETS).forEach((key) => {
    const sheetName = CONFIG.SHEETS[key];
    const sheet = ss.getSheetByName(sheetName);

    if (sheet && sheet.getLastRow() > 1) {
      // Keep header, delete all data rows
      sheet.deleteRows(2, sheet.getLastRow() - 1);
      Logger.log(`✓ Cleared data from "${sheetName}"`);
    }
  });

  Logger.log("All data cleared!");
  return "Semua data telah dihapus.";
}

/**
 * Test API connection
 */
function testConnection() {
  try {
    const ss = getSpreadsheet();
    const sheets = ss.getSheets().map((s) => s.getName());

    return ApiResponse.success({
      message: "Connection successful!",
      spreadsheetName: ss.getName(),
      sheets: sheets,
    });
  } catch (error) {
    return ApiResponse.error(error.message);
  }
}
