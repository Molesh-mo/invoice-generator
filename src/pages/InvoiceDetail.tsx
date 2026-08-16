import { useState } from 'react';
import { ArrowLeft, Download, Send, Edit2, Copy, CheckCircle, AlertCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { StatusBadge } from '@/components/StatusBadge';
import { formatCurrency, formatDate } from '@/utils/format';
import { supabase } from '@/lib/supabase';
import { buildMakePayload, triggerMakeWebhook } from '@/services/makeWebhook';
import type { Invoice } from '@/types';

export function InvoiceDetail() {
  const { selectedInvoiceId, invoices, settings, setView, upsertInvoice, setSelectedInvoiceId } = useApp();
  const invoice = invoices.find((i) => i.id === selectedInvoiceId);
  const [marking, setMarking] = useState(false);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <AlertCircle className="w-10 h-10 text-slate-300 mb-3" />
        <p className="text-slate-500">Invoice not found.</p>
        <button onClick={() => setView('invoices')} className="mt-4 text-[#6b5d8a] text-sm hover:underline">
          Back to Invoices
        </button>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const markAsPaid = async () => {
    setMarking(true);
    await supabase.from('invoices').update({ status: 'paid', updated_at: new Date().toISOString() }).eq('id', invoice.id);
    upsertInvoice({ ...invoice, status: 'paid' });
    showToast('Invoice marked as paid.');
    setMarking(false);
  };

  const handleSend = async () => {
    setSending(true);
    if (settings) {
      const payload = buildMakePayload(invoice, settings);
      await triggerMakeWebhook(payload);
    }
    showToast('Invoice queued for delivery (Make.com not yet connected).');
    setSending(false);
  };

  const duplicateInvoice = () => {
    const dup: Invoice = {
      ...invoice,
      id: crypto.randomUUID(),
      invoice_number: '',
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSelectedInvoiceId(dup.id);
    setView('create-invoice');
  };

  const s = settings;

  return (
    <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-4">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={() => setView('invoices')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Invoices
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <button
              onClick={markAsPaid}
              disabled={marking}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Mark as Paid
            </button>
          )}
          <button
            onClick={() => { setSelectedInvoiceId(invoice.id); setView('edit-invoice'); }}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={duplicateInvoice}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
            <button
            onClick={handleSend}
            disabled={sending}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#d4cce0] text-[#6b5d8a] bg-[#f0ebf5] text-sm font-medium rounded-lg hover:bg-[#e0d5ea]"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
          <button
            className="flex items-center gap-1.5 px-3 py-2 bg-[#3d3551] hover:bg-[#2a2438] text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="flex items-center gap-2 bg-slate-800 text-white text-sm px-4 py-3 rounded-lg shadow-lg w-fit">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      {/* Invoice document */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:shadow-none">
        {/* Header bar */}
        <div className="bg-slate-900 px-6 py-5 lg:px-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">INVOICE</h1>
              <p className="text-slate-400 text-sm mt-1">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">{formatCurrency(invoice.total)}</p>
              <div className="mt-1"><StatusBadge status={invoice.status} /></div>
            </div>
          </div>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* From / To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">From</p>
              <p className="font-bold text-slate-900">{s?.business_name || 'My Business'}</p>
              {s?.business_address && <p className="text-slate-500 text-sm mt-1">{s.business_address}</p>}
              {s?.business_email && <p className="text-slate-500 text-sm">{s.business_email}</p>}
              {s?.business_phone && <p className="text-slate-500 text-sm">{s.business_phone}</p>}
              {s?.business_website && <p className="text-slate-500 text-sm">{s.business_website}</p>}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Bill To</p>
              <p className="font-bold text-slate-900">{invoice.customer?.name}</p>
              {invoice.customer?.business_name && <p className="text-slate-600 text-sm">{invoice.customer.business_name}</p>}
              {invoice.customer?.email && <p className="text-slate-500 text-sm">{invoice.customer.email}</p>}
              {invoice.customer?.phone && <p className="text-slate-500 text-sm">{invoice.customer.phone}</p>}
              {invoice.customer?.address && <p className="text-slate-500 text-sm mt-1">{invoice.customer.address}</p>}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Invoice Date</p>
              <p className="text-slate-800 font-medium text-sm">{formatDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Due Date</p>
              <p className="text-slate-800 font-medium text-sm">{formatDate(invoice.due_date)}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1">Status</p>
              <StatusBadge status={invoice.status} />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Product / Service</th>
                    <th className="text-center py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-16">Qty</th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Unit Price</th>
                    <th className="text-right py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide w-28">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(invoice.items ?? []).map((item) => (
                    <tr key={item.id}>
                      <td className="py-3">
                        <p className="font-medium text-slate-800">{item.product_name}</p>
                        {item.description && <p className="text-slate-500 text-xs mt-0.5">{item.description}</p>}
                      </td>
                      <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                      <td className="py-3 text-right text-slate-600">{formatCurrency(item.unit_price)}</td>
                      <td className="py-3 text-right font-semibold text-slate-800">{formatCurrency(item.line_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-4 flex justify-end">
              <div className="w-56 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(invoice.subtotal)}</span>
                </div>
                {invoice.tax_rate > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>VAT ({invoice.tax_rate}%)</span>
                    <span>{formatCurrency(invoice.tax_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t-2 border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-1.5">Notes</p>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-slate-400 text-sm">Thank you for your business.</p>
            {s?.business_website && <p className="text-slate-400 text-xs mt-0.5">{s.business_website}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
