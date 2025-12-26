// API Configuration
// Replace this with your deployed Google Apps Script Web App URL
export const API_URL =
  "https://script.google.com/macros/s/AKfycbzT2NdhcW3_YBx5INf8pmaZ-7Voi1YD0DTIVIrYPikfXkPkw3bZSlZrY1f0gK1A7SBj/exec";

// Sheet names mapping
const SHEETS = {
  PROYEK: "Proyek",
  TUKANG: "Tukang",
  VENDOR: "Vendor",
  ABSENSI: "Absensi",
  BELANJA: "Belanja",
};

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(url, options = {}) {
  try {
    // Don't send Content-Type for GET (causes CORS issues with GAS)
    const fetchOptions = {
      ...options,
      redirect: "follow",
    };

    // Only add Content-Type for POST
    if (options.method === "POST") {
      fetchOptions.headers = {
        "Content-Type": "text/plain",
        ...options.headers,
      };
    }

    const response = await fetch(url, fetchOptions);

    const result = await response.json();

    // Handle new response format { success, data, error }
    if (result.success === false) {
      throw new Error(result.error?.message || "Unknown error");
    }

    // Return data if wrapped, otherwise return result
    return result.data !== undefined ? result.data : result;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}

/**
 * Get all data from a sheet
 */
export async function getData(sheetName) {
  const url = `${API_URL}?action=getData&sheet=${sheetName}`;
  return fetchAPI(url);
}

/**
 * Get all sheets data at once
 */
export async function getAllSheetsData() {
  const url = `${API_URL}?action=getAllSheets`;
  return fetchAPI(url);
}

/**
 * Add a new row to a sheet
 */
export async function addRow(sheetName, data) {
  const url = `${API_URL}?action=addRow&sheet=${sheetName}`;
  return fetchAPI(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Update a row in a sheet
 */
export async function updateRow(sheetName, id, data) {
  const url = `${API_URL}?action=updateRow&sheet=${sheetName}&id=${id}`;
  return fetchAPI(url, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Delete a row from a sheet
 */
export async function deleteRow(sheetName, id) {
  const url = `${API_URL}?action=deleteRow&sheet=${sheetName}&id=${id}`;
  return fetchAPI(url, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

// ============================================
// SPECIFIC API FUNCTIONS
// ============================================

// Proyek
export const getProyek = () => getData(SHEETS.PROYEK);
export const addProyek = (data) => addRow(SHEETS.PROYEK, data);
export const updateProyek = (id, data) => updateRow(SHEETS.PROYEK, id, data);

// Tukang
export const getTukang = () => getData(SHEETS.TUKANG);
export const addTukang = (data) => addRow(SHEETS.TUKANG, data);
export const updateTukang = (id, data) => updateRow(SHEETS.TUKANG, id, data);

// Vendor
export const getVendor = () => getData(SHEETS.VENDOR);
export const addVendor = (data) => addRow(SHEETS.VENDOR, data);
export const updateVendor = (id, data) => updateRow(SHEETS.VENDOR, id, data);

// Absensi
export const getAbsensi = () => getData(SHEETS.ABSENSI);
export const addAbsensi = (data) => addRow(SHEETS.ABSENSI, data);
export const updateAbsensi = (id, data) => updateRow(SHEETS.ABSENSI, id, data);

// Belanja
export const getBelanja = () => getData(SHEETS.BELANJA);
export const addBelanja = (data) => addRow(SHEETS.BELANJA, data);
export const updateBelanja = (id, data) => updateRow(SHEETS.BELANJA, id, data);
