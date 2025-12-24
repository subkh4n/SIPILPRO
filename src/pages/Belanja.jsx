import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { formatCurrency } from '../utils/helpers';
import { format, addDays } from 'date-fns';
import {
  Plus,
  Trash2,
  Save,
  CheckCircle,
  AlertCircle,
  Check,
  X
} from 'lucide-react';

export default function Belanja() {
  const { vendors, projects, addPurchase } = useData();

  // Header state
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [vendorId, setVendorId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('');
  const [totalHeader, setTotalHeader] = useState('');
  const [isDebt, setIsDebt] = useState(true);
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 7), 'yyyy-MM-dd'));

  // Items state
  const [items, setItems] = useState([
    { id: 1, name: '', qty: 1, unit: 'Pcs', pricePerUnit: '', projectId: '' }
  ]);

  const [saved, setSaved] = useState(false);

  // Calculate totals
  const calculations = useMemo(() => {
    const itemsWithTotal = items.map(item => ({
      ...item,
      total: (parseFloat(item.qty) || 0) * (parseFloat(item.pricePerUnit) || 0)
    }));

    const totalItems = itemsWithTotal.reduce((sum, item) => sum + item.total, 0);
    const headerTotal = parseFloat(totalHeader) || 0;
    const isMatch = totalItems === headerTotal && headerTotal > 0;
    const difference = headerTotal - totalItems;

    return { itemsWithTotal, totalItems, headerTotal, isMatch, difference };
  }, [items, totalHeader]);

  // Add new item
  const addItem = () => {
    const newId = Math.max(...items.map(i => i.id)) + 1;
    setItems([...items, {
      id: newId,
      name: '',
      qty: 1,
      unit: 'Pcs',
      pricePerUnit: '',
      projectId: ''
    }]);
  };

  // Remove item
  const removeItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(i => i.id !== id));
    }
  };

  // Update item field
  const updateItem = (id, field, value) => {
    setItems(items.map(i =>
      i.id === id ? { ...i, [field]: value } : i
    ));
  };

  // Save purchase
  const handleSave = () => {
    if (!vendorId || !invoiceNo || !calculations.isMatch) {
      alert('Lengkapi semua field dan pastikan total cocok!');
      return;
    }

    const purchase = {
      invoiceNo,
      date,
      vendorId,
      total: calculations.headerTotal,
      status: isDebt ? 'unpaid' : 'paid',
      dueDate: isDebt ? dueDate : null,
      items: calculations.itemsWithTotal.map(item => ({
        name: item.name,
        qty: parseFloat(item.qty),
        unit: item.unit,
        pricePerUnit: parseFloat(item.pricePerUnit),
        total: item.total,
        projectId: item.projectId
      }))
    };

    addPurchase(purchase);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
      // Reset form
      setVendorId('');
      setInvoiceNo('');
      setTotalHeader('');
      setItems([{ id: 1, name: '', qty: 1, unit: 'Pcs', pricePerUnit: '', projectId: '' }]);
    }, 2000);
  };

  const activeProjects = projects.filter(p => p.status === 'active');
  const units = ['Pcs', 'Sak', 'Kg', 'Truck', 'Dus', 'Box', 'Batang', 'Lembar', 'Meter'];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Input Nota Belanja</h1>
        <p className="page-subtitle">Pencatatan pembelian material dengan split-bill per proyek</p>
      </div>

      {/* Header Section */}
      <div className="card mb-6" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">Info Nota (Header)</h3>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="form-group">
            <label className="form-label">Vendor</label>
            <select
              className="form-select"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">-- Pilih Vendor --</option>
              {vendors.map(vendor => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">No. Nota</label>
            <input
              type="text"
              className="form-input"
              placeholder="INV-2025-XXX"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Total Nota</label>
            <input
              type="number"
              className="form-input font-mono"
              placeholder="0"
              value={totalHeader}
              onChange={(e) => setTotalHeader(e.target.value)}
            />
          </div>
        </div>

        {/* Payment Options */}
        <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
          <label className="form-label" style={{ marginBottom: 'var(--space-3)', display: 'block' }}>Opsi Bayar</label>
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input
                type="radio"
                checked={isDebt}
                onChange={() => setIsDebt(true)}
                style={{ width: 18, height: 18 }}
              />
              <span>Hutang / Tempo</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input
                type="radio"
                checked={!isDebt}
                onChange={() => setIsDebt(false)}
                style={{ width: 18, height: 18 }}
              />
              <span>Tunai (Langsung Potong Kas)</span>
            </label>
          </div>

          {isDebt && (
            <div className="form-group" style={{ marginTop: 'var(--space-3)', maxWidth: '200px' }}>
              <label className="form-label">Jatuh Tempo</label>
              <input
                type="date"
                className="form-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="card mb-6" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h3 className="card-title">Rincian Item & Alokasi Proyek</h3>
        </div>

        {/* Desktop Table Header */}
        <div className="item-row" style={{ display: 'none', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem' }} className="desktop-only">
          <span>NAMA ITEM</span>
          <span>QTY</span>
          <span>SATUAN</span>
          <span>HARGA SAT.</span>
          <span>ALOKASI KE</span>
          <span></span>
        </div>

        {/* Items */}
        {items.map((item, index) => (
          <div key={item.id} className="session-card" style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Item #{index + 1}</span>
              {items.length > 1 && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => removeItem(item.id)}
                  style={{ color: 'var(--danger-500)' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
              <div className="form-group">
                <label className="form-label">Nama Item</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Semen Gresik"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Qty</label>
                <input
                  type="number"
                  className="form-input"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Satuan</label>
                <select
                  className="form-select"
                  value={item.unit}
                  onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                >
                  {units.map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Harga Sat.</label>
                <input
                  type="number"
                  className="form-input font-mono"
                  placeholder="0"
                  value={item.pricePerUnit}
                  onChange={(e) => updateItem(item.id, 'pricePerUnit', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Alokasi Proyek</label>
                <select
                  className="form-select"
                  value={item.projectId}
                  onChange={(e) => updateItem(item.id, 'projectId', e.target.value)}
                >
                  <option value="">-- Pilih --</option>
                  {activeProjects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-3)', textAlign: 'right', fontSize: '0.875rem' }}>
              Subtotal: <strong className="font-mono">{formatCurrency(calculations.itemsWithTotal.find(i => i.id === item.id)?.total || 0)}</strong>
            </div>
          </div>
        ))}

        {/* Add Item Button */}
        <button
          className="btn btn-secondary btn-full"
          onClick={addItem}
          style={{ marginTop: 'var(--space-4)' }}
        >
          <Plus size={18} />
          Tambah Baris Item
        </button>
      </div>

      {/* Validation Bar */}
      <div className="validation-bar">
        <div className="validation-item">
          <span className="label">Total Item:</span>
          <span className="value font-mono">{formatCurrency(calculations.totalItems)}</span>
        </div>
        <div className="validation-item">
          <span className="label">Total Header:</span>
          <span className="value font-mono">{formatCurrency(calculations.headerTotal)}</span>
        </div>
        <div className={`validation-status ${calculations.isMatch ? 'match' : 'mismatch'}`}>
          {calculations.isMatch ? (
            <>
              <Check size={16} />
              OK / MATCH
            </>
          ) : (
            <>
              <X size={16} />
              SELISIH {formatCurrency(Math.abs(calculations.difference))}
            </>
          )}
        </div>
      </div>

      {/* Mismatch Alert */}
      {!calculations.isMatch && calculations.headerTotal > 0 && (
        <div className="alert alert-danger" style={{ marginTop: 'var(--space-4)' }}>
          <AlertCircle size={18} />
          <div>
            <strong>Selisih Nominal!</strong>
            <p style={{ fontSize: '0.75rem', marginTop: '2px' }}>
              Total item belum sama dengan total yang tertera di nota. Periksa kembali itemisasi.
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 'var(--space-4)', marginTop: 'var(--space-6)', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary">
          Batal
        </button>
        <button
          className={`btn ${saved ? 'btn-secondary' : 'btn-primary'} btn-lg`}
          onClick={handleSave}
          disabled={saved || !calculations.isMatch || !vendorId || !invoiceNo}
        >
          {saved ? (
            <>
              <CheckCircle size={20} />
              TERSIMPAN!
            </>
          ) : (
            <>
              <Save size={20} />
              SIMPAN TRANSAKSI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
