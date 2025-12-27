import { useState, useEffect, useCallback } from "react";
import * as api from "../services/api";
import { DataContext } from "./DataContextInstance";

// Initial cash balance
const initialCashBalance = 50000000;

// Check if API is configured
const isAPIConfigured = () => {
  return (
    api.API_URL &&
    api.API_URL.length > 0 &&
    !api.API_URL.includes("YOUR_GOOGLE_APPS_SCRIPT")
  );
};

// Format currency to IDR (100000 → Rp 100.000)
const formatCurrencyIDR = (value) => {
  const num = parseFloat(value) || 0;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};

// Parse time from GSheet format (1899-12-30T06:52:48.000Z → 06:52)
const parseTimeFromGSheet = (timeValue) => {
  if (!timeValue) return "08:00";

  // If already in HH:MM format
  if (typeof timeValue === "string" && /^\d{2}:\d{2}$/.test(timeValue)) {
    return timeValue;
  }

  // If it's a date string from GSheet (1899-12-30T...)
  if (typeof timeValue === "string" && timeValue.includes("T")) {
    try {
      const date = new Date(timeValue);
      const hours = date.getUTCHours().toString().padStart(2, "0");
      const minutes = date.getUTCMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "08:00";
    }
  }

  // If it's a number (decimal hours from GSheet)
  if (typeof timeValue === "number") {
    const totalMinutes = Math.round(timeValue * 24 * 60);
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  return String(timeValue) || "08:00";
};

export function DataProvider({ children }) {
  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Master data
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [salaryGrades, setSalaryGrades] = useState([]);
  const [workSchedules, setWorkSchedules] = useState([]);
  const [positions, setPositions] = useState([]);

  // Transaction data
  const [attendance, setAttendance] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [cashBalance, setCashBalance] = useState(initialCashBalance);

  // Load initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!isAPIConfigured()) {
        throw new Error(
          "API belum dikonfigurasi. Silakan set VITE_API_URL di environment variables."
        );
      }

      // Fetch from Google Sheets
      const data = await api.getAllSheetsData();

      setProjects(data.proyek || []);
      setWorkers(data.tukang || []);
      setVendors(data.vendor || []);
      setAttendance(data.absensi || []);
      setPurchases(data.belanja || []);
      setHolidays(data.kalender || []);

      // Master Data - Map GSheet fields to Frontend fields
      if (data.masterJabatan) {
        const mappedPositions = data.masterJabatan.map((item) => ({
          id: item.id,
          name: item.nama || item.name || "",
          code: item.id?.toUpperCase() || "",
          description: item.deskripsi || item.description || "",
          level: 1,
          isActive: item.status === "active",
        }));
        setPositions(mappedPositions);
      }

      if (data.masterGolongan) {
        const mappedGrades = data.masterGolongan.map((item) => ({
          id: item.id,
          name: item.golongan || item.name || "",
          code: item.id?.toUpperCase() || "GOL",
          description: `Gaji Pokok: ${formatCurrencyIDR(
            item.gajiPokok
          )}, Tunjangan: ${formatCurrencyIDR(item.tunjangan)}`,
          gajiPokok: parseFloat(item.gajiPokok) || 0,
          tunjangan: parseFloat(item.tunjangan) || 0,
          salaryRates: {},
          isActive: item.status === "active",
        }));
        setSalaryGrades(mappedGrades);
      }

      if (data.masterJamMasuk) {
        const mappedSchedules = data.masterJamMasuk.map((item, index) => {
          const startTime = parseTimeFromGSheet(item.jamMasuk);
          const endTime = parseTimeFromGSheet(item.jamKeluar);
          const name = item.nama || item.name || `Jadwal ${index + 1}`;

          // Determine type and details from name
          const nameLower = name.toLowerCase();
          const isShift =
            nameLower.includes("shift") ||
            nameLower.includes("pagi") ||
            nameLower.includes("siang") ||
            nameLower.includes("malam");
          const type = isShift ? "shift" : "reguler";

          // Calculate work hours from start and end time
          const [startH] = startTime.split(":").map(Number);
          const [endH] = endTime.split(":").map(Number);
          let hoursPerDay = endH - startH;
          if (hoursPerDay < 0) hoursPerDay += 24; // Handle overnight shift
          hoursPerDay = Math.max(hoursPerDay, 8); // Minimum 8 hours

          // Determine work days from name
          let workDays = 5;
          if (nameLower.includes("6") || nameLower.includes("enam"))
            workDays = 6;
          if (nameLower.includes("7") || nameLower.includes("tujuh"))
            workDays = 7;

          // Generate code from name
          let code = item.id?.replace("jam-", "").toUpperCase() || "JAM";
          if (nameLower.includes("reguler") && nameLower.includes("5"))
            code = "REG5";
          if (nameLower.includes("reguler") && nameLower.includes("6"))
            code = "REG6";
          if (nameLower.includes("pagi")) code = "PAGI";
          if (nameLower.includes("siang")) code = "SIANG";
          if (nameLower.includes("malam")) code = "MALAM";

          // Generate description
          const dayNames =
            workDays === 5
              ? "Senin-Jumat"
              : workDays === 6
              ? "Senin-Sabtu"
              : "Setiap hari";
          const description = isShift
            ? `${name} jam ${startTime}-${endTime}`
            : `${workDays} hari kerja, ${hoursPerDay} jam/hari (${dayNames})`;

          return {
            id: item.id,
            name: name,
            code: code,
            type: type,
            description: description,
            workDays: workDays,
            hoursPerDay: hoursPerDay,
            weeklyHours: workDays * hoursPerDay,
            startTime: startTime,
            endTime: endTime,
            breakDuration: 60,
            toleransiMenit: parseInt(item.toleransiMenit) || 15,
            overtimeMultiplier:
              isShift && nameLower.includes("malam") ? 2.0 : 1.5,
            holidayMultiplier:
              isShift && nameLower.includes("malam") ? 2.5 : 2.0,
            isActive: item.status === "active",
          };
        });
        setWorkSchedules(mappedSchedules);
      }

      // Calculate cash balance from paid purchases
      const paidTotal = (data.belanja || [])
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
      setCashBalance(initialCashBalance - paidTotal);
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.message);
      // No fallback - show error instead
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Add new attendance record
  const addAttendance = async (record) => {
    const newRecord = {
      ...record,
      id: `att-${Date.now()}`,
    };

    try {
      if (isAPIConfigured()) {
        const result = await api.addAbsensi({
          ...newRecord,
          sessions: JSON.stringify(newRecord.sessions),
        });
        newRecord.id = result.id || newRecord.id;
      }
      setAttendance((prev) => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      console.error("Failed to add attendance:", err);
      // Still add locally
      setAttendance((prev) => [newRecord, ...prev]);
      return newRecord;
    }
  };

  // Update attendance record
  const updateAttendance = async (attendanceId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateAbsensi(attendanceId, updates);
      }
      setAttendance((prev) =>
        prev.map((a) => (a.id === attendanceId ? { ...a, ...updates } : a))
      );
      return true;
    } catch (err) {
      console.error("Failed to update attendance:", err);
      setAttendance((prev) =>
        prev.map((a) => (a.id === attendanceId ? { ...a, ...updates } : a))
      );
      return true;
    }
  };

  // Delete attendance record
  const deleteAttendance = async (attendanceId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteRow("Absensi", attendanceId);
      }
      setAttendance((prev) => prev.filter((a) => a.id !== attendanceId));
      return true;
    } catch (err) {
      console.error("Failed to delete attendance:", err);
      setAttendance((prev) => prev.filter((a) => a.id !== attendanceId));
      return true;
    }
  };

  // Add new purchase/nota
  const addPurchase = async (purchase) => {
    const newPurchase = {
      ...purchase,
      id: `prc-${Date.now()}`,
    };

    try {
      if (isAPIConfigured()) {
        const result = await api.addBelanja({
          ...newPurchase,
          items: JSON.stringify(newPurchase.items),
        });
        newPurchase.id = result.id || newPurchase.id;
      }

      setPurchases((prev) => [newPurchase, ...prev]);

      // If paid immediately, deduct from cash
      if (purchase.status === "paid") {
        setCashBalance((prev) => prev - purchase.total);
      }

      return newPurchase;
    } catch (err) {
      console.error("Failed to add purchase:", err);
      setPurchases((prev) => [newPurchase, ...prev]);
      if (purchase.status === "paid") {
        setCashBalance((prev) => prev - purchase.total);
      }
      return newPurchase;
    }
  };

  // Pay a debt
  const payDebt = async (purchaseId, amount) => {
    const paidDate = new Date().toISOString().split("T")[0];

    try {
      if (isAPIConfigured()) {
        await api.updateBelanja(purchaseId, {
          status: "paid",
          paidDate,
        });
      }

      setPurchases((prev) =>
        prev.map((p) => {
          if (p.id === purchaseId) {
            return { ...p, status: "paid", paidDate };
          }
          return p;
        })
      );
      setCashBalance((prev) => prev - amount);
    } catch (err) {
      console.error("Failed to pay debt:", err);
      // Still update locally
      setPurchases((prev) =>
        prev.map((p) => {
          if (p.id === purchaseId) {
            return { ...p, status: "paid", paidDate };
          }
          return p;
        })
      );
      setCashBalance((prev) => prev - amount);
    }
  };

  // Update purchase
  const updatePurchase = async (purchaseId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateBelanja(purchaseId, updates);
      }
      setPurchases((prev) =>
        prev.map((p) => (p.id === purchaseId ? { ...p, ...updates } : p))
      );
      return true;
    } catch (err) {
      console.error("Failed to update purchase:", err);
      setPurchases((prev) =>
        prev.map((p) => (p.id === purchaseId ? { ...p, ...updates } : p))
      );
      return true;
    }
  };

  // Delete purchase
  const deletePurchase = async (purchaseId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteRow("Belanja", purchaseId);
      }
      setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
      return true;
    } catch (err) {
      console.error("Failed to delete purchase:", err);
      setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
      return true;
    }
  };

  // Get project by ID
  const getProject = (id) => projects.find((p) => p.id === id);

  // Get worker by ID
  const getWorker = (id) => workers.find((w) => w.id === id);

  // Get vendor by ID
  const getVendorById = (id) => vendors.find((v) => v.id === id);

  // Get total unpaid debts
  const getTotalDebt = () => {
    return purchases
      .filter((p) => p.status === "unpaid")
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  };

  // Get project costs
  const getProjectCosts = (projectId) => {
    // Material costs
    const materialCost = purchases
      .flatMap((p) => (Array.isArray(p.items) ? p.items : []))
      .filter((item) => item.projectId === projectId)
      .reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    // Labor costs
    const laborCost = attendance
      .flatMap((a) => {
        const sessions = Array.isArray(a.sessions) ? a.sessions : [];
        return sessions.map((s) => ({
          projectId: s.projectId,
          wage:
            (parseFloat(s.duration) / parseFloat(a.totalHours)) *
            parseFloat(a.wage),
        }));
      })
      .filter((s) => s.projectId === projectId)
      .reduce((sum, s) => sum + (s.wage || 0), 0);

    return { materialCost, laborCost, total: materialCost + laborCost };
  };

  // ============================================
  // CRUD FUNCTIONS FOR PROJECTS
  // ============================================

  // Add new project
  const addProject = async (projectData) => {
    const newProject = {
      ...projectData,
      id: `proj-${Date.now()}`,
      status: projectData.status || "active",
    };

    try {
      if (isAPIConfigured()) {
        await api.addProyek(newProject);
      }
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      console.error("Failed to add project:", err);
      // Still add locally
      setProjects((prev) => [newProject, ...prev]);
      return newProject;
    }
  };

  // Update project
  const updateProject = async (projectId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateProyek(projectId, updates);
      }
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      );
      return true;
    } catch (err) {
      console.error("Failed to update project:", err);
      // Still update locally
      setProjects((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, ...updates } : p))
      );
      return true;
    }
  };

  // Delete project
  const deleteProject = async (projectId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteRow("Proyek", projectId);
      }
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return true;
    } catch (err) {
      console.error("Failed to delete project:", err);
      // Still delete locally
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return true;
    }
  };

  // ============================================
  // CRUD FUNCTIONS FOR WORKERS (TUKANG)
  // ============================================

  // Add new worker
  const addWorker = async (workerData) => {
    const newWorker = {
      ...workerData,
      id: `tkg-${Date.now()}`,
      status: workerData.status || "active",
    };

    try {
      if (isAPIConfigured()) {
        await api.addTukang(newWorker);
      }
      setWorkers((prev) => [newWorker, ...prev]);
      return newWorker;
    } catch (err) {
      console.error("Failed to add worker:", err);
      setWorkers((prev) => [newWorker, ...prev]);
      return newWorker;
    }
  };

  // Update worker
  const updateWorker = async (workerId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateTukang(workerId, updates);
      }
      setWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, ...updates } : w))
      );
      return true;
    } catch (err) {
      console.error("Failed to update worker:", err);
      setWorkers((prev) =>
        prev.map((w) => (w.id === workerId ? { ...w, ...updates } : w))
      );
      return true;
    }
  };

  // Delete worker
  const deleteWorker = async (workerId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteRow("Tukang", workerId);
      }
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      return true;
    } catch (err) {
      console.error("Failed to delete worker:", err);
      setWorkers((prev) => prev.filter((w) => w.id !== workerId));
      return true;
    }
  };

  // ============================================
  // CRUD FUNCTIONS FOR VENDORS
  // ============================================

  // Add new vendor
  const addVendor = async (vendorData) => {
    const newVendor = {
      ...vendorData,
      id: `vnd-${Date.now()}`,
    };

    try {
      if (isAPIConfigured()) {
        await api.addVendor(newVendor);
      }
      setVendors((prev) => [newVendor, ...prev]);
      return newVendor;
    } catch (err) {
      console.error("Failed to add vendor:", err);
      setVendors((prev) => [newVendor, ...prev]);
      return newVendor;
    }
  };

  // Update vendor
  const updateVendor = async (vendorId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateVendor(vendorId, updates);
      }
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, ...updates } : v))
      );
      return true;
    } catch (err) {
      console.error("Failed to update vendor:", err);
      setVendors((prev) =>
        prev.map((v) => (v.id === vendorId ? { ...v, ...updates } : v))
      );
      return true;
    }
  };

  // Delete vendor
  const deleteVendorById = async (vendorId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteRow("Vendor", vendorId);
      }
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      return true;
    } catch (err) {
      console.error("Failed to delete vendor:", err);
      setVendors((prev) => prev.filter((v) => v.id !== vendorId));
      return true;
    }
  };

  // ============================================
  // CRUD FUNCTIONS FOR HOLIDAYS (KALENDER)
  // ============================================

  // Add new holiday
  const addHoliday = async (holidayData) => {
    const newHoliday = {
      ...holidayData,
      id: `hld-${Date.now()}`,
    };

    try {
      if (isAPIConfigured()) {
        await api.addKalender(newHoliday);
      }
      setHolidays((prev) => [newHoliday, ...prev]);
      return newHoliday;
    } catch (err) {
      console.error("Failed to add holiday:", err);
      setHolidays((prev) => [newHoliday, ...prev]);
      return newHoliday;
    }
  };

  // Update holiday
  const updateHoliday = async (holidayId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateKalender(holidayId, updates);
      }
      setHolidays((prev) =>
        prev.map((h) => (h.id === holidayId ? { ...h, ...updates } : h))
      );
      return true;
    } catch (err) {
      console.error("Failed to update holiday:", err);
      setHolidays((prev) =>
        prev.map((h) => (h.id === holidayId ? { ...h, ...updates } : h))
      );
      return true;
    }
  };

  // Delete holiday
  const deleteHoliday = async (holidayId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteRow("Kalender", holidayId);
      }
      setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
      return true;
    } catch (err) {
      console.error("Failed to delete holiday:", err);
      setHolidays((prev) => prev.filter((h) => h.id !== holidayId));
      return true;
    }
  };

  // ============================================
  // CRUD FUNCTIONS FOR SALARY GRADES (GOLONGAN GAJI)
  // ============================================

  const addSalaryGrade = async (gradeData) => {
    const newGrade = { ...gradeData, id: `gol-${Date.now()}` };
    try {
      if (isAPIConfigured()) {
        const result = await api.addMasterGolongan(newGrade);
        newGrade.id = result.id || newGrade.id;
      }
      setSalaryGrades((prev) => [newGrade, ...prev]);
      return newGrade;
    } catch (err) {
      console.error("Failed to add salary grade:", err);
      setSalaryGrades((prev) => [newGrade, ...prev]);
      return newGrade;
    }
  };

  const updateSalaryGrade = async (gradeId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateMasterGolongan(gradeId, updates);
      }
      setSalaryGrades((prev) =>
        prev.map((g) => (g.id === gradeId ? { ...g, ...updates } : g))
      );
      return true;
    } catch (err) {
      console.error("Failed to update salary grade:", err);
      setSalaryGrades((prev) =>
        prev.map((g) => (g.id === gradeId ? { ...g, ...updates } : g))
      );
      return true;
    }
  };

  const deleteSalaryGrade = async (gradeId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteMasterGolongan(gradeId);
      }
      setSalaryGrades((prev) => prev.filter((g) => g.id !== gradeId));
      return true;
    } catch (err) {
      console.error("Failed to delete salary grade:", err);
      setSalaryGrades((prev) => prev.filter((g) => g.id !== gradeId));
      return true;
    }
  };

  const getSalaryGrade = (id) => salaryGrades.find((g) => g.id === id);

  // ============================================
  // CRUD FUNCTIONS FOR WORK SCHEDULES (JAM KERJA)
  // ============================================

  const addWorkSchedule = async (scheduleData) => {
    const newSchedule = { ...scheduleData, id: `jam-${Date.now()}` };
    try {
      if (isAPIConfigured()) {
        const result = await api.addMasterJamMasuk(newSchedule);
        newSchedule.id = result.id || newSchedule.id;
      }
      setWorkSchedules((prev) => [newSchedule, ...prev]);
      return newSchedule;
    } catch (err) {
      console.error("Failed to add work schedule:", err);
      setWorkSchedules((prev) => [newSchedule, ...prev]);
      return newSchedule;
    }
  };

  const updateWorkSchedule = async (scheduleId, updates) => {
    try {
      if (isAPIConfigured()) {
        await api.updateMasterJamMasuk(scheduleId, updates);
      }
      setWorkSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, ...updates } : s))
      );
      return true;
    } catch (err) {
      console.error("Failed to update work schedule:", err);
      setWorkSchedules((prev) =>
        prev.map((s) => (s.id === scheduleId ? { ...s, ...updates } : s))
      );
      return true;
    }
  };

  const deleteWorkSchedule = async (scheduleId) => {
    try {
      if (isAPIConfigured()) {
        await api.deleteMasterJamMasuk(scheduleId);
      }
      setWorkSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      return true;
    } catch (err) {
      console.error("Failed to delete work schedule:", err);
      setWorkSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
      return true;
    }
  };

  const getWorkSchedule = (id) => workSchedules.find((s) => s.id === id);

  const value = {
    // States
    loading,
    error,

    // Master data
    projects,
    workers,
    vendors,
    holidays,
    salaryGrades,
    workSchedules,

    // Transaction data
    attendance,
    purchases,
    cashBalance,

    // Actions
    addAttendance,
    updateAttendance,
    deleteAttendance,
    addPurchase,
    updatePurchase,
    deletePurchase,
    payDebt,
    refreshData: loadData,

    // Project CRUD
    addProject,
    updateProject,
    deleteProject,

    // Worker CRUD
    addWorker,
    updateWorker,
    deleteWorker,

    // Vendor CRUD
    addVendor,
    updateVendor,
    deleteVendor: deleteVendorById,

    // Holiday CRUD
    addHoliday,
    updateHoliday,
    deleteHoliday,

    // Helpers
    getProject,
    getWorker,
    getVendor: getVendorById,
    getTotalDebt,
    getProjectCosts,
    getSalaryGrade,
    getWorkSchedule,

    // Salary Grade CRUD
    addSalaryGrade,
    updateSalaryGrade,
    deleteSalaryGrade,

    // Work Schedule CRUD
    addWorkSchedule,
    updateWorkSchedule,
    deleteWorkSchedule,

    // Positions CRUD
    positions,
    addPosition: async (posData) => {
      const newPos = { ...posData, id: `jbt-${Date.now()}` };
      try {
        if (isAPIConfigured()) {
          const result = await api.addMasterJabatan(newPos);
          newPos.id = result.id || newPos.id;
        }
        setPositions((prev) =>
          [...prev, newPos].sort((a, b) => (a.level || 0) - (b.level || 0))
        );
        return newPos;
      } catch (err) {
        console.error("Failed to add position:", err);
        setPositions((prev) =>
          [...prev, newPos].sort((a, b) => (a.level || 0) - (b.level || 0))
        );
        return newPos;
      }
    },
    updatePosition: async (posId, updates) => {
      try {
        if (isAPIConfigured()) {
          await api.updateMasterJabatan(posId, updates);
        }
        setPositions((prev) =>
          prev
            .map((p) => (p.id === posId ? { ...p, ...updates } : p))
            .sort((a, b) => (a.level || 0) - (b.level || 0))
        );
        return true;
      } catch (err) {
        console.error("Failed to update position:", err);
        setPositions((prev) =>
          prev
            .map((p) => (p.id === posId ? { ...p, ...updates } : p))
            .sort((a, b) => (a.level || 0) - (b.level || 0))
        );
        return true;
      }
    },
    deletePosition: async (posId) => {
      try {
        if (isAPIConfigured()) {
          await api.deleteMasterJabatan(posId);
        }
        setPositions((prev) => prev.filter((p) => p.id !== posId));
        return true;
      } catch (err) {
        console.error("Failed to delete position:", err);
        setPositions((prev) => prev.filter((p) => p.id !== posId));
        return true;
      }
    },
    getPosition: (id) => positions.find((p) => p.id === id),

    // API status
    isAPIConfigured: isAPIConfigured(),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
