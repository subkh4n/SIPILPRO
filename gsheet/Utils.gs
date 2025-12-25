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
