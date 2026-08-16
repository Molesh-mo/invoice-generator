import { useState } from 'react';
import { CreditCard, CheckCircle, Clock, AlertCircle, DollarSign, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { supabase } from '@/lib/supabase';
import type { InvoiceStatus } from '@/types';

const PAYMENT_METHODS = ['Bank Transfer', 'Card', 'Cash', 'EFT', 'PayFast', 'Other'];

interface PaymentRecord {
  id: string;
  invoice_id: string;
  amount: number;
  date: string;
  method: string;
}

export function Payments() {
  const { invoices, setView, setSelectedInvoiceId, upsertInvoice } = useApp();
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [recordTarget, setRecordTarget] = useState<string | null>(null);
  const [recordForm, setRecordForm] = useState({ amount: 0, date: new Date().toISOString().split('T')[0], method: 'Bank Transfer' });

  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const outstandingInvoices = invoices.filter((i) => i.status === 'sent' || i.status === 'unpaid');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  const totalCollected = paidInvoices.reduce((s, i) => s + i.total, 0);
  const totalOutstanding = outstandingInvoices.reduce((s, i) => s + i.total, 0);
  const totalOverdue = overdueInvoices.reduce((s, i) => s + i.total, 0);

  const allPaymentInvoices = [...paidInvoices, ...outstandingInvoices, ...overdueInvoices].sort((a, b) => b.invoice_date.localeCompare(a.invoice_date));

  const openInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setView('invoice-detail');
  };

  const markAsPaid = async (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;
    await supabase.from('invoices').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', invoiceId);
    upsertInvoice({ ...inv, status: 'paid' });
    setShowRecordModal(false);
  };

  const stats = [
    { label: 'Total Collected', value: formatCurrency(totalCollected), icon: DollarSign, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Outstanding', value: formatCurrency(totalOutstanding), icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Overdue', value: formatCurrency(totalOverdue), icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600' },
    { label: 'Collected Count', value: String(paidInvoices.length), icon: CheckCircle, bg: 'bg-[#f0ebf5]', color: 'text-[#6b5d8a]' },
  ];

  const inputClass = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]';
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Payments</h2>
        <p className="text-slate-500 text-sm mt-0.5">Track received payments and outstanding balances.</p>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Payment gateway integration</p>
          <p className="text-sm text-blue-700 mt-0.5">Payment processing is modular. Connect Stripe, PayFast, or another gateway later to accept online payments directly from invoices.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Payment Records</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allPaymentInvoices.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">No payment records yet.</td></tr>
              ) : allPaymentInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openInvoice(inv.id)}>
                  <td className="px-5 py-3.5 font-medium text-slate-800">{inv.invoice_number}</td>
                  <td className="px-5 py-3.5 text-slate-600">{inv.customer?.name ?? '—'}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{formatCurrency(inv.total, inv.currency)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.invoice_date)}</td>
                  <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.due_date)}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3.5">
                    {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                      <button onClick={(e) => { e.stopPropagation(); setRecordTarget(inv.id); setRecordForm({ amount: inv.total, date: new Date().toISOString().split('T')[0], method: 'Bank Transfer' }); setShowRecordModal(true); }} className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                        Record Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {allPaymentInvoices.map((inv) => (
            <button key={inv.id} onClick={() => openInvoice(inv.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-slate-800 text-sm">{inv.invoice_number}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="text-xs text-slate-500 truncate">{inv.customer?.name} · Due {formatDate(inv.due_date)}</p>
              </div>
              <p className="font-semibold text-slate-800 text-sm shrink-0">{formatCurrency(inv.total, inv.currency)}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Record payment modal */}
      {showRecordModal && recordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-slate-800">Record Payment</h3>
              <button onClick={() => setShowRecordModal(false)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Amount</label>
                <input type="number" min="0" step="0.01" value={recordForm.amount} onChange={(e) => setRecordForm((f) => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Date</label>
                <input type="date" value={recordForm.date} onChange={(e) => setRecordForm((f) => ({ ...f, date: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Payment Method</label>
                <select value={recordForm.method} onChange={(e) => setRecordForm((f) => ({ ...f, method: e.target.value }))} className={inputClass}>
                  {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowRecordModal(false)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">Cancel</button>
              <button onClick={() => markAsPaid(recordTarget)} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg">Mark as Paid</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
