/**
 * SIPILPRO - Belanja Service
 * CRUD operations untuk data Belanja/Pembelian
 */

const BelanjaService = {
  /**
   * Get all purchases
   * @returns {Object}
   */
  getAll() {
    try {
      const sheet = getSheet(CONFIG.SHEETS.BELANJA);
      const data = sheet.getDataRange().getValues();
      const purchases = sheetDataToObjects(data);
      return ApiResponse.success(purchases);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get purchase by ID
   * @param {string} id
   * @returns {Object}
   */
  getById(id) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const purchase = result.data.find((p) => p.id === id);
      if (!purchase) return ApiResponse.notFound("Belanja");

      return ApiResponse.success(purchase);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get unpaid purchases (Hutang)
   * @returns {Object}
   */
  getHutang() {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const hutang = result.data.filter((p) => p.status !== CONFIG.STATUS.PAID);
      return ApiResponse.success(hutang);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get purchases by vendor
   * @param {string} vendorId
   * @returns {Object}
   */
  getByVendor(vendorId) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const filtered = result.data.filter((p) => p.vendorId === vendorId);
      return ApiResponse.success(filtered);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get overdue purchases
   * @returns {Object}
   */
  getOverdue() {
    try {
      const result = this.getHutang();
      if (!result.success) return result;

      const today = new Date();
      const overdue = result.data.filter((p) => {
        if (!p.dueDate) return false;
        const dueDate = new Date(p.dueDate);
        return dueDate < today;
      });

      return ApiResponse.success(overdue);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Add new purchase
   * @param {Object} data
   * @returns {Object}
   */
  add(data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.BELANJA);
      const headers = CONFIG.HEADERS.BELANJA;

      data.id = data.id || generateId("blj");
      data.status = data.status || CONFIG.STATUS.UNPAID;

      // Stringify items if object
      if (typeof data.items === "object") {
        data.items = JSON.stringify(data.items);
      }

      const row = objectToRow(data, headers);
      sheet.appendRow(row);

      return ApiResponse.created(data, data.id);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Update purchase
   * @param {string} id
   * @param {Object} data
   * @returns {Object}
   */
  update(id, data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.BELANJA);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      // Stringify items if object
      if (typeof data.items === "object") {
        data.items = JSON.stringify(data.items);
      }

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

      return ApiResponse.notFound("Belanja");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Delete purchase
   * @param {string} id
   * @returns {Object}
   */
  delete(id) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.BELANJA);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          sheet.deleteRow(i + 1);
          return ApiResponse.deleted(id);
        }
      }

      return ApiResponse.notFound("Belanja");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Mark purchase as paid
   * @param {string} id
   * @param {string} paidDate
   * @returns {Object}
   */
  markAsPaid(id, paidDate) {
    try {
      return this.update(id, {
        status: CONFIG.STATUS.PAID,
        paidDate: paidDate || formatDateISO(new Date()),
      });
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get total hutang amount
   * @returns {Object}
   */
  getTotalHutang() {
    try {
      const result = this.getHutang();
      if (!result.success) return result;

      const total = result.data.reduce(
        (sum, p) => sum + (parseFloat(p.total) || 0),
        0
      );

      return ApiResponse.success({
        count: result.data.length,
        total: total,
      });
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
