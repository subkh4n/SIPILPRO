/**
 * SIPILPRO - Setup Helper
 * Functions untuk setup dan update spreadsheet
 */

/**
 * Setup spreadsheet - fungsi utama untuk setup/update struktur
 *
 * Fitur:
 * - Buat sheet baru jika belum ada
 * - Update headers jika ada kolom baru (data existing aman)
 * - Buat folder foto di Google Drive
 * - Tambah sample data hanya untuk sheet baru (opsional)
 *
 * Jalankan fungsi ini setelah update Config.gs dengan kolom baru
 */
function setupSpreadsheet() {
  const results = {
    sheets: {},
    fotoFolder: null,
    timestamp: new Date().toISOString(),
  };

  try {
    const ss = getSpreadsheet();
    Logger.log("=== SIPILPRO Setup Started ===");
    Logger.log("Spreadsheet: " + ss.getName());

    // Setup/Update each sheet
    Object.keys(CONFIG.SHEETS).forEach((key) => {
      const sheetName = CONFIG.SHEETS[key];
      const expectedHeaders = CONFIG.HEADERS[key];

      if (expectedHeaders && expectedHeaders.length > 0) {
        const result = setupOrUpdateSheet(ss, sheetName, expectedHeaders, key);
        results.sheets[sheetName] = result;
        Logger.log(
          `Sheet "${sheetName}": ${result.status} - ${result.message}`
        );
      }
    });

    // Setup foto folder di Google Drive
    try {
      const folder = getFotoFolder();
      results.fotoFolder = {
        status: "success",
        name: FOTO_FOLDER_NAME,
        id: folder.getId(),
        url: folder.getUrl(),
      };
      Logger.log("✓ Foto folder ready: " + folder.getUrl());
    } catch (e) {
      results.fotoFolder = {
        status: "error",
        message: e.message,
      };
      Logger.log("✗ Error foto folder: " + e.message);
    }

    Logger.log("=== SIPILPRO Setup Complete ===");
    return ApiResponse.success(results);
  } catch (error) {
    Logger.log("Setup error: " + error.message);
    return ApiResponse.error(error.message);
  }
}

/**
 * Setup atau update sheet
 * - Jika sheet belum ada: buat baru dengan headers
 * - Jika sudah ada: tambahkan kolom yang missing
 *
 * @param {GoogleAppsScript.Spreadsheet.Spreadsheet} ss
 * @param {string} sheetName
 * @param {Array<string>} expectedHeaders
 * @param {string} configKey - Key untuk sample data (PROYEK, TUKANG, dll)
 * @returns {Object}
 */
function setupOrUpdateSheet(ss, sheetName, expectedHeaders, configKey) {
  let sheet = ss.getSheetByName(sheetName);
  let isNewSheet = false;

  // Buat sheet baru jika belum ada
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet
      .getRange(1, 1, 1, expectedHeaders.length)
      .setValues([expectedHeaders]);
    formatHeaderRow(sheet, expectedHeaders.length);
    isNewSheet = true;

    // Tambah sample data untuk sheet baru (opsional)
    addSampleDataForSheet(sheet, configKey);

    return {
      status: "created",
      message: "Sheet baru dibuat dengan headers lengkap",
      headers: expectedHeaders,
      addedColumns: expectedHeaders,
      sampleData: true,
    };
  }

  // Sheet sudah ada - cek dan update headers jika perlu
  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const currentHeaders = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .filter((h) => h !== "");

  // Cari kolom yang perlu ditambahkan
  const missingHeaders = expectedHeaders.filter(
    (h) => !currentHeaders.includes(h)
  );

  if (missingHeaders.length === 0) {
    // Format ulang header row
    formatHeaderRow(sheet, currentHeaders.length);
    return {
      status: "up-to-date",
      message: "Semua headers sudah lengkap",
      headers: currentHeaders,
      addedColumns: [],
    };
  }

  // Tambahkan kolom yang missing di akhir
  const startCol = currentHeaders.length + 1;
  sheet
    .getRange(1, startCol, 1, missingHeaders.length)
    .setValues([missingHeaders]);
  formatHeaderRow(sheet, currentHeaders.length + missingHeaders.length);

  return {
    status: "updated",
    message: `${
      missingHeaders.length
    } kolom baru ditambahkan: ${missingHeaders.join(", ")}`,
    headers: [...currentHeaders, ...missingHeaders],
    addedColumns: missingHeaders,
  };
}

/**
 * Format header row dengan styling
 */
function formatHeaderRow(sheet, numColumns) {
  const headerRange = sheet.getRange(1, 1, 1, numColumns);
  headerRange.setFontWeight("bold");
  headerRange.setBackground("#1a1a2e");
  headerRange.setFontColor("#ffffff");
  headerRange.setHorizontalAlignment("center");

  // Auto resize columns
  for (let i = 1; i <= numColumns; i++) {
    sheet.autoResizeColumn(i);
  }

  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Tambah sample data untuk sheet baru
 */
function addSampleDataForSheet(sheet, configKey) {
  switch (configKey) {
    case "PROYEK":
      sheet.appendRow([
        "proj-001",
        "Ruko Blok A",
        "Jl. Sudirman No.12",
        "active",
        "2024-01-01",
        "2024-12-31",
        500000000,
      ]);
      sheet.appendRow([
        "proj-002",
        "Rumah Cluster B",
        "Perumahan Harmoni",
        "active",
        "2024-02-01",
        "2024-08-31",
        350000000,
      ]);
      break;

    case "TUKANG":
      // Sample dengan format 18 kolom baru
      sheet.appendRow([
        "wrk-001",
        "20240001",
        "Budi Santoso",
        "Mandor Lapangan",
        "Ahli",
        "Tetap",
        "08123456789",
        "Jl. Merdeka No.10",
        25000,
        35000,
        40000,
        "active",
        "",
        "2024-01-15",
        "1985-05-10",
        "3201010505850001",
        "123456789",
      ]);
      sheet.appendRow([
        "wrk-002",
        "20240002",
        "Agus Hidayat",
        "Tukang Batu",
        "Terampil",
        "Kontrak",
        "08234567890",
        "Jl. Karya No.5",
        20000,
        30000,
        35000,
        "active",
        "",
        "2024-02-01",
        "1990-08-20",
        "3201012008900002",
        "",
      ]);
      sheet.appendRow([
        "wrk-003",
        "20240003",
        "Dedi Kurniawan",
        "Helper",
        "Pemula",
        "Harian",
        "08345678901",
        "",
        15000,
        20000,
        25000,
        "active",
        "",
        "2024-03-01",
        "",
        "",
        "",
      ]);
      break;

    case "VENDOR":
      sheet.appendRow([
        "vnd-001",
        "TB. Sinar Jaya",
        "Jl. Raya Serang KM.5",
        "021-12345678",
        "sinarjaya@email.com",
        "active",
      ]);
      sheet.appendRow([
        "vnd-002",
        "TB. Abadi",
        "Jl. Industri No.10",
        "021-87654321",
        "abadi@email.com",
        "active",
      ]);
      break;

    case "KALENDER":
      sheet.appendRow(["hol-001", "2024-01-01", "Tahun Baru", "national"]);
      sheet.appendRow(["hol-002", "2024-04-10", "Idul Fitri", "national"]);
      sheet.appendRow([
        "hol-003",
        "2024-08-17",
        "Hari Kemerdekaan",
        "national",
      ]);
      sheet.appendRow(["hol-004", "2024-12-25", "Natal", "national"]);
      break;

    // ============================================
    // MASTER DATA SAMPLE
    // ============================================

    case "MASTER_JABATAN":
      sheet.appendRow(["jbt-001", "Mandor", "Kepala tukang yang mengawasi pekerjaan", "active"]);
      sheet.appendRow(["jbt-002", "Tukang Batu", "Ahli pemasangan batu dan semen", "active"]);
      sheet.appendRow(["jbt-003", "Tukang Kayu", "Ahli pengerjaan kayu dan kusen", "active"]);
      sheet.appendRow(["jbt-004", "Tukang Besi", "Ahli pembesian dan rangka", "active"]);
      sheet.appendRow(["jbt-005", "Helper", "Pembantu tukang", "active"]);
      break;

    case "MASTER_GOLONGAN":
      sheet.appendRow(["gol-001", "Golongan I", 2500000, 500000, "active"]);
      sheet.appendRow(["gol-002", "Golongan II", 3000000, 750000, "active"]);
      sheet.appendRow(["gol-003", "Golongan III", 3500000, 1000000, "active"]);
      sheet.appendRow(["gol-004", "Golongan IV", 4500000, 1500000, "active"]);
      break;

    case "MASTER_JAM_MASUK":
      sheet.appendRow(["jam-001", "Shift Pagi", "07:00", "16:00", 15, "active"]);
      sheet.appendRow(["jam-002", "Shift Siang", "08:00", "17:00", 15, "active"]);
      sheet.appendRow(["jam-003", "Shift Full", "07:00", "17:00", 10, "active"]);
      break;
  }
}

/**
 * Check status setup saat ini
 * Berguna untuk melihat kolom mana yang perlu ditambahkan
 */
function checkSetupStatus() {
  const ss = getSpreadsheet();
  const status = {};

  Object.keys(CONFIG.SHEETS).forEach((key) => {
    const sheetName = CONFIG.SHEETS[key];
    const expectedHeaders = CONFIG.HEADERS[key] || [];
    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      status[sheetName] = {
        exists: false,
        message: "Sheet belum ada",
        missingHeaders: expectedHeaders,
      };
    } else {
      const lastCol = Math.max(sheet.getLastColumn(), 1);
      const currentHeaders = sheet
        .getRange(1, 1, 1, lastCol)
        .getValues()[0]
        .filter((h) => h !== "");
      const missingHeaders = expectedHeaders.filter(
        (h) => !currentHeaders.includes(h)
      );

      status[sheetName] = {
        exists: true,
        rowCount: Math.max(0, sheet.getLastRow() - 1),
        currentHeaders: currentHeaders,
        expectedHeaders: expectedHeaders,
        missingHeaders: missingHeaders,
        isComplete: missingHeaders.length === 0,
      };
    }
  });

  Logger.log(JSON.stringify(status, null, 2));
  return status;
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
