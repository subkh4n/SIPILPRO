/**
 * SIPILPRO - Utility Functions
 * Fungsi-fungsi helper yang digunakan di seluruh aplikasi
 */

// ============================================
// ID GENERATION
// ============================================

/**
 * Generate unique ID with prefix
 * @param {string} prefix - Prefix untuk ID (e.g., 'wrk', 'proj', 'vnd')
 * @returns {string}
 */
function generateId(prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix.toLowerCase()}-${timestamp}-${random}`;
}

// ============================================
// DATE UTILITIES
// ============================================

/**
 * Format date to ISO string (YYYY-MM-DD)
 * @param {Date} date
 * @returns {string}
 */
function formatDateISO(date) {
  return Utilities.formatDate(date, "Asia/Jakarta", "yyyy-MM-dd");
}

/**
 * Format date to Indonesian format (DD MMM YYYY)
 * @param {Date} date
 * @returns {string}
 */
function formatDateID(date) {
  return Utilities.formatDate(date, "Asia/Jakarta", "dd MMM yyyy");
}

/**
 * Parse date string to Date object
 * @param {string} dateStr
 * @returns {Date}
 */
function parseDate(dateStr) {
  return new Date(dateStr);
}

// ============================================
// JSON UTILITIES
// ============================================

/**
 * Safely parse JSON, return original if fails
 * @param {string} str
 * @returns {any}
 */
function safeJsonParse(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return str;
  }
}

/**
 * Stringify object to JSON
 * @param {any} obj
 * @returns {string}
 */
function toJson(obj) {
  return JSON.stringify(obj);
}

// ============================================
// CURRENCY UTILITIES
// ============================================

/**
 * Format number to Indonesian Rupiah
 * @param {number} amount
 * @returns {string}
 */
function formatRupiah(amount) {
  return "Rp " + amount.toLocaleString("id-ID");
}

/**
 * Parse Rupiah string to number
 * @param {string} str
 * @returns {number}
 */
function parseRupiah(str) {
  return parseInt(str.replace(/[^0-9]/g, "")) || 0;
}

// ============================================
// VALIDATION UTILITIES
// ============================================

/**
 * Check if value is empty
 * @param {any} value
 * @returns {boolean}
 */
function isEmpty(value) {
  return value === null || value === undefined || value === "";
}

/**
 * Check if string is valid email
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Check if string is valid phone number
 * @param {string} phone
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const regex = /^[0-9+\-\s()]+$/;
  return regex.test(phone);
}

// ============================================
// ARRAY UTILITIES
// ============================================

/**
 * Convert sheet data to array of objects
 * @param {Array} data - 2D array from sheet
 * @returns {Array<Object>}
 */
function sheetDataToObjects(data) {
  if (data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);

  return rows.map((row) => {
    const obj = {};
    headers.forEach((header, index) => {
      let value = row[index];
      // Auto-parse JSON fields
      if (["sessions", "items", "data"].includes(header)) {
        value = safeJsonParse(value);
      }
      obj[header] = value;
    });
    return obj;
  });
}

/**
 * Convert object to row array based on headers
 * @param {Object} obj
 * @param {Array<string>} headers
 * @returns {Array}
 */
function objectToRow(obj, headers) {
  return headers.map((header) => {
    let value = obj[header];
    // Stringify JSON fields
    if (
      ["sessions", "items", "data"].includes(header) &&
      typeof value === "object"
    ) {
      value = toJson(value);
    }
    return value !== undefined ? value : "";
  });
}

// ============================================
// GOOGLE DRIVE - FOTO UTILITIES
// ============================================

// Nama folder untuk menyimpan foto pegawai
const FOTO_FOLDER_NAME = "SIPILPRO_Foto_Pegawai";

/**
 * Get or create folder for employee photos
 * @returns {GoogleAppsScript.Drive.Folder}
 */
function getFotoFolder() {
  const folders = DriveApp.getFoldersByName(FOTO_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  // Create new folder if doesn't exist
  const folder = DriveApp.createFolder(FOTO_FOLDER_NAME);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

/**
 * Upload foto from base64 string
 * @param {string} base64Data - Base64 encoded image data (without data:image prefix)
 * @param {string} fileName - File name for the image
 * @param {string} mimeType - MIME type (e.g., 'image/jpeg', 'image/png')
 * @returns {Object} - {url, fileId, thumbnailUrl}
 */
function uploadFotoFromBase64(base64Data, fileName, mimeType) {
  try {
    const folder = getFotoFolder();

    // Decode base64 and create blob
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, mimeType, fileName);

    // Create file in Drive
    const file = folder.createFile(blob);

    // Set public sharing
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();

    return {
      fileId: fileId,
      url: file.getUrl(),
      // Direct link for displaying image
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
      directUrl: `https://drive.google.com/uc?export=view&id=${fileId}`,
    };
  } catch (error) {
    throw new Error("Gagal upload foto: " + error.message);
  }
}

/**
 * Delete foto from Google Drive by file ID
 * @param {string} fileId
 * @returns {boolean}
 */
function deleteFotoById(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    file.setTrashed(true);
    return true;
  } catch (error) {
    console.log("Foto tidak ditemukan atau sudah dihapus: " + fileId);
    return false;
  }
}

/**
 * Extract file ID from Google Drive URL
 * @param {string} url
 * @returns {string|null}
 */
function extractFileIdFromUrl(url) {
  if (!url) return null;

  // Match patterns like:
  // https://drive.google.com/file/d/FILE_ID/view
  // https://drive.google.com/uc?id=FILE_ID
  // https://drive.google.com/thumbnail?id=FILE_ID
  const patterns = [/\/file\/d\/([a-zA-Z0-9_-]+)/, /[?&]id=([a-zA-Z0-9_-]+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
