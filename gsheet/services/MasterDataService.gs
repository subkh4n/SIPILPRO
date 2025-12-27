/**
 * SIPILPRO - Master Data Service
 * Service untuk mengelola data master (Jabatan, Golongan Gaji, Jam Masuk)
 */

const MasterDataService = {
  // ============================================
  // MASTER JABATAN
  // ============================================

  /**
   * Get all jabatan
   */
  getAllJabatan: function () {
    return this._getAll(CONFIG.SHEETS.MASTER_JABATAN, CONFIG.HEADERS.MASTER_JABATAN);
  },

  /**
   * Add new jabatan
   */
  addJabatan: function (data) {
    return this._add(CONFIG.SHEETS.MASTER_JABATAN, CONFIG.HEADERS.MASTER_JABATAN, data, "jbt");
  },

  /**
   * Update jabatan
   */
  updateJabatan: function (id, data) {
    return this._update(CONFIG.SHEETS.MASTER_JABATAN, CONFIG.HEADERS.MASTER_JABATAN, id, data);
  },

  /**
   * Delete jabatan
   */
  deleteJabatan: function (id) {
    return this._delete(CONFIG.SHEETS.MASTER_JABATAN, id);
  },

  // ============================================
  // MASTER GOLONGAN GAJI
  // ============================================

  /**
   * Get all golongan
   */
  getAllGolongan: function () {
    return this._getAll(CONFIG.SHEETS.MASTER_GOLONGAN, CONFIG.HEADERS.MASTER_GOLONGAN);
  },

  /**
   * Add new golongan
   */
  addGolongan: function (data) {
    return this._add(CONFIG.SHEETS.MASTER_GOLONGAN, CONFIG.HEADERS.MASTER_GOLONGAN, data, "gol");
  },

  /**
   * Update golongan
   */
  updateGolongan: function (id, data) {
    return this._update(CONFIG.SHEETS.MASTER_GOLONGAN, CONFIG.HEADERS.MASTER_GOLONGAN, id, data);
  },

  /**
   * Delete golongan
   */
  deleteGolongan: function (id) {
    return this._delete(CONFIG.SHEETS.MASTER_GOLONGAN, id);
  },

  // ============================================
  // MASTER JAM MASUK
  // ============================================

  /**
   * Get all jam masuk
   */
  getAllJamMasuk: function () {
    return this._getAll(CONFIG.SHEETS.MASTER_JAM_MASUK, CONFIG.HEADERS.MASTER_JAM_MASUK);
  },

  /**
   * Add new jam masuk
   */
  addJamMasuk: function (data) {
    return this._add(CONFIG.SHEETS.MASTER_JAM_MASUK, CONFIG.HEADERS.MASTER_JAM_MASUK, data, "jam");
  },

  /**
   * Update jam masuk
   */
  updateJamMasuk: function (id, data) {
    return this._update(CONFIG.SHEETS.MASTER_JAM_MASUK, CONFIG.HEADERS.MASTER_JAM_MASUK, id, data);
  },

  /**
   * Delete jam masuk
   */
  deleteJamMasuk: function (id) {
    return this._delete(CONFIG.SHEETS.MASTER_JAM_MASUK, id);
  },

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Generic get all data
   */
  _getAll: function (sheetName, headers) {
    try {
      const sheet = getSheet(sheetName);
      const lastRow = sheet.getLastRow();

      if (lastRow <= 1) {
        return ApiResponse.success([]);
      }

      const dataRange = sheet.getRange(2, 1, lastRow - 1, headers.length);
      const data = dataRange.getValues();

      const result = data.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });

      return ApiResponse.success(result);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Generic add data
   */
  _add: function (sheetName, headers, data, prefix) {
    try {
      const sheet = getSheet(sheetName);
      const id = generateId(prefix);

      const rowData = headers.map((header) => {
        if (header === "id") return id;
        if (header === "status" && !data[header]) return "active";
        return data[header] || "";
      });

      sheet.appendRow(rowData);
      return ApiResponse.success({ id: id, message: "Data berhasil ditambahkan" });
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Generic update data
   */
  _update: function (sheetName, headers, id, data) {
    try {
      const sheet = getSheet(sheetName);
      const rowIndex = findRowById(sheet, id);

      if (rowIndex === -1) {
        return ApiResponse.error("Data tidak ditemukan");
      }

      const rowData = headers.map((header) => {
        if (header === "id") return id;
        return data[header] !== undefined ? data[header] : "";
      });

      sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
      return ApiResponse.success({ message: "Data berhasil diupdate" });
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Generic delete data
   */
  _delete: function (sheetName, id) {
    try {
      const sheet = getSheet(sheetName);
      const rowIndex = findRowById(sheet, id);

      if (rowIndex === -1) {
        return ApiResponse.error("Data tidak ditemukan");
      }

      sheet.deleteRow(rowIndex);
      return ApiResponse.success({ message: "Data berhasil dihapus" });
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
