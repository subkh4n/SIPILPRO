/**
 * SIPILPRO - API Response Helper
 * Standarisasi format response API
 */

const ApiResponse = {
  /**
   * Success response
   * @param {any} data
   * @param {string} message
   * @returns {Object}
   */
  success(data, message = "Success") {
    return {
      success: true,
      message: message,
      data: data,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Error response
   * @param {string} message
   * @param {number} code
   * @returns {Object}
   */
  error(message, code = 400) {
    return {
      success: false,
      error: {
        message: message,
        code: code,
      },
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Created response (for POST)
   * @param {any} data
   * @param {string} id
   * @returns {Object}
   */
  created(data, id) {
    return {
      success: true,
      message: "Data berhasil ditambahkan",
      id: id,
      data: data,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Updated response
   * @param {string} id
   * @returns {Object}
   */
  updated(id) {
    return {
      success: true,
      message: "Data berhasil diupdate",
      id: id,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Deleted response
   * @param {string} id
   * @returns {Object}
   */
  deleted(id) {
    return {
      success: true,
      message: "Data berhasil dihapus",
      id: id,
      timestamp: new Date().toISOString(),
    };
  },

  /**
   * Not found response
   * @param {string} resource
   * @returns {Object}
   */
  notFound(resource = "Data") {
    return {
      success: false,
      error: {
        message: `${resource} tidak ditemukan`,
        code: 404,
      },
      timestamp: new Date().toISOString(),
    };
  },
};
