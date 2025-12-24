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
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // Replace with your spreadsheet ID

// Sheet names
const SHEETS = {
  PROYEK: 'Proyek',
  TUKANG: 'Tukang',
  VENDOR: 'Vendor',
  ABSENSI: 'Absensi',
  BELANJA: 'Belanja',
  SETTINGS: 'Settings'
};

// ============================================
// MAIN HANDLERS
// ============================================

function doGet(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;

  let result;

  try {
    switch(action) {
      case 'getData':
        result = getAllData(sheet);
        break;
      case 'getRow':
        result = getRowById(sheet, e.parameter.id);
        break;
      case 'getAllSheets':
        result = getAllSheetsData();
        break;
      default:
        result = { error: 'Unknown action' };
    }
  } catch(error) {
    result = { error: error.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const action = e.parameter.action;
  const sheet = e.parameter.sheet;
  const data = JSON.parse(e.postData.contents);

  let result;

  try {
    switch(action) {
      case 'addRow':
        result = addRow(sheet, data);
        break;
      case 'updateRow':
        result = updateRow(sheet, e.parameter.id, data);
        break;
      case 'deleteRow':
        result = deleteRow(sheet, e.parameter.id);
        break;
      default:
        result = { error: 'Unknown action' };
    }
  } catch(error) {
    result = { error: error.toString() };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
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

  return rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // Parse JSON fields
      if (header === 'sessions' || header === 'items') {
        try {
          value = JSON.parse(value);
        } catch(e) {
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
    belanja: getAllData(SHEETS.BELANJA)
  };
}

function getRowById(sheetName, id) {
  const data = getAllData(sheetName);
  return data.find(row => row.id === id) || null;
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
  const row = headers.map(header => {
    let value = data[header];
    // Stringify JSON fields
    if ((header === 'sessions' || header === 'items') && typeof value === 'object') {
      value = JSON.stringify(value);
    }
    return value !== undefined ? value : '';
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
  const idIndex = headers.indexOf('id');

  if (idIndex === -1) {
    return { error: 'No id column found' };
  }

  // Find row with matching id
  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIndex] === id) {
      // Update each field
      headers.forEach((header, colIndex) => {
        if (data[header] !== undefined) {
          let value = data[header];
          if ((header === 'sessions' || header === 'items') && typeof value === 'object') {
            value = JSON.stringify(value);
          }
          sheet.getRange(i + 1, colIndex + 1).setValue(value);
        }
      });
      return { success: true, id: id };
    }
  }

  return { error: 'Row not found' };
}

function deleteRow(sheetName, id) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    return { error: `Sheet "${sheetName}" not found` };
  }

  const allData = sheet.getDataRange().getValues();
  const headers = allData[0];
  const idIndex = headers.indexOf('id');

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][idIndex] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }

  return { error: 'Row not found' };
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
  createSheetIfNotExists(ss, SHEETS.PROYEK, ['id', 'name', 'location', 'status']);

  // Tukang sheet
  createSheetIfNotExists(ss, SHEETS.TUKANG, ['id', 'name', 'skill', 'rateNormal', 'rateOvertime', 'rateHoliday']);

  // Vendor sheet
  createSheetIfNotExists(ss, SHEETS.VENDOR, ['id', 'name', 'address', 'phone']);

  // Absensi sheet
  createSheetIfNotExists(ss, SHEETS.ABSENSI, ['id', 'date', 'workerId', 'sessions', 'totalHours', 'isHoliday', 'wage']);

  // Belanja sheet
  createSheetIfNotExists(ss, SHEETS.BELANJA, ['id', 'invoiceNo', 'date', 'vendorId', 'total', 'status', 'dueDate', 'items', 'paidDate']);

  // Add sample data
  addSampleData(ss);

  return 'Setup complete!';
}

function createSheetIfNotExists(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');

  return sheet;
}

function addSampleData(ss) {
  // Sample Proyek
  const proyekSheet = ss.getSheetByName(SHEETS.PROYEK);
  if (proyekSheet.getLastRow() === 1) {
    proyekSheet.appendRow(['proj-001', 'Ruko Blok A', 'Jl. Sudirman No.12', 'active']);
    proyekSheet.appendRow(['proj-002', 'Rumah Cluster B', 'Perumahan Harmoni', 'active']);
    proyekSheet.appendRow(['proj-003', 'Gudang Industri', 'Kawasan Industri Cikupa', 'active']);
  }

  // Sample Tukang
  const tukangSheet = ss.getSheetByName(SHEETS.TUKANG);
  if (tukangSheet.getLastRow() === 1) {
    tukangSheet.appendRow(['wrk-001', 'Budi', 'Ahli', 25000, 35000, 40000]);
    tukangSheet.appendRow(['wrk-002', 'Agus', 'Ahli', 25000, 35000, 40000]);
    tukangSheet.appendRow(['wrk-003', 'Dedi', 'Pembantu', 15000, 20000, 25000]);
  }

  // Sample Vendor
  const vendorSheet = ss.getSheetByName(SHEETS.VENDOR);
  if (vendorSheet.getLastRow() === 1) {
    vendorSheet.appendRow(['vnd-001', 'TB. Sinar Jaya', 'Jl. Raya Serang KM.5', '021-12345678']);
    vendorSheet.appendRow(['vnd-002', 'TB. Abadi', 'Jl. Industri No.10', '021-87654321']);
    vendorSheet.appendRow(['vnd-003', 'Toko Besi Kuat', 'Pasar Material Blok C', '0812-3456-7890']);
  }
}
