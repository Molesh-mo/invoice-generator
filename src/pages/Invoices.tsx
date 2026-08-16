import { useState } from 'react';
import { Search, Plus, Eye, Edit2, Copy, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { supabase } from '@/lib/supabase';
import type { InvoiceStatus, Invoice } from '@/types';

const FILTER_TABS: { label: string; value: 'all' | InvoiceStatus }[] = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'paid' },
  { label: 'Pending', value: 'pending' },
  { label: 'Overdue', value: 'overdue' },
  { label: 'Cancelled', value: 'cancelled' },
];

export function Invoices() {
  const { invoices, setView, setSelectedInvoiceId, deleteInvoice, upsertInvoice } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = invoices.filter((inv) => {
    const matchesFilter = filter === 'all' || inv.status === filter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      inv.invoice_number.toLowerCase().includes(q) ||
      (inv.customer?.name ?? '').toLowerCase().includes(q) ||
      (inv.customer?.business_name ?? '').toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  const openInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setView('invoice-detail');
  };

  const editInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setView('edit-invoice');
  };

  const duplicateInvoice = (inv: Invoice) => {
    const dup: Invoice = {
      ...inv,
      id: crypto.randomUUID(),
      invoice_number: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    upsertInvoice(dup);
    setSelectedInvoiceId(dup.id);
    setView('edit-invoice');
  };

  const handleDelete = async (id: string) => {
    await supabase.from('invoice_items').delete().eq('invoice_id', id);
    await supabase.from('invoices').delete().eq('id', id);
    deleteInvoice(id);
    setConfirmDelete(null);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Invoices</h2>
        <button
          onClick={() => setView('create-invoice')}
          className="flex items-center gap-2 px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Invoice
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]"
            />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-0 border-b border-slate-100 overflow-x-auto">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                filter === tab.value
                  ? 'border-[#6b5d8a] text-[#3d3551]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                filter === tab.value ? 'bg-[#f0ebf5] text-[#3d3551]' : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.value === 'all' ? invoices.length : invoices.filter((i) => i.status === tab.value).length}
              </span>
            </button>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice #</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-slate-800">{inv.invoice_number || '—'}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-slate-800">{inv.customer?.name}</p>
                      {inv.customer?.business_name && <p className="text-xs text-slate-400">{inv.customer.business_name}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{formatCurrency(inv.total)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openInvoice(inv.id)} title="View" className="p-1.5 text-slate-400 hover:text-[#6b5d8a] hover:bg-[#f0ebf5] rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => editInvoice(inv.id)} title="Edit" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => duplicateInvoice(inv)} title="Duplicate" className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(inv.id)} title="Delete" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <p className="px-4 py-10 text-center text-slate-400 text-sm">No invoices found.</p>
          ) : (
            filtered.map((inv) => (
              <div key={inv.id} className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-semibold text-slate-800 text-sm">{inv.invoice_number || 'Draft'}</span>
                    <p className="text-xs text-slate-500">{inv.customer?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 text-sm">{formatCurrency(inv.total)}</p>
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">{formatDate(inv.invoice_date)} · Due {formatDate(inv.due_date)}</p>
                  <div className="flex gap-1">
                    <button onClick={() => openInvoice(inv.id)} className="p-1.5 text-slate-400 hover:text-[#6b5d8a] rounded"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => editInvoice(inv.id)} className="p-1.5 text-slate-400 hover:text-slate-700 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => setConfirmDelete(inv.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-slate-800 mb-2">Delete Invoice?</h3>
            <p className="text-sm text-slate-500 mb-5">This action cannot be undone. All invoice items will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
