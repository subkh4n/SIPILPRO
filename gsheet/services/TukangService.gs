/**
 * SIPILPRO - Tukang (Worker/Pegawai) Service
 * CRUD operations untuk data Tukang/Pekerja dengan field lengkap
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
   * Add new worker with complete data
   * @param {Object} data
   * @returns {Object}
   */
  add(data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TUKANG);
      const headers = CONFIG.HEADERS.TUKANG;

      // Generate ID and set defaults
      data.id = data.id || generateId("wrk");
      data.nip = data.nip || this.generateNIP();
      data.status = data.status || CONFIG.STATUS.ACTIVE;
      data.tipe = data.tipe || "Harian";
      data.jabatan = data.jabatan || "Pekerja";
      data.tanggalMasuk = data.tanggalMasuk || formatDateISO(new Date());

      // Default rates if not provided
      data.rateNormal = data.rateNormal || 0;
      data.rateOvertime = data.rateOvertime || 0;
      data.rateHoliday = data.rateHoliday || 0;

      // Handle foto upload if base64 provided
      if (data.fotoBase64 && data.fotoMimeType) {
        const fileName = `pegawai_${data.nip}_${Date.now()}.${
          data.fotoMimeType.split("/")[1] || "jpg"
        }`;
        const fotoResult = uploadFotoFromBase64(
          data.fotoBase64,
          fileName,
          data.fotoMimeType
        );
        data.foto = fotoResult.directUrl;
        // Remove base64 data before storing
        delete data.fotoBase64;
        delete data.fotoMimeType;
      }

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
      const fotoIndex = headers.indexOf("foto");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          // Handle foto upload if new foto provided
          if (data.fotoBase64 && data.fotoMimeType) {
            // Delete old foto if exists
            const oldFotoUrl = allData[i][fotoIndex];
            if (oldFotoUrl) {
              const oldFileId = extractFileIdFromUrl(oldFotoUrl);
              if (oldFileId) {
                deleteFotoById(oldFileId);
              }
            }

            // Upload new foto
            const nip = allData[i][headers.indexOf("nip")] || id;
            const fileName = `pegawai_${nip}_${Date.now()}.${
              data.fotoMimeType.split("/")[1] || "jpg"
            }`;
            const fotoResult = uploadFotoFromBase64(
              data.fotoBase64,
              fileName,
              data.fotoMimeType
            );
            data.foto = fotoResult.directUrl;

            // Remove base64 data
            delete data.fotoBase64;
            delete data.fotoMimeType;
          }

          // Update each field
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
   * Delete worker and their foto
   * @param {string} id
   * @returns {Object}
   */
  delete(id) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TUKANG);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");
      const fotoIndex = headers.indexOf("foto");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          // Delete foto from Drive if exists
          const fotoUrl = allData[i][fotoIndex];
          if (fotoUrl) {
            const fileId = extractFileIdFromUrl(fotoUrl);
            if (fileId) {
              deleteFotoById(fileId);
            }
          }

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

  /**
   * Get workers by type (Tetap/Kontrak/Harian)
   * @param {string} tipe
   * @returns {Object}
   */
  getByTipe(tipe) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const filtered = result.data.filter((w) => w.tipe === tipe);
      return ApiResponse.success(filtered);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Generate NIP automatically
   * Format: YYYY + 4 digit sequence
   * @returns {string}
   */
  generateNIP() {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 9000) + 1000; // 4 digit random
    return `${year}${random}`;
  },

  /**
   * Upload foto for existing worker
   * @param {string} id - Worker ID
   * @param {string} base64Data - Base64 image data
   * @param {string} mimeType - Image MIME type
   * @returns {Object}
   */
  uploadFoto(id, base64Data, mimeType) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.TUKANG);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");
      const fotoIndex = headers.indexOf("foto");
      const nipIndex = headers.indexOf("nip");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          // Delete old foto if exists
          const oldFotoUrl = allData[i][fotoIndex];
          if (oldFotoUrl) {
            const oldFileId = extractFileIdFromUrl(oldFotoUrl);
            if (oldFileId) {
              deleteFotoById(oldFileId);
            }
          }

          // Upload new foto
          const nip = allData[i][nipIndex] || id;
          const fileName = `pegawai_${nip}_${Date.now()}.${
            mimeType.split("/")[1] || "jpg"
          }`;
          const fotoResult = uploadFotoFromBase64(
            base64Data,
            fileName,
            mimeType
          );

          // Update cell
          sheet.getRange(i + 1, fotoIndex + 1).setValue(fotoResult.directUrl);

          return ApiResponse.success({
            id: id,
            foto: fotoResult.directUrl,
            thumbnailUrl: fotoResult.thumbnailUrl,
          });
        }
      }

      return ApiResponse.notFound("Tukang");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
