import { FileText, TrendingUp, DollarSign, Clock, Plus, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { BarChart, DonutChart } from '@/components/Charts';
import { formatCurrency, formatCurrencyShort, formatDate } from '@/utils/format';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

export function Dashboard() {
  const { invoices, setView, setSelectedInvoiceId } = useApp();

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalOutstanding = invoices.filter((i) => i.status === 'sent' || i.status === 'unpaid').reduce((s, i) => s + i.total, 0);
  const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const stats = [
    { label: 'Total Invoiced', value: formatCurrency(totalInvoiced), icon: TrendingUp, bg: 'bg-[#f0ebf5]', iconColor: 'text-[#6b5d8a]' },
    { label: 'Paid', value: formatCurrency(totalPaid), icon: DollarSign, bg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Outstanding', value: formatCurrency(totalOutstanding), icon: Clock, bg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { label: 'Overdue', value: formatCurrency(totalOverdue), icon: AlertCircle, bg: 'bg-red-50', iconColor: 'text-red-600' },
  ];

  const now = new Date();
  const monthlyData = MONTH_LABELS.map((label, idx) => {
    const monthIdx = (now.getMonth() - (7 - idx) + 12) % 12;
    const year = now.getFullYear() - (now.getMonth() < monthIdx ? 1 : 0);
    const total = invoices.filter((inv) => {
      const d = new Date(inv.invoice_date + 'T00:00:00');
      return d.getMonth() === monthIdx && d.getFullYear() === year;
    }).reduce((s, i) => s + i.total, 0);
    return { label, value: total };
  });

  const paidCount = invoices.filter((i) => i.status === 'paid').length;
  const unpaidCount = invoices.filter((i) => i.status === 'sent' || i.status === 'unpaid').length;
  const overdueCount = invoices.filter((i) => i.status === 'overdue').length;
  const donutData = [
    { label: 'Paid', value: paidCount, color: '#10b981' },
    { label: 'Unpaid', value: unpaidCount, color: '#f59e0b' },
    { label: 'Overdue', value: overdueCount, color: '#ef4444' },
  ];

  const recent = invoices.slice(0, 6);

  const openInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setView('invoice-detail');
  };

  return (
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Financial overview and analytics.</p>
        </div>
        <button onClick={() => setView('create-invoice')} className="flex items-center gap-2 px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] text-white text-sm font-medium rounded-lg shadow-sm transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Invoice</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
              <p className="text-lg lg:text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Invoice Activity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly invoiced totals</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{formatCurrencyShort(monthlyData.reduce((s, d) => s + d.value, 0))}</p>
          </div>
          <BarChart data={monthlyData} height={200} />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 text-sm mb-4">Payment Status</h3>
          <div className="flex justify-center">
            <DonutChart data={donutData} size={150} />
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800 text-sm">Recent Invoices</h3>
          <button onClick={() => setView('invoices')} className="flex items-center gap-1 text-sm text-[#6b5d8a] hover:text-[#3d3551] font-medium">
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Issue Date</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recent.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">No invoices yet.</td></tr>
              ) : (
                recent.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => openInvoice(inv.id)}>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{inv.invoice_number}</td>
                    <td className="px-5 py-3.5 text-slate-600">{inv.customer?.name ?? '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.invoice_date)}</td>
                    <td className="px-5 py-3.5 text-slate-500">{formatDate(inv.due_date)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold text-slate-800">{formatCurrency(inv.total, inv.currency)}</td>
                    <td className="px-5 py-3.5"><StatusBadge status={inv.status} /></td>
                    <td className="px-5 py-3.5 text-[#6b5d8a] text-sm font-medium">View</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {recent.map((inv) => (
            <button key={inv.id} onClick={() => openInvoice(inv.id)} className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-medium text-slate-800 text-sm">{inv.invoice_number}</span>
                  <StatusBadge status={inv.status} />
                </div>
                <p className="text-xs text-slate-500 truncate">{inv.customer?.name} · {formatDate(inv.invoice_date)}</p>
              </div>
              <p className="font-semibold text-slate-800 text-sm shrink-0">{formatCurrency(inv.total, inv.currency)}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
