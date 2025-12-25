/**
 * SIPILPRO - Tukang (Worker) Service
 * CRUD operations untuk data Tukang/Pekerja
 */

const TukangService = {
  /**
   * Get all workers
   * @returns {Object}
   */
  getAll() {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TUKANG);
      const data = sheet.getDataRange().getValues();
      const workers = sheetDataToObjects(data);
      return ApiResponse.success(workers);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get worker by ID
   * @param {string} id
   * @returns {Object}
   */
  getById(id) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const worker = result.data.find((w) => w.id === id);
      if (!worker) return ApiResponse.notFound("Tukang");

      return ApiResponse.success(worker);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Add new worker
   * @param {Object} data
   * @returns {Object}
   */
  add(data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TUKANG);
      const headers = CONFIG.HEADERS.TUKANG;

      // Generate ID
      data.id = data.id || generateId("wrk");
      data.status = data.status || CONFIG.STATUS.ACTIVE;

      // Default rates if not provided
      data.rateNormal = data.rateNormal || 0;
      data.rateOvertime = data.rateOvertime || 0;
      data.rateHoliday = data.rateHoliday || 0;

      const row = objectToRow(data, headers);
      sheet.appendRow(row);

      return ApiResponse.created(data, data.id);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Update worker
   * @param {string} id
   * @param {Object} data
   * @returns {Object}
   */
  update(id, data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TUKANG);
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

      return ApiResponse.notFound("Tukang");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Delete worker
   * @param {string} id
   * @returns {Object}
   */
  delete(id) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TUKANG);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          sheet.deleteRow(i + 1);
          return ApiResponse.deleted(id);
        }
      }

      return ApiResponse.notFound("Tukang");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get workers by skill
   * @param {string} skill
   * @returns {Object}
   */
  getBySkill(skill) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const filtered = result.data.filter((w) => w.skill === skill);
      return ApiResponse.success(filtered);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
