/**
 * SIPILPRO - Proyek Service
 * CRUD operations untuk data Proyek
 */

const ProyekService = {
  /**
   * Get all projects
   * @returns {Object}
   */
  getAll() {
    try {
      const sheet = getSheet(CONFIG.SHEETS.PROYEK);
      const data = sheet.getDataRange().getValues();
      const projects = sheetDataToObjects(data);
      return ApiResponse.success(projects);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get project by ID
   * @param {string} id
   * @returns {Object}
   */
  getById(id) {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const project = result.data.find((p) => p.id === id);
      if (!project) return ApiResponse.notFound("Proyek");

      return ApiResponse.success(project);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Add new project
   * @param {Object} data
   * @returns {Object}
   */
  add(data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.PROYEK);
      const headers = CONFIG.HEADERS.PROYEK;

      // Generate ID
      data.id = data.id || generateId("proj");
      data.status = data.status || CONFIG.STATUS.ACTIVE;

      // Add row
      const row = objectToRow(data, headers);
      sheet.appendRow(row);

      return ApiResponse.created(data, data.id);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Update project
   * @param {string} id
   * @param {Object} data
   * @returns {Object}
   */
  update(id, data) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.PROYEK);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      // Find row
      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          // Update each field
          headers.forEach((header, colIndex) => {
            if (data[header] !== undefined) {
              sheet.getRange(i + 1, colIndex + 1).setValue(data[header]);
            }
          });
          return ApiResponse.updated(id);
        }
      }

      return ApiResponse.notFound("Proyek");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Delete project
   * @param {string} id
   * @returns {Object}
   */
  delete(id) {
    try {
      const sheet = getSheet(CONFIG.SHEETS.PROYEK);
      const allData = sheet.getDataRange().getValues();
      const headers = allData[0];
      const idIndex = headers.indexOf("id");

      for (let i = 1; i < allData.length; i++) {
        if (allData[i][idIndex] === id) {
          sheet.deleteRow(i + 1);
          return ApiResponse.deleted(id);
        }
      }

      return ApiResponse.notFound("Proyek");
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },

  /**
   * Get active projects only
   * @returns {Object}
   */
  getActive() {
    try {
      const result = this.getAll();
      if (!result.success) return result;

      const active = result.data.filter(
        (p) => p.status === CONFIG.STATUS.ACTIVE
      );
      return ApiResponse.success(active);
    } catch (error) {
      return ApiResponse.error(error.message);
    }
  },
};
