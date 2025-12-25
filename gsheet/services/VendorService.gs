/**
 * SIPILPRO - Vendor Service
 * CRUD operations untuk data Vendor
 */

const VendorService = {
  /**
   * Get all vendors
   * @returns {Object}
   */
  getAll() {
    try {
      const sheet = getSheet(CONFIG.SHEETS.VENDOR);
      const data = sheet.getDataRange().getValues();
      const vendors = sheetDataToObjects(data);
      return ApiResponse.success(vendors);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get vendor by ID
   * @param {string} id
   * @returns {Object}
   */
  getById(id) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const vendor = result.data.find((v) => v.id === id);
      if (!vendor) return ApiResponse.notFound("Vendor");

      return ApiResponse.success(vendor);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Add new vendor
   * @param {Object} data
   * @returns {Object}
   */
  add(data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.VENDOR);
      const headers = CONFIG.HEADERS.VENDOR;

      data.id = data.id || generateId("vnd");
      data.status = data.status || CONFIG.STATUS.ACTIVE;

      const row = objectToRow(data, headers);
      sheet.appendRow(row);

      return ApiResponse.created(data, data.id);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Update vendor
   * @param {string} id
   * @param {Object} data
   * @returns {Object}
   */
  update(id, data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.VENDOR);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          headers.forEach((header, colIndex) => {
            if (data[header] !== undefined) {
              sheet.getRange(i + 1, colIndex + 1).setValue(data[header]);
            }
          });
          return ApiResponse.updated(id);
        }
      }

      return ApiResponse.notFound("Vendor");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Delete vendor
   * @param {string} id
   * @returns {Object}
   */
  delete(id) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.VENDOR);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          sheet.deleteRow(i + 1);
          return ApiResponse.deleted(id);
        }
      }

      return ApiResponse.notFound("Vendor");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
