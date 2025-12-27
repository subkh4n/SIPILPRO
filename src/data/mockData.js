// Mock data untuk demo SIPILPRO

// Hari libur nasional Indonesia 2025
export const holidays = [
  { date: "2025-01-01", name: "Tahun Baru" },
  { date: "2025-01-29", name: "Imlek" },
  { date: "2025-03-29", name: "Hari Raya Nyepi" },
  { date: "2025-03-31", name: "Wafat Isa Al-Masih" },
  { date: "2025-04-10", name: "Idul Fitri" },
  { date: "2025-04-11", name: "Idul Fitri" },
  { date: "2025-05-01", name: "Hari Buruh" },
  { date: "2025-05-12", name: "Hari Raya Waisak" },
  { date: "2025-05-29", name: "Kenaikan Isa Al-Masih" },
  { date: "2025-06-01", name: "Hari Lahir Pancasila" },
  { date: "2025-06-17", name: "Idul Adha" },
  { date: "2025-07-07", name: "Tahun Baru Islam" },
  { date: "2025-08-17", name: "Hari Kemerdekaan" },
  { date: "2025-09-15", name: "Maulid Nabi" },
  { date: "2025-12-25", name: "Hari Raya Natal" },
];

// Master data proyek
export const projects = [
  {
    id: "proj-001",
    name: "Ruko Blok A",
    location: "Jl. Sudirman No.12",
    status: "active",
  },
  {
    id: "proj-002",
    name: "Rumah Cluster B",
    location: "Perumahan Harmoni",
    status: "active",
  },
  {
    id: "proj-003",
    name: "Gudang Industri",
    location: "Kawasan Industri Cikupa",
    status: "active",
  },
  {
    id: "proj-004",
    name: "Renovasi Kantor",
    location: "Gedung Graha",
    status: "completed",
  },
];

// Master data tukang
export const workers = [
  {
    id: "wrk-001",
    name: "Budi",
    skill: "Ahli",
    rateNormal: 25000,
    rateOvertime: 35000,
    rateHoliday: 40000,
  },
  {
    id: "wrk-002",
    name: "Agus",
    skill: "Ahli",
    rateNormal: 25000,
    rateOvertime: 35000,
    rateHoliday: 40000,
  },
  {
    id: "wrk-003",
    name: "Dedi",
    skill: "Pembantu",
    rateNormal: 15000,
    rateOvertime: 20000,
    rateHoliday: 25000,
  },
  {
    id: "wrk-004",
    name: "Eko",
    skill: "Pembantu",
    rateNormal: 15000,
    rateOvertime: 20000,
    rateHoliday: 25000,
  },
  {
    id: "wrk-005",
    name: "Faisal",
    skill: "Ahli",
    rateNormal: 25000,
    rateOvertime: 35000,
    rateHoliday: 40000,
  },
];

// Master data vendor
export const vendors = [
  {
    id: "vnd-001",
    name: "TB. Sinar Jaya",
    address: "Jl. Raya Serang KM.5",
    phone: "021-12345678",
  },
  {
    id: "vnd-002",
    name: "TB. Abadi",
    address: "Jl. Industri No.10",
    phone: "021-87654321",
  },
  {
    id: "vnd-003",
    name: "Toko Besi Kuat",
    address: "Pasar Material Blok C",
    phone: "0812-3456-7890",
  },
  {
    id: "vnd-004",
    name: "UD. Maju Bersama",
    address: "Jl. Cempaka No.22",
    phone: "0856-7890-1234",
  },
];

// Data absensi sample
export const initialAttendance = [
  {
    id: "att-001",
    date: "2025-12-23",
    workerId: "wrk-001",
    sessions: [
      { projectId: "proj-001", start: "08:00", end: "12:00", duration: 4 },
      { projectId: "proj-002", start: "13:00", end: "17:00", duration: 4 },
    ],
    totalHours: 8,
    isHoliday: false,
    wage: 200000,
  },
  {
    id: "att-002",
    date: "2025-12-22",
    workerId: "wrk-002",
    sessions: [
      { projectId: "proj-001", start: "07:00", end: "17:00", duration: 10 },
    ],
    totalHours: 10,
    isHoliday: false,
    overtime: 2,
    wage: 270000, // 8 x 25000 + 2 x 35000
  },
];

// Data belanja/nota sample
export const initialPurchases = [
  {
    id: "prc-001",
    invoiceNo: "INV-2025-001",
    date: "2025-12-24",
    vendorId: "vnd-001",
    total: 10000000,
    status: "unpaid",
    dueDate: "2025-12-31",
    items: [
      {
        name: "Semen Gresik",
        qty: 50,
        unit: "Sak",
        pricePerUnit: 60000,
        total: 3000000,
        projectId: "proj-001",
      },
      {
        name: "Pasir",
        qty: 1,
        unit: "Truck",
        pricePerUnit: 1500000,
        total: 1500000,
        projectId: "proj-001",
      },
      {
        name: "Keramik Lantai",
        qty: 50,
        unit: "Dus",
        pricePerUnit: 100000,
        total: 5000000,
        projectId: "proj-002",
      },
      {
        name: "Paku Payung",
        qty: 1,
        unit: "Box",
        pricePerUnit: 500000,
        total: 500000,
        projectId: "proj-002",
      },
    ],
  },
  {
    id: "prc-002",
    invoiceNo: "INV-2025-002",
    date: "2025-12-20",
    vendorId: "vnd-002",
    total: 5000000,
    status: "unpaid",
    dueDate: "2025-12-27",
    items: [
      {
        name: "Besi Beton 10mm",
        qty: 100,
        unit: "Batang",
        pricePerUnit: 50000,
        total: 5000000,
        projectId: "proj-001",
      },
    ],
  },
  {
    id: "prc-003",
    invoiceNo: "INV-2025-003",
    date: "2025-12-01",
    vendorId: "vnd-003",
    total: 2000000,
    status: "unpaid",
    dueDate: "2025-12-15",
    items: [
      {
        name: "Kawat Bendrat",
        qty: 20,
        unit: "Kg",
        pricePerUnit: 100000,
        total: 2000000,
        projectId: "proj-003",
      },
    ],
  },
];

// Saldo kas
export const initialCashBalance = 50000000;

