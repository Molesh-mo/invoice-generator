import { useState } from 'react';
import { Plus, RefreshCw, Pause, Play, Trash2, X, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { formatCurrency, formatDate, todayISO, addDaysISO } from '@/utils/format';

interface RecurringInvoice {
  id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date: string;
  payment_terms: string;
  status: 'active' | 'paused' | 'completed';
  next_date: string;
}

const FREQ_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
};

const STATUS_CONFIG: Record<string, { label: string; classes: string; dot: string }> = {
  active: { label: 'Active', classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  paused: { label: 'Paused', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  completed: { label: 'Completed', classes: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200', dot: 'bg-slate-400' },
};

export function Recurring() {
  const { customers, setView } = useApp();
  const [items, setItems] = useState<RecurringInvoice[]>([
    { id: 'rec-1', customer_id: 'demo-cust-1', customer_name: 'Sarah Johnson', amount: 4500, frequency: 'monthly', start_date: '2026-01-01', end_date: '2026-12-31', payment_terms: '30 days', status: 'active', next_date: addDaysISO(15) },
    { id: 'rec-2', customer_id: 'demo-cust-2', customer_name: 'Mike Pretorius', amount: 1800, frequency: 'weekly', start_date: '2026-06-01', end_date: '2026-12-31', payment_terms: '7 days', status: 'active', next_date: addDaysISO(3) },
    { id: 'rec-3', customer_id: 'demo-cust-5', customer_name: 'Ayanda Nkosi', amount: 12000, frequency: 'quarterly', start_date: '2026-01-01', end_date: '2027-01-01', payment_terms: '30 days', status: 'paused', next_date: addDaysISO(45) },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    customer_id: '',
    amount: 0,
    frequency: 'monthly' as RecurringInvoice['frequency'],
    start_date: todayISO(),
    end_date: '',
    payment_terms: '30 days',
  });

  const toggleStatus = (id: string) => {
    setItems((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === 'active' ? 'paused' : 'active' } : r));
  };

  const deleteItem = (id: string) => setItems((prev) => prev.filter((r) => r.id !== id));

  const addRecurring = () => {
    const customer = customers.find((c) => c.id === form.customer_id);
    if (!customer || form.amount <= 0) return;
    const next: Record<string, number> = { weekly: 7, monthly: 30, quarterly: 90, yearly: 365 };
    const newItem: RecurringInvoice = {
      id: crypto.randomUUID(),
      customer_id: form.customer_id,
      customer_name: customer.name,
      amount: form.amount,
      frequency: form.frequency,
      start_date: form.start_date,
      end_date: form.end_date || '2027-12-31',
      payment_terms: form.payment_terms,
      status: 'active',
      next_date: addDaysISO(next[form.frequency] ?? 30),
    };
    setItems((prev) => [newItem, ...prev]);
    setShowModal(false);
    setForm({ customer_id: '', amount: 0, frequency: 'monthly', start_date: todayISO(), end_date: '', payment_terms: '30 days' });
  };

  const activeCount = items.filter((r) => r.status === 'active').length;
  const totalMonthly = items.filter((r) => r.status === 'active').reduce((s, r) => {
    const monthlyMap: Record<string, number> = { weekly: r.amount * 4.33, monthly: r.amount, quarterly: r.amount / 3, yearly: r.amount / 12 };
    return s + (monthlyMap[r.frequency] ?? 0);
  }, 0);

  const inputClass = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]';
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recurring Invoices</h2>
          <p className="text-slate-500 text-sm mt-0.5">Automate repeat billing cycles.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Recurring
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-[#f0ebf5] border border-[#e0d5ea] rounded-xl p-4 flex items-start gap-3">
        <RefreshCw className="w-5 h-5 text-[#6b5d8a] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-[#3d3551]">Automation ready</p>
          <p className="text-sm text-[#6b6275] mt-0.5">Recurring invoices are configured here but not automatically sent yet. Connect Make.com to enable automated generation and delivery.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-[#f0ebf5] rounded-lg flex items-center justify-center mb-3">
            <RefreshCw className="w-5 h-5 text-[#6b5d8a]" />
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Schedules</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Est. Monthly Revenue</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm col-span-2 lg:col-span-1">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Next Due</p>
          <p className="text-lg font-bold text-slate-900 mt-1">{items.filter((r) => r.status === 'active').length > 0 ? formatDate(items.filter((r) => r.status === 'active').sort((a, b) => a.next_date.localeCompare(b.next_date))[0].next_date) : '—'}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Frequency</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Start</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">End</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Next</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.length === 0 ? (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-slate-400">No recurring invoices yet.</td></tr>
              ) : items.map((r) => {
                const sc = STATUS_CONFIG[r.status];
                return (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{r.customer_name}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{formatCurrency(r.amount)}</td>
                    <td className="px-5 py-3.5 text-slate-600">{FREQ_LABELS[r.frequency]}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(r.start_date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.end_date ? formatDate(r.end_date) : '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{r.status === 'active' ? formatDate(r.next_date) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.classes}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleStatus(r.id)} title={r.status === 'active' ? 'Pause' : 'Resume'} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                          {r.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button onClick={() => deleteItem(r.id)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {items.map((r) => {
            const sc = STATUS_CONFIG[r.status];
            return (
              <div key={r.id} className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{r.customer_name}</p>
                    <p className="text-xs text-slate-500">{FREQ_LABELS[r.frequency]} · {formatCurrency(r.amount)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${sc.classes}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />{sc.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Next: {r.status === 'active' ? formatDate(r.next_date) : '—'}</p>
                  <div className="flex gap-1">
                    <button onClick={() => toggleStatus(r.id)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded">{r.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}</button>
                    <button onClick={() => deleteItem(r.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">New Recurring Invoice</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Customer *</label>
                <select value={form.customer_id} onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))} className={inputClass}>
                  <option value="">Select a customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}{c.business_name ? ` · ${c.business_name}` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Amount *</label>
                <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className={inputClass} placeholder="0.00" />
              </div>
              <div>
                <label className={labelClass}>Frequency</label>
                <select value={form.frequency} onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as RecurringInvoice['frequency'] }))} className={inputClass}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date</label>
                  <input type="date" value={form.end_date} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>Payment Terms</label>
                <input type="text" value={form.payment_terms} onChange={(e) => setForm((f) => ({ ...f, payment_terms: e.target.value }))} className={inputClass} placeholder="30 days" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={addRecurring} disabled={!form.customer_id || form.amount <= 0} className="flex-1 px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] disabled:opacity-60 text-white text-sm rounded-lg">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
