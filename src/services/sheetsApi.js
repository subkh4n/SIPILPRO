/**
 * Google Sheets API Service
 * Menghubungkan React App dengan Google Apps Script Backend
 */

// GANTI DENGAN URL DEPLOY ANDA!
const API_URL =
  "https://script.google.com/macros/s/AKfycbxATy1aYPNnmfh6GQ2_fJjHjpjB-GYf7xecxZwnu1SlZyqnAWFy0POzlp4FAckqzW5q/exec";

/**
 * Fetch data dari Google Sheets
 * @param {string} action - Nama action (getProyek, getTukang, dll)
 * @param {object} params - Parameter tambahan
 */
async function fetchFromSheet(action, params = {}) {
  try {
    const queryParams = new URLSearchParams({ action, ...params });
    const response = await fetch(`${API_URL}?${queryParams}`);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "Unknown error");
    }

    return data.data;
  } catch (error) {
    console.error(`Error fetching ${action}:`, error);
    throw error;
  }
}

/**
 * Post data ke Google Sheets
 * @param {string} action - Nama action (addProyek, updateTukang, dll)
 * @param {object} data - Data yang akan dikirim
 * @param {object} params - Parameter tambahan (id, dll)
 */
async function postToSheet(action, data, params = {}) {
  try {
    const queryParams = new URLSearchParams({ action, ...params });
    const response = await fetch(`${API_URL}?${queryParams}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error?.message || "Unknown error");
    }

    return result;
  } catch (error) {
    console.error(`Error posting ${action}:`, error);
    throw error;
  }
}

// ============================================
// API METHODS
// ============================================

export const sheetsApi = {
  // ----- GET Methods -----

  /** Get all data from all sheets */
  getAllData: () => fetchFromSheet("getAllSheets"),

  /** Get all projects */
  getProyek: () => fetchFromSheet("getProyek"),

  /** Get all workers */
  getTukang: () => fetchFromSheet("getTukang"),

  /** Get all vendors */
  getVendor: () => fetchFromSheet("getVendor"),

  /** Get all attendance records */
  getAbsensi: () => fetchFromSheet("getAbsensi"),

  /** Get attendance by date */
  getAbsensiByDate: (date) => fetchFromSheet("getAbsensiByDate", { date }),

  /** Get all purchases */
  getBelanja: () => fetchFromSheet("getBelanja"),

  /** Get unpaid purchases (hutang) */
  getHutang: () => fetchFromSheet("getHutang"),

  /** Get holidays */
  getKalender: () => fetchFromSheet("getKalender"),

  // ----- POST Methods -----

  /** Add new project */
  addProyek: (data) => postToSheet("addProyek", data),

  /** Update project */
  updateProyek: (id, data) => postToSheet("updateProyek", data, { id }),

  /** Delete project */
  deleteProyek: (id) => postToSheet("deleteProyek", {}, { id }),

  /** Add new worker */
  addTukang: (data) => postToSheet("addTukang", data),

  /** Update worker */
  updateTukang: (id, data) => postToSheet("updateTukang", data, { id }),

  /** Delete worker */
  deleteTukang: (id) => postToSheet("deleteTukang", {}, { id }),

  /** Add new vendor */
  addVendor: (data) => postToSheet("addVendor", data),

  /** Add attendance */
  addAbsensi: (data) => postToSheet("addAbsensi", data),

  /** Add purchase */
  addBelanja: (data) => postToSheet("addBelanja", data),

  /** Mark purchase as paid */
  payBelanja: (id, paidDate) => postToSheet("payBelanja", { paidDate }, { id }),

  // ========== NEW METHODS ==========

  /** Get worker by ID */
  getWorkerById: (id) => fetchFromSheet("getTukangById", { id }),

  /** Get workers by type (Tetap/Kontrak/Harian) */
  getWorkersByTipe: (tipe) => fetchFromSheet("getTukangByTipe", { tipe }),

  /** Upload foto pegawai */
  uploadFotoPegawai: (id, base64, mimeType) =>
    postToSheet("uploadFotoPegawai", { base64, mimeType }, { id }),

  /** Get system status - check sheet structure */
  getStatus: () => fetchFromSheet("getStatus"),

  /** Setup spreadsheet otomatis - update headers dan buat folder foto */
  setupSpreadsheet: () => fetchFromSheet("setupSpreadsheet"),

  /** Check setup status - lihat kolom yang perlu ditambahkan */
  checkSetupStatus: () => fetchFromSheet("checkSetupStatus"),
};

export default sheetsApi;


