/**
 * SIPILPRO - Google Apps Script Backend
 * Copy this code to your Google Apps Script project
 *
 * Setup:
 * 1. Create new project at script.google.com
 * 2. Paste this code
 * 3. Update SPREADSHEET_ID with your spreadsheet ID
 * 4. Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL
 */

// ============================================
// CONFIGURATION - UPDATE THIS!
// ============================================
const SPREADSHEET_ID = "1hnMCHRbm5fYtr_LgqwqaeNcx3qMZX-zORr0r4TlmgMk"; // Replace with your spreadsheet ID

// Sheet names
const SHEETS = {
  PROYEK: "Proyek",
  TUKANG: "Tukang",
  VENDOR: "Vendor",
  ABSENSI: "Absensi",
  BELANJA: "Belanja",
  SETTINGS: "Settings",
};

// ============================================
// LEGACY HANDLERS (DISABLED - use ApiRouter.gs instead)
// These functions are renamed to avoid conflict with ApiRouter.gs
// ============================================

function _legacyDoGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;

  let result;

  try {
    switch (action) {
      case "getData":
        result = getAllData(sheet);
        break;
      case "getRow":
        result = getRowById(sheet, e.parameter.id);
        break;
      case "getAllSheets":
        result = { success: true, data: getAllSheetsData() };
        break;
      // New actions for sheetsApi
      case "getProyek":
        result = { success: true, data: getAllData(SHEETS.PROYEK) };
        break;
      case "getTukang":
        result = { success: true, data: getAllData(SHEETS.TUKANG) };
        break;
      case "getVendor":
        result = { success: true, data: getAllData(SHEETS.VENDOR) };
        break;
      case "getAbsensi":
        result = { success: true, data: getAllData(SHEETS.ABSENSI) };
        break;
      case "getBelanja":
        result = { success: true, data: getAllData(SHEETS.BELANJA) };
        break;
      case "getHutang":
        const belanja = getAllData(SHEETS.BELANJA);
        result = {
          success: true,
          data: belanja.filter((b) => b.status !== "paid"),
        };
        break;
      default:
        result = {
          success: false,
          error: { message: "Unknown action: " + action },
        };
    }
  } catch (error) {
    result = { success: false, error: { message: error.toString() } };
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function _legacyDoPost(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  const data = JSON.parse(e.postData.contents);

  let result;

  try {
    switch (action) {
      case "addRow":
        result = addRow(sheet, data);
        break;
      case "updateRow":
        result = updateRow(sheet, e.parameter.id, data);
        break;
      case "deleteRow":
        result = deleteRow(sheet, e.parameter.id);
        break;
      default:
        result = { error: "Unknown action" };
    }
  } catch (error) {
    result = { error: error.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// ============================================
// DATA OPERATIONS
// ============================================

function getAllData(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { error: `Sheet "${sheetName}" not found` };
  }

  const data = sheet.getDataRange().getValues();
  if (data.length === 0) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // Parse JSON fields
      if (header === "sessions" || header === "items") {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // Keep as string if not valid JSON
        }
      }
      obj[header] = value;
    });
    return obj;
  });
}

function getAllSheetsData() {
  return {
    proyek: getAllData(SHEETS.PROYEK),
    tukang: getAllData(SHEETS.TUKANG),
    vendor: getAllData(SHEETS.VENDOR),
    absensi: getAllData(SHEETS.ABSENSI),
    belanja: getAllData(SHEETS.BELANJA),
  };
}

function getRowById(sheetName, id) {
  const data = getAllData(sheetName);
  return data.find((row) => row.id === id) || null;
}

function addRow(sheetName, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { error: `Sheet "${sheetName}" not found` };
  }

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  // Generate ID if not provided
  if (!data.id) {
    data.id = generateId(sheetName);
  }

  // Build row based on headers
  const row = headers.map((header) => {
    let value = data[header];
    // Stringify JSON fields
    if (
      (header === "sessions" || header === "items") &&
      typeof value === "object"
    ) {
      value = JSON.stringify(value);
    }
    return value !== undefined ? value : "";
  });

  sheet.appendRow(row);

  return { success: true, id: data.id, data: data };
}

function updateRow(sheetName, id, data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { error: `Sheet "${sheetName}" not found` };
  }

  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf("id");

  if (idIndex === -1) {
    return { error: "No id column found" };
  }

  // Find row with matching id
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIndex] === id) {
      // Update each field
      headers.forEach((header, colIndex) => {
        if (data[header] !== undefined) {
          let value = data[header];
          if (
            (header === "sessions" || header === "items") &&
            typeof value === "object"
          ) {
            value = JSON.stringify(value);
          }
          sheet.getRange(i + 1, colIndex + 1).setValue(value);
        }
      });
      return { success: true, id: id };
    }
  }

  return { error: "Row not found" };
}

function deleteRow(sheetName, id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { error: `Sheet "${sheetName}" not found` };
  }

  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf("id");

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { error: "Row not found" };
}

// ============================================
// UTILITIES
// ============================================

function generateId(prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix.toLowerCase().substring(0, 3)}-${timestamp}-${random}`;
}

// ============================================
// SETUP HELPER - Run this once to create sheets
// ============================================

function setupSpreadsheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Proyek sheet
  createSheetIfNotExists(ss, SHEETS.PROYEK, [
    "id",
    "name",
    "location",
    "status",
  ]);

  // Tukang sheet - Updated with complete fields
  createSheetIfNotExists(ss, SHEETS.TUKANG, [
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
  ]);

  // Vendor sheet
  createSheetIfNotExists(ss, SHEETS.VENDOR, ["id", "name", "address", "phone"]);

  // Absensi sheet
  createSheetIfNotExists(ss, SHEETS.ABSENSI, [
    "id",
    "date",
    "workerId",
    "sessions",
    "totalHours",
    "isHoliday",
    "wage",
  ]);

  // Belanja sheet
  createSheetIfNotExists(ss, SHEETS.BELANJA, [
    "id",
    "invoiceNo",
    "date",
    "vendorId",
    "total",
    "status",
    "dueDate",
    "items",
    "paidDate",
  ]);

  // Sample data removed - langsung ambil data dari Google Sheets

  return "Setup complete!";
}

function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

  return sheet;
}
// Sample data function removed - data langsung dari Google Sheets
