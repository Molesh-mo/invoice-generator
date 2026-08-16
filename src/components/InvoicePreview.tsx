import type { Invoice, Settings, InvoiceItem, InvoiceFormItem, InvoiceFormData } from '@/types';
import { formatCurrency, formatDate } from '@/utils/format';
import { StatusBadge } from '@/components/StatusBadge';

interface PreviewData {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  payment_terms: string;
  notes: string;
  payment_info: string;
  items: { product_code: string; product_name: string; description: string; quantity: number; unit_price: number; discount: number; tax_rate: number; line_total: number }[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  status: Invoice['status'];
}

interface CompanyInfo {
  business_name: string;
  business_email: string;
  business_phone: string;
  business_website: string;
  logo_url: string;
  street_address: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  business_address: string;
}

interface CustomerInfo {
  name: string;
  business_name: string;
  email: string;
  phone: string;
  street_address: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  address: string;
}

function fullAddress(c: CustomerInfo): string {
  const parts = [c.street_address, c.city, c.province, c.postal_code, c.country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : c.address;
}

interface Props {
  preview: PreviewData;
  company: CompanyInfo;
  customer: CustomerInfo;
  compact?: boolean;
}

export function InvoicePreview({ preview, company, customer, compact }: Props) {
  const coAddr = [company.street_address, company.city, company.province, company.postal_code, company.country].filter(Boolean).join(', ') || company.business_address;
  const cuAddr = fullAddress(customer);
  const cur = preview.currency || 'ZAR';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-5 py-4 lg:px-7 lg:py-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {company.logo_url ? (
              <img src={company.logo_url} alt="Logo" className="w-10 h-10 rounded-lg object-cover bg-white p-1" />
            ) : (
              <div className="w-10 h-10 bg-[#3d3551] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">{(company.business_name || 'L').charAt(0)}</span>
              </div>
            )}
            <div>
              <p className="text-white font-bold text-sm">{company.business_name || 'Your Company'}</p>
              <p className="text-slate-400 text-xs">{company.business_website}</p>
            </div>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-white tracking-tight">INVOICE</h1>
            <p className="text-slate-400 text-xs mt-0.5">{preview.invoice_number || 'INV-XXXX'}</p>
          </div>
        </div>
      </div>

      <div className={`p-5 lg:p-7 space-y-${compact ? '4' : '6'}`}>
        {/* From / To */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">From</p>
            <p className="font-semibold text-slate-900 text-sm">{company.business_name || 'Your Company'}</p>
            {coAddr && <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{coAddr}</p>}
            {company.business_email && <p className="text-slate-500 text-xs">{company.business_email}</p>}
            {company.business_phone && <p className="text-slate-500 text-xs">{company.business_phone}</p>}
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1.5">Bill To</p>
            <p className="font-semibold text-slate-900 text-sm">{customer.name || 'Customer name'}</p>
            {customer.business_name && <p className="text-slate-600 text-xs">{customer.business_name}</p>}
            {cuAddr && <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{cuAddr}</p>}
            {customer.email && <p className="text-slate-500 text-xs">{customer.email}</p>}
            {customer.phone && <p className="text-slate-500 text-xs">{customer.phone}</p>}
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-3 gap-3 py-3 border-y border-slate-100">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Invoice Date</p>
            <p className="text-slate-800 font-medium text-xs">{formatDate(preview.invoice_date) || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Due Date</p>
            <p className="text-slate-800 font-medium text-xs">{formatDate(preview.due_date) || '—'}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Payment Terms</p>
            <p className="text-slate-800 font-medium text-xs">{preview.payment_terms || '30 days'}</p>
          </div>
        </div>

        {/* Items */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200">
                <th className="text-left py-2 font-semibold text-slate-400 uppercase tracking-wide">Code</th>
                <th className="text-left py-2 font-semibold text-slate-400 uppercase tracking-wide">Description</th>
                <th className="text-center py-2 font-semibold text-slate-400 uppercase tracking-wide">Qty</th>
                <th className="text-right py-2 font-semibold text-slate-400 uppercase tracking-wide">Price</th>
                <th className="text-center py-2 font-semibold text-slate-400 uppercase tracking-wide">Disc</th>
                <th className="text-center py-2 font-semibold text-slate-400 uppercase tracking-wide">Tax</th>
                <th className="text-right py-2 font-semibold text-slate-400 uppercase tracking-wide">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preview.items.length === 0 ? (
                <tr><td colSpan={7} className="py-4 text-center text-slate-300">No items yet</td></tr>
              ) : (
                preview.items.map((item, i) => (
                  <tr key={i}>
                    <td className="py-2 text-slate-500 font-mono text-[11px]">{item.product_code || '—'}</td>
                    <td className="py-2">
                      <p className="font-medium text-slate-800">{item.product_name || 'Item'}</p>
                      {item.description && <p className="text-slate-400 text-[11px]">{item.description}</p>}
                    </td>
                    <td className="py-2 text-center text-slate-600">{item.quantity}</td>
                    <td className="py-2 text-right text-slate-600">{formatCurrency(item.unit_price, cur)}</td>
                    <td className="py-2 text-center text-slate-500">{item.discount > 0 ? `${item.discount}%` : '—'}</td>
                    <td className="py-2 text-center text-slate-500">{item.tax_rate > 0 ? `${item.tax_rate}%` : '—'}</td>
                    <td className="py-2 text-right font-semibold text-slate-800">{formatCurrency(item.line_total, cur)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-48 space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Subtotal</span>
              <span>{formatCurrency(preview.subtotal, cur)}</span>
            </div>
            {preview.discount_amount > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Discount</span>
                <span>-{formatCurrency(preview.discount_amount, cur)}</span>
              </div>
            )}
            {preview.tax_amount > 0 && (
              <div className="flex justify-between text-xs text-slate-500">
                <span>Tax</span>
                <span>{formatCurrency(preview.tax_amount, cur)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t-2 border-slate-200">
              <span>Total</span>
              <span>{formatCurrency(preview.total, cur)}</span>
            </div>
          </div>
        </div>

        {/* Status + Notes */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Status:</span>
          <StatusBadge status={preview.status} />
        </div>

        {(preview.notes || preview.payment_info) && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {preview.notes && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Notes</p>
                <p className="text-xs text-slate-500 leading-relaxed">{preview.notes}</p>
              </div>
            )}
            {preview.payment_info && (
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">Payment Information</p>
                <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-line">{preview.payment_info}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-3 border-t border-slate-100">
          <p className="text-slate-400 text-xs">Thank you for your business.</p>
        </div>
      </div>
    </div>
  );
}

export function invoiceToPreviewData(inv: Invoice): PreviewData {
  return {
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date,
    due_date: inv.due_date,
    currency: inv.currency,
    payment_terms: inv.payment_terms,
    notes: inv.notes,
    payment_info: inv.payment_info ?? '',
    items: (inv.items ?? []).map((i) => ({
      product_code: i.product_code,
      product_name: i.product_name,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      discount: i.discount,
      tax_rate: i.tax_rate,
      line_total: i.line_total,
    })),
    subtotal: inv.subtotal,
    discount_amount: inv.discount_amount,
    tax_amount: inv.tax_amount,
    total: inv.total,
    status: inv.status,
  };
}

export function formToPreviewData(
  form: InvoiceFormData,
  invoiceNumber: string,
  subtotal: number,
  discountAmount: number,
  taxAmount: number,
  total: number,
): PreviewData {
  return {
    invoice_number: invoiceNumber,
    invoice_date: form.invoice_date,
    due_date: form.due_date,
    currency: form.currency,
    payment_terms: form.payment_terms,
    notes: form.notes,
    payment_info: form.payment_info,
    items: form.items.map((i) => ({
      product_code: i.product_code,
      product_name: i.product_name,
      description: i.description,
      quantity: i.quantity,
      unit_price: i.unit_price,
      discount: i.discount,
      tax_rate: i.tax_rate,
      line_total: i.line_total,
    })),
    subtotal,
    discount_amount: discountAmount,
    tax_amount: taxAmount,
    total,
    status: 'draft',
  };
}

export function settingsToCompanyInfo(s: Settings | null): CompanyInfo {
  return {
    business_name: s?.business_name ?? '',
    business_email: s?.business_email ?? '',
    business_phone: s?.business_phone ?? '',
    business_website: s?.business_website ?? '',
    logo_url: s?.logo_url ?? '',
    street_address: s?.street_address ?? '',
    city: s?.city ?? '',
    province: s?.province ?? '',
    country: s?.country ?? '',
    postal_code: s?.postal_code ?? '',
    business_address: s?.business_address ?? '',
  };
}

export function formToCustomerInfo(form: InvoiceFormData): CustomerInfo {
  return {
    name: form.customer_name,
    business_name: form.business_name,
    email: form.customer_email,
    phone: form.customer_phone,
    street_address: form.billing_street,
    city: form.billing_city,
    province: form.billing_province,
    country: form.billing_country,
    postal_code: form.billing_postal,
    address: '',
  };
}

export function customerToInfo(c: Customer): CustomerInfo {
  return {
    name: c.name,
    business_name: c.business_name,
    email: c.email,
    phone: c.phone,
    street_address: c.street_address,
    city: c.city,
    province: c.province,
    country: c.country,
    postal_code: c.postal_code,
    address: c.address,
  };
}

export type { PreviewData, CompanyInfo, CustomerInfo };
