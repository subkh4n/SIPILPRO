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
  });
}
