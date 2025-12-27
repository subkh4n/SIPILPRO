import { useState, useEffect, useCallback } from "react";
import * as api from "../services/api";
import { DataContext } from "./DataContextInstance";

// Fallback mock data (used when API is not configured)
import {
  projects as mockProjects,
  workers as mockWorkers,
  vendors as mockVendors,
  initialAttendance as mockAttendance,
  initialPurchases as mockPurchases,
  initialCashBalance,
} from "../data/mockData";

// Check if API is configured
const isAPIConfigured = () => {
  return api.API_URL && !api.API_URL.includes("YOUR_GOOGLE_APPS_SCRIPT");
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
      if (isAPIConfigured()) {
        // Fetch from Google Sheets
        const data = await api.getAllSheetsData();

        setProjects(data.proyek || []);
        setWorkers(data.tukang || []);
        setVendors(data.vendor || []);
        setAttendance(data.absensi || []);
        setPurchases(data.belanja || []);

        // Calculate cash balance from paid purchases
        const paidTotal = (data.belanja || [])
          .filter((p) => p.status === "paid")
          .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
        setCashBalance(initialCashBalance - paidTotal);
      } else {
        // Use mock data
        console.log("API not configured, using mock data");
        setProjects(mockProjects);
        setWorkers(mockWorkers);
        setVendors(mockVendors);
        setAttendance(mockAttendance);
        setPurchases(mockPurchases);
      }
    } catch (err) {
      console.error("Failed to load data:", err);
      setError(err.message);
      // Fallback to mock data on error
      setProjects(mockProjects);
      setWorkers(mockWorkers);
      setVendors(mockVendors);
      setAttendance(mockAttendance);
      setPurchases(mockPurchases);
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
    const newGrade = { ...gradeData, id: `grade-${Date.now()}` };
    setSalaryGrades((prev) => [newGrade, ...prev]);
    return newGrade;
  };

  const updateSalaryGrade = async (gradeId, updates) => {
    setSalaryGrades((prev) =>
      prev.map((g) => (g.id === gradeId ? { ...g, ...updates } : g))
    );
    return true;
  };

  const deleteSalaryGrade = async (gradeId) => {
    setSalaryGrades((prev) => prev.filter((g) => g.id !== gradeId));
    return true;
  };

  const getSalaryGrade = (id) => salaryGrades.find((g) => g.id === id);

  // ============================================
  // CRUD FUNCTIONS FOR WORK SCHEDULES (JAM KERJA)
  // ============================================

  const addWorkSchedule = async (scheduleData) => {
    const newSchedule = { ...scheduleData, id: `schedule-${Date.now()}` };
    setWorkSchedules((prev) => [newSchedule, ...prev]);
    return newSchedule;
  };

  const updateWorkSchedule = async (scheduleId, updates) => {
    setWorkSchedules((prev) =>
      prev.map((s) => (s.id === scheduleId ? { ...s, ...updates } : s))
    );
    return true;
  };

  const deleteWorkSchedule = async (scheduleId) => {
    setWorkSchedules((prev) => prev.filter((s) => s.id !== scheduleId));
    return true;
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
      const newPos = { ...posData, id: `pos-${Date.now()}` };
      setPositions((prev) =>
        [...prev, newPos].sort((a, b) => a.level - b.level)
      );
      return newPos;
    },
    updatePosition: async (posId, updates) => {
      setPositions((prev) =>
        prev
          .map((p) => (p.id === posId ? { ...p, ...updates } : p))
          .sort((a, b) => a.level - b.level)
      );
      return true;
    },
    deletePosition: async (posId) => {
      setPositions((prev) => prev.filter((p) => p.id !== posId));
      return true;
    },
    getPosition: (id) => positions.find((p) => p.id === id),

    // API status
    isAPIConfigured: isAPIConfigured(),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
