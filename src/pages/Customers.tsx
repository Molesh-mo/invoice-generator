import { useState } from 'react';
import { Search, Plus, X, ChevronRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { supabase } from '@/lib/supabase';
import type { Customer, Invoice } from '@/types';

function CustomerModal({
  customer,
  onClose,
  onSave,
}: {
  customer: Partial<Customer> | null;
  onClose: () => void;
  onSave: (c: Customer) => void;
}) {
  const [form, setForm] = useState({
    name: customer?.name ?? '',
    business_name: customer?.business_name ?? '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    address: customer?.address ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    if (customer?.id) {
      const { data } = await supabase
        .from('customers')
        .update({ ...form, updated_at: new Date().toISOString() })
        .eq('id', customer.id)
        .select()
        .single();
      if (data) onSave(data as Customer);
    } else {
      const { data } = await supabase
        .from('customers')
        .insert({ ...form })
        .select()
        .single();
      if (data) onSave(data as Customer);
    }
    setSaving(false);
    onClose();
  };

  const field = (label: string, key: keyof typeof form, type = 'text') => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]"
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-800">{customer?.id ? 'Edit Customer' : 'Add Customer'}</h3>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          {field('Name *', 'name')}
          {field('Business Name', 'business_name')}
          {field('Email', 'email', 'email')}
          {field('Phone', 'phone', 'tel')}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Address</label>
            <textarea
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a] resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm rounded-lg hover:bg-slate-50">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="flex-1 px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] disabled:opacity-60 text-white text-sm rounded-lg"
          >
            {saving ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CustomerProfile({ customer, invoices, onClose }: { customer: Customer; invoices: Invoice[]; onClose: () => void }) {
  const custInvoices = invoices.filter((i) => i.customer_id === customer.id);
  const totalSpent = custInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const outstanding = custInvoices.filter((i) => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900">{customer.name}</h3>
            {customer.business_name && <p className="text-sm text-slate-500">{customer.business_name}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Contact */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {customer.email && <div><p className="text-xs text-slate-500 mb-0.5">Email</p><p className="text-slate-800">{customer.email}</p></div>}
            {customer.phone && <div><p className="text-xs text-slate-500 mb-0.5">Phone</p><p className="text-slate-800">{customer.phone}</p></div>}
            {customer.address && <div className="col-span-2"><p className="text-xs text-slate-500 mb-0.5">Address</p><p className="text-slate-800">{customer.address}</p></div>}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-slate-900">{custInvoices.length}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Invoices</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-emerald-700">{formatCurrency(totalSpent)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Total Paid</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3 text-center">
              <p className="text-sm font-bold text-amber-700">{formatCurrency(outstanding)}</p>
              <p className="text-xs text-slate-500 mt-0.5">Outstanding</p>
            </div>
          </div>

          {/* Invoice history */}
          <div>
            <h4 className="font-semibold text-slate-700 text-sm mb-2">Invoice History</h4>
            {custInvoices.length === 0 ? (
              <p className="text-sm text-slate-400">No invoices yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {custInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{inv.invoice_number}</p>
                      <p className="text-xs text-slate-400">{formatDate(inv.invoice_date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-slate-700">{formatCurrency(inv.total)}</p>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Customers() {
  const { customers, invoices, upsertCustomer } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [profileTarget, setProfileTarget] = useState<Customer | null>(null);

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.business_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
  });

  const getCustomerStats = (id: string) => {
    const custInvoices = invoices.filter((i) => i.customer_id === id);
    const totalSpent = custInvoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
    const lastInvoice = custInvoices[0];
    return { count: custInvoices.length, totalSpent, lastInvoice };
  };

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-xl font-bold text-slate-900">Customers</h2>
        <button
          onClick={() => { setEditTarget(null); setModal('add'); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] text-white text-sm font-medium rounded-lg shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]"
            />
          </div>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</th>
                <th className="text-center px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoices</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Spent</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Invoice</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">No customers found.</td></tr>
              ) : filtered.map((c) => {
                const { count, totalSpent, lastInvoice } = getCustomerStats(c.id);
                return (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-slate-800">{c.name}</p>
                      {c.business_name && <p className="text-xs text-slate-400">{c.business_name}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">{c.email || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{c.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">{count}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{formatCurrency(totalSpent)}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{lastInvoice ? formatDate(lastInvoice.invoice_date) : '—'}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setProfileTarget(c)} className="p-1.5 text-slate-400 hover:text-[#6b5d8a] rounded-lg hover:bg-[#f0ebf5]">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-slate-100">
          {filtered.map((c) => {
            const { count, totalSpent } = getCustomerStats(c.id);
            return (
              <button key={c.id} onClick={() => setProfileTarget(c)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
                <div className="w-10 h-10 rounded-full bg-[#f0ebf5] text-[#3d3551] font-semibold text-sm flex items-center justify-center shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm">{c.name}</p>
                  <p className="text-xs text-slate-400 truncate">{c.business_name || c.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-700">{formatCurrency(totalSpent)}</p>
                  <p className="text-xs text-slate-400">{count} invoice{count !== 1 ? 's' : ''}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <CustomerModal
          customer={editTarget}
          onClose={() => setModal(null)}
          onSave={upsertCustomer}
        />
      )}

      {profileTarget && (
        <CustomerProfile
          customer={profileTarget}
          invoices={invoices}
          onClose={() => setProfileTarget(null)}
        />
      )}
    </div>
  );
}
