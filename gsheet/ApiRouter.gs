/**
 * SIPILPRO - API Router
 * Routing untuk semua request API
 */

// ============================================
// MAIN ENTRY POINTS
// ============================================

/**
 * Handle GET requests
 * @param {Object} e - Event object
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  const action = e.parameter.action || "";
  const params = e.parameter;

  let result;

  try {
    result = routeGetRequest(action, params);
  } catch (error) {
    result = ApiResponse.error(error.message);
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

/**
 * Handle POST requests
 * @param {Object} e - Event object
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  const action = e.parameter.action || "";
  const params = e.parameter;
  let data = {};

  try {
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify(ApiResponse.error("Invalid JSON data"))
    ).setMimeType(ContentService.MimeType.JSON);
  }

  let result;

  try {
    result = routePostRequest(action, params, data);
  } catch (error) {
    result = ApiResponse.error(error.message);
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
    ContentService.MimeType.JSON
  );
}

// ============================================
// ROUTE HANDLERS
// ============================================

/**
 * Route GET requests to appropriate service
 * @param {string} action
 * @param {Object} params
 * @returns {Object}
 */
function routeGetRequest(action, params) {
  switch (action) {
    // ---- Generic ----
    case "getAllSheets":
      return getAllSheetsData();

    // ---- Proyek ----
    case "getProyek":
      return ProyekService.getAll();
    case "getProyekById":
      return ProyekService.getById(params.id);

    // ---- Tukang/Worker ----
    case "getTukang":
      return TukangService.getAll();
    case "getTukangById":
      return TukangService.getById(params.id);

    // ---- Vendor ----
    case "getVendor":
      return VendorService.getAll();
    case "getVendorById":
      return VendorService.getById(params.id);

    // ---- Absensi ----
    case "getAbsensi":
      return AbsensiService.getAll();
    case "getAbsensiByDate":
      return AbsensiService.getByDate(params.date);
    case "getAbsensiByWorker":
      return AbsensiService.getByWorker(params.workerId);

    // ---- Belanja ----
    case "getBelanja":
      return BelanjaService.getAll();
    case "getBelanjaById":
      return BelanjaService.getById(params.id);
    case "getHutang":
      return BelanjaService.getHutang();

    // ---- Kalender ----
    case "getKalender":
      return KalenderService.getAll();
    case "getHolidays":
      return KalenderService.getHolidays(params.year);

    // ---- System Status ----
    case "getStatus":
      return getSystemStatus();

    // ---- Tukang by Tipe ----
    case "getTukangByTipe":
      return TukangService.getByTipe(params.tipe);

    // ---- Setup Otomatis ----
    case "setupSpreadsheet":
      return setupSpreadsheet();
    case "checkSetupStatus":
      return ApiResponse.success(checkSetupStatus());

    // ---- Master Data ----
    case "getMasterJabatan":
      return MasterDataService.getAllJabatan();
    case "getMasterGolongan":
      return MasterDataService.getAllGolongan();
    case "getMasterJamMasuk":
      return MasterDataService.getAllJamMasuk();

    default:
      return ApiResponse.error(`Unknown action: ${action}`);
  }
}

/**
 * Route POST requests to appropriate service
 * @param {string} action
 * @param {Object} params
 * @param {Object} data
 * @returns {Object}
 */
function routePostRequest(action, params, data) {
  switch (action) {
    // ---- Proyek ----
    case "addProyek":
      return ProyekService.add(data);
    case "updateProyek":
      return ProyekService.update(params.id, data);
    case "deleteProyek":
      return ProyekService.delete(params.id);

    // ---- Tukang/Worker ----
    case "addTukang":
      return TukangService.add(data);
    case "updateTukang":
      return TukangService.update(params.id, data);
    case "deleteTukang":
      return TukangService.delete(params.id);

    // ---- Vendor ----
    case "addVendor":
      return VendorService.add(data);
    case "updateVendor":
      return VendorService.update(params.id, data);
    case "deleteVendor":
      return VendorService.delete(params.id);

    // ---- Absensi ----
    case "addAbsensi":
      return AbsensiService.add(data);
    case "updateAbsensi":
      return AbsensiService.update(params.id, data);
    case "deleteAbsensi":
      return AbsensiService.delete(params.id);

    // ---- Belanja ----
    case "addBelanja":
      return BelanjaService.add(data);
    case "updateBelanja":
      return BelanjaService.update(params.id, data);
    case "deleteBelanja":
      return BelanjaService.delete(params.id);
    case "payBelanja":
      return BelanjaService.markAsPaid(params.id, data.paidDate);

    // ---- Kalender ----
    case "addHoliday":
      return KalenderService.addHoliday(data);
    case "deleteHoliday":
      return KalenderService.delete(params.id);

    // ---- Upload Foto Pegawai ----
    case "uploadFotoPegawai":
      return TukangService.uploadFoto(params.id, data.base64, data.mimeType);

    // ---- Master Data ----
    case "addMasterJabatan":
      return MasterDataService.addJabatan(data);
    case "updateMasterJabatan":
      return MasterDataService.updateJabatan(params.id, data);
    case "deleteMasterJabatan":
      return MasterDataService.deleteJabatan(params.id);
    case "addMasterGolongan":
      return MasterDataService.addGolongan(data);
    case "updateMasterGolongan":
      return MasterDataService.updateGolongan(params.id, data);
    case "deleteMasterGolongan":
      return MasterDataService.deleteGolongan(params.id);
    case "addMasterJamMasuk":
      return MasterDataService.addJamMasuk(data);
    case "updateMasterJamMasuk":
      return MasterDataService.updateJamMasuk(params.id, data);
    case "deleteMasterJamMasuk":
      return MasterDataService.deleteJamMasuk(params.id);

    // ---- Generic CRUD (for backward compatibility) ----
    case "addRow":
      return handleGenericAdd(params.sheet, data);
    case "updateRow":
      return handleGenericUpdate(params.sheet, params.id, data);
    case "deleteRow":
      return handleGenericDelete(params.sheet, params.id);

    default:
      return ApiResponse.error(`Unknown action: ${action}`);
  }
}

// ============================================
// BULK DATA HANDLER
// ============================================

/**
 * Get all data from all sheets
 * @returns {Object}
 */
function getAllSheetsData() {
  return ApiResponse.success({
    proyek: ProyekService.getAll().data || [],
    tukang: TukangService.getAll().data || [],
    vendor: VendorService.getAll().data || [],
    absensi: AbsensiService.getAll().data || [],
    belanja: BelanjaService.getAll().data || [],
    kalender: KalenderService.getAll().data || [],
    // Master Data
    masterJabatan: MasterDataService.getAllJabatan().data || [],
    masterGolongan: MasterDataService.getAllGolongan().data || [],
    masterJamMasuk: MasterDataService.getAllJamMasuk().data || [],
  });
}

/**
 * Get system status - check sheet structure and Drive folder
 * @returns {Object}
 */
function getSystemStatus() {
  try {
    const ss = getSpreadsheet();
    const sheets = {};

    // Check all configured sheets
    for (const [key, sheetName] of Object.entries(CONFIG.SHEETS)) {
      const sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        const headers = sheet
          .getRange(1, 1, 1, sheet.getLastColumn())
          .getValues()[0];
        const rowCount = Math.max(0, sheet.getLastRow() - 1);
        sheets[key.toLowerCase()] = {
          exists: true,
          name: sheetName,
          headers: headers,
          rowCount: rowCount,
          expectedHeaders: CONFIG.HEADERS[key] || [],
        };
      } else {
        sheets[key.toLowerCase()] = {
          exists: false,
          name: sheetName,
          expectedHeaders: CONFIG.HEADERS[key] || [],
        };
      }
    }

    // Check foto folder
    let fotoFolder = null;
    try {
      const folders = DriveApp.getFoldersByName(FOTO_FOLDER_NAME);
      if (folders.hasNext()) {
        const folder = folders.next();
        fotoFolder = {
          exists: true,
          name: FOTO_FOLDER_NAME,
          id: folder.getId(),
          url: folder.getUrl(),
        };
      } else {
        fotoFolder = {
          exists: false,
          name: FOTO_FOLDER_NAME,
        };
      }
    } catch (e) {
      fotoFolder = { error: e.message };
    }

    return ApiResponse.success({
      spreadsheetId: CONFIG.SPREADSHEET_ID,
      spreadsheetName: ss.getName(),
      sheets: sheets,
      fotoFolder: fotoFolder,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return ApiResponse.error(error.message);
  }
}
