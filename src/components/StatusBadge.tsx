import type { InvoiceStatus } from '@/types';

interface Props {
  status: InvoiceStatus;
}

const config: Record<InvoiceStatus, { label: string; classes: string; dot: string }> = {
  paid: { label: 'Paid', classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  sent: { label: 'Sent', classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200', dot: 'bg-blue-500' },
  unpaid: { label: 'Unpaid', classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-500' },
  overdue: { label: 'Overdue', classes: 'bg-red-50 text-red-700 ring-1 ring-red-200', dot: 'bg-red-500' },
  draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-600 ring-1 ring-gray-200', dot: 'bg-gray-400' },
  cancelled: { label: 'Cancelled', classes: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200', dot: 'bg-slate-400' },
};

export function StatusBadge({ status }: Props) {
  const { label, classes, dot } = config[status] ?? config.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
