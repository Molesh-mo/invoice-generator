import { useState } from 'react';
import { DollarSign, TrendingUp, Clock, AlertCircle, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { BarChart, DonutChart } from '@/components/Charts';
import { formatCurrency, formatCurrencyShort, formatDate } from '@/utils/format';
import type { InvoiceStatus } from '@/types';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export function Reports() {
  const { invoices, customers } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [customerFilter, setCustomerFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    if (customerFilter !== 'all' && inv.customer_id !== customerFilter) return false;
    if (dateRange.from && inv.invoice_date < dateRange.from) return false;
    if (dateRange.to && inv.invoice_date > dateRange.to) return false;
    return true;
  });

  const totalInvoiced = filtered.reduce((s, i) => s + i.total, 0);
  const totalCollected = filtered.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOutstanding = filtered.filter((i) => i.status === 'sent' || i.status === 'unpaid').reduce((s, i) => s + i.total, 0);
  const totalOverdue = filtered.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: 'Total Invoiced', value: formatCurrency(totalInvoiced), icon: DollarSign, bg: 'bg-[#f0ebf5]', color: 'text-[#6b5d8a]' },
    { label: 'Total Collected', value: formatCurrency(totalCollected), icon: TrendingUp, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Outstanding', value: formatCurrency(totalOutstanding), icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Overdue', value: formatCurrency(totalOverdue), icon: AlertCircle, bg: 'bg-red-50', color: 'text-red-600' },
  ];

  const now = new Date();
  const monthlyData = MONTH_LABELS.map((label, idx) => {
    const monthIdx = (now.getMonth() - (7 - idx) + 12) % 12;
    const year = now.getFullYear() - (now.getMonth() < monthIdx ? 1 : 0);
    const total = filtered.filter((inv) => {
      const d = new Date(inv.invoice_date + 'T00:00:00');
      return d.getMonth() === monthIdx && d.getFullYear() === year;
    }).reduce((s, i) => s + i.total, 0);
    return { label, value: total };
  });

  const paidCount = filtered.filter((i) => i.status === 'paid').length;
  const unpaidCount = filtered.filter((i) => i.status === 'sent' || i.status === 'unpaid').length;
  const overdueCount = filtered.filter((i) => i.status === 'overdue').length;
  const donutData = [
    { label: 'Paid', value: paidCount, color: '#10b981' },
    { label: 'Unpaid', value: unpaidCount, color: '#f59e0b' },
    { label: 'Overdue', value: overdueCount, color: '#ef4444' },
  ];

  const revenueByCustomer = customers.map((c) => {
    const custInvoices = filtered.filter((i) => i.customer_id === c.id);
    const total = custInvoices.reduce((s, i) => s + i.total, 0);
    return { name: c.name, total, count: custInvoices.length };
  }).filter((r) => r.total > 0).sort((a, b) => b.total - a.total).slice(0, 8);

  const maxRevenue = Math.max(...revenueByCustomer.map((r) => r.total), 1);

  const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]';

  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Reports</h2>
        <p className="text-slate-500 text-sm mt-0.5">Financial insights and business performance.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">Filters</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | InvoiceStatus)} className={inputClass}>
              <option value="all">All statuses</option>
              <option value="paid">Paid</option>
              <option value="sent">Sent</option>
              <option value="unpaid">Unpaid</option>
              <option value="overdue">Overdue</option>
              <option value="draft">Draft</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Customer</label>
            <select value={customerFilter} onChange={(e) => setCustomerFilter(e.target.value)} className={inputClass}>
              <option value="all">All customers</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">From Date</label>
            <input type="date" value={dateRange.from} onChange={(e) => setDateRange((d) => ({ ...d, from: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
            <input type="date" value={dateRange.to} onChange={(e) => setDateRange((d) => ({ ...d, to: e.target.value }))} className={inputClass} />
          </div>
        </div>
      </div>

      {/* KPI Cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Invoice Amount by Month</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly invoiced totals</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrencyShort(monthlyData.reduce((s, d) => s + d.value, 0))}</p>
          </div>
          <BarChart data={monthlyData} height={200} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Paid vs Unpaid</h3>
          <div className="flex justify-center">
            <DonutChart data={donutData} size={150} />
          </div>
        </div>
      </div>

      {/* Revenue by Customer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h3 className="font-semibold text-slate-800 text-sm mb-4">Revenue by Customer</h3>
        {revenueByCustomer.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">No revenue data for selected filters.</p>
        ) : (
          <div className="space-y-3">
            {revenueByCustomer.map((r, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-28 sm:w-36 shrink-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.count} invoice{r.count !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex-1 h-6 bg-slate-50 rounded-full overflow-hidden">
                  <div className="h-full bg-[#6b5d8a] rounded-full transition-all" style={{ width: `${(r.total / maxRevenue) * 100}%` }} />
                </div>
                <div className="w-20 sm:w-28 text-right shrink-0">
                  <p className="text-sm font-semibold text-slate-800">{formatCurrency(r.total)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent invoices table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Filtered Invoices ({filtered.length})</h3>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-400">No invoices match these filters.</td></tr>
              ) : filtered.slice(0, 20).map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800">{inv.invoice_number}</td>
                  <td className="px-5 py-3 text-slate-600">{inv.customer?.name ?? '—'}</td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-800">{formatCurrency(inv.total, inv.currency)}</td>
                  <td className="px-5 py-3 text-slate-500">{formatDate(inv.invoice_date)}</td>
                  <td className="px-5 py-3 text-slate-500 capitalize">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
