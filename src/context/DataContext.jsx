import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

// Fallback mock data (used when API is not configured)
import {
  projects as mockProjects,
  workers as mockWorkers,
  vendors as mockVendors,
  initialAttendance as mockAttendance,
  initialPurchases as mockPurchases,
  initialCashBalance
} from '../data/mockData';

const DataContext = createContext(null);

// Check if API is configured
const isAPIConfigured = () => {
  return api.API_URL && !api.API_URL.includes('YOUR_GOOGLE_APPS_SCRIPT');
};

export function DataProvider({ children }) {
  // Loading & Error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Master data
  const [projects, setProjects] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [vendors, setVendors] = useState([]);

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
          .filter(p => p.status === 'paid')
          .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
        setCashBalance(initialCashBalance - paidTotal);
      } else {
        // Use mock data
        console.log('API not configured, using mock data');
        setProjects(mockProjects);
        setWorkers(mockWorkers);
        setVendors(mockVendors);
        setAttendance(mockAttendance);
        setPurchases(mockPurchases);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
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
      setAttendance(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (err) {
      console.error('Failed to add attendance:', err);
      // Still add locally
      setAttendance(prev => [newRecord, ...prev]);
      return newRecord;
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

      setPurchases(prev => [newPurchase, ...prev]);

      // If paid immediately, deduct from cash
      if (purchase.status === 'paid') {
        setCashBalance(prev => prev - purchase.total);
      }

      return newPurchase;
    } catch (err) {
      console.error('Failed to add purchase:', err);
      setPurchases(prev => [newPurchase, ...prev]);
      if (purchase.status === 'paid') {
        setCashBalance(prev => prev - purchase.total);
      }
      return newPurchase;
    }
  };

  // Pay a debt
  const payDebt = async (purchaseId, amount) => {
    const paidDate = new Date().toISOString().split('T')[0];

    try {
      if (isAPIConfigured()) {
        await api.updateBelanja(purchaseId, {
          status: 'paid',
          paidDate
        });
      }

      setPurchases(prev => prev.map(p => {
        if (p.id === purchaseId) {
          return { ...p, status: 'paid', paidDate };
        }
        return p;
      }));
      setCashBalance(prev => prev - amount);
    } catch (err) {
      console.error('Failed to pay debt:', err);
      // Still update locally
      setPurchases(prev => prev.map(p => {
        if (p.id === purchaseId) {
          return { ...p, status: 'paid', paidDate };
        }
        return p;
      }));
      setCashBalance(prev => prev - amount);
    }
  };

  // Get project by ID
  const getProject = (id) => projects.find(p => p.id === id);

  // Get worker by ID
  const getWorker = (id) => workers.find(w => w.id === id);

  // Get vendor by ID
  const getVendorById = (id) => vendors.find(v => v.id === id);

  // Get total unpaid debts
  const getTotalDebt = () => {
    return purchases
      .filter(p => p.status === 'unpaid')
      .reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  };

  // Get project costs
  const getProjectCosts = (projectId) => {
    // Material costs
    const materialCost = purchases
      .flatMap(p => Array.isArray(p.items) ? p.items : [])
      .filter(item => item.projectId === projectId)
      .reduce((sum, item) => sum + (parseFloat(item.total) || 0), 0);

    // Labor costs
    const laborCost = attendance
      .flatMap(a => {
        const sessions = Array.isArray(a.sessions) ? a.sessions : [];
        return sessions.map(s => ({
          projectId: s.projectId,
          wage: (parseFloat(s.duration) / parseFloat(a.totalHours)) * parseFloat(a.wage)
        }));
      })
      .filter(s => s.projectId === projectId)
      .reduce((sum, s) => sum + (s.wage || 0), 0);

    return { materialCost, laborCost, total: materialCost + laborCost };
  };

  const value = {
    // States
    loading,
    error,

    // Master data
    projects,
    workers,
    vendors,

    // Transaction data
    attendance,
    purchases,
    cashBalance,

    // Actions
    addAttendance,
    addPurchase,
    payDebt,
    refreshData: loadData,

    // Helpers
    getProject,
    getWorker,
    getVendor: getVendorById,
    getTotalDebt,
    getProjectCosts,

    // API status
    isAPIConfigured: isAPIConfigured(),
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
