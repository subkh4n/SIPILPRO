/**
 * SIPILPRO - Absensi Service
 * CRUD operations untuk data Absensi
 */

const AbsensiService = {
  /**
   * Get all attendance records
   * @returns {Object}
   */
  getAll() {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ABSENSI);
      const data = sheet.getDataRange().getValues();
      const attendance = sheetDataToObjects(data);
      return ApiResponse.success(attendance);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get attendance by ID
   * @param {string} id
   * @returns {Object}
   */
  getById(id) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const record = result.data.find((a) => a.id === id);
      if (!record) return ApiResponse.notFound("Absensi");

      return ApiResponse.success(record);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get attendance by date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object}
   */
  getByDate(date) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const filtered = result.data.filter((a) => {
        const aDate =
          a.date instanceof Date
            ? formatDateISO(a.date)
            : a.date.toString().substring(0, 10);
        return aDate === date;
      });

      return ApiResponse.success(filtered);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get attendance by worker ID
   * @param {string} workerId
   * @returns {Object}
   */
  getByWorker(workerId) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const filtered = result.data.filter((a) => a.workerId === workerId);
      return ApiResponse.success(filtered);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get attendance by date range
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Object}
   */
  getByDateRange(startDate, endDate) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const start = new Date(startDate);
      const end = new Date(endDate);

      const filtered = result.data.filter((a) => {
        const aDate = new Date(a.date);
        return aDate >= start && aDate <= end;
      });

      return ApiResponse.success(filtered);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Add attendance record
   * @param {Object} data
   * @returns {Object}
   */
  add(data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ABSENSI);
      const headers = CONFIG.HEADERS.ABSENSI;

      data.id = data.id || generateId("abs");

      // Ensure sessions is stringified
      if (typeof data.sessions === "object") {
        data.sessions = JSON.stringify(data.sessions);
      }

      const row = objectToRow(data, headers);
      sheet.appendRow(row);

      return ApiResponse.created(data, data.id);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Update attendance
   * @param {string} id
   * @param {Object} data
   * @returns {Object}
   */
  update(id, data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ABSENSI);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      // Stringify sessions if object
      if (typeof data.sessions === "object") {
        data.sessions = JSON.stringify(data.sessions);
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

      return ApiResponse.notFound("Absensi");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Delete attendance
   * @param {string} id
   * @returns {Object}
   */
  delete(id) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.ABSENSI);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          sheet.deleteRow(i + 1);
          return ApiResponse.deleted(id);
        }
      }

      return ApiResponse.notFound("Absensi");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Calculate total wages for a period
   * @param {string} startDate
   * @param {string} endDate
   * @returns {Object}
   */
  calculateTotalWages(startDate, endDate) {
    try {
      const result = this.getByDateRange(startDate, endDate);
      if (!result.success) return result;

      const total = result.data.reduce(
        (sum, a) => sum + (parseFloat(a.wage) || 0),
        0
      );

      return ApiResponse.success({
        period: { startDate, endDate },
        totalRecords: result.data.length,
        totalWages: total,
      });
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
