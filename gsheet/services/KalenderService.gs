/**
 * SIPILPRO - Kalender Service
 * CRUD operations untuk data Hari Libur
 */

const KalenderService = {
  /**
   * Get all calendar entries
   * @returns {Object}
   */
  getAll() {
    try {
      const sheet = getSheet(CONFIG.SHEETS.KALENDER);
      const data = sheet.getDataRange().getValues();
      const entries = sheetDataToObjects(data);
      return ApiResponse.success(entries);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get holidays for a specific year
   * @param {string|number} year
   * @returns {Object}
   */
  getHolidays(year) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const targetYear = parseInt(year) || new Date().getFullYear();

      const holidays = result.data.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate.getFullYear() === targetYear;
      });

      return ApiResponse.success(holidays);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Check if a date is a holiday
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Object}
   */
  isHoliday(date) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const holiday = result.data.find((entry) => {
        const entryDate =
          entry.date instanceof Date
            ? formatDateISO(entry.date)
            : entry.date.toString().substring(0, 10);
        return entryDate === date;
      });

      return ApiResponse.success({
        isHoliday: !!holiday,
        holiday: holiday || null,
      });
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Add new holiday
   * @param {Object} data
   * @returns {Object}
   */
  addHoliday(data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.KALENDER);
      const headers = CONFIG.HEADERS.KALENDER;

      data.id = data.id || generateId("hol");
      data.type = data.type || "national";

      const row = objectToRow(data, headers);
      sheet.appendRow(row);

      return ApiResponse.created(data, data.id);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Delete holiday
   * @param {string} id
   * @returns {Object}
   */
  delete(id) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.KALENDER);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          sheet.deleteRow(i + 1);
          return ApiResponse.deleted(id);
        }
      }

      return ApiResponse.notFound("Holiday");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get holidays for a date range
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

      const holidays = result.data.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= start && entryDate <= end;
      });

      return ApiResponse.success(holidays);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
