import { useState } from 'react';
import { Plus, Trash2, ChevronDown, CheckCircle, Upload, X, Eye, EyeOff } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { formatCurrency, todayISO, addDaysISO } from '@/utils/format';
import { InvoicePreview, formToPreviewData, formToCustomerInfo, settingsToCompanyInfo } from '@/components/InvoicePreview';
import type { InvoiceFormData, InvoiceFormItem, Invoice, Customer } from '@/types';

const emptyItem = (): InvoiceFormItem => ({
  id: crypto.randomUUID(),
  product_code: '',
  product_name: '',
  description: '',
  quantity: 1,
  unit_price: 0,
  discount: 0,
  tax_rate: 0,
  line_total: 0,
});

function calcLineTotal(item: InvoiceFormItem): number {
  const gross = item.quantity * item.unit_price;
  const discounted = gross * (1 - item.discount / 100);
  return discounted * (1 + item.tax_rate / 100);
}

interface Props {
  editInvoice?: Invoice | null;
}

export function CreateInvoice({ editInvoice }: Props) {
  const { customers, settings, nextInvoiceNumber, upsertInvoice, setView, setSelectedInvoiceId, upsertCustomer } = useApp();

  const [form, setForm] = useState<InvoiceFormData>(() => {
    if (editInvoice) {
      return {
        customer_id: editInvoice.customer_id,
        customer_name: editInvoice.customer?.name ?? '',
        customer_email: editInvoice.customer?.email ?? '',
        customer_phone: editInvoice.customer?.phone ?? '',
        business_name: editInvoice.customer?.business_name ?? '',
        billing_street: editInvoice.customer?.street_address ?? '',
        billing_city: editInvoice.customer?.city ?? '',
        billing_province: editInvoice.customer?.province ?? '',
        billing_country: editInvoice.customer?.country ?? '',
        billing_postal: editInvoice.customer?.postal_code ?? '',
        invoice_date: editInvoice.invoice_date,
        due_date: editInvoice.due_date,
        currency: editInvoice.currency ?? 'ZAR',
        payment_terms: editInvoice.payment_terms ?? settings?.default_payment_terms ?? '30 days',
        notes: editInvoice.notes,
        payment_info: editInvoice.payment_info ?? settings?.payment_info ?? '',
        items: (editInvoice.items ?? []).map((i) => ({
          id: i.id,
          product_code: i.product_code ?? '',
          product_name: i.product_name,
          description: i.description,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount ?? 0,
          tax_rate: i.tax_rate ?? 0,
          line_total: i.line_total,
        })),
      };
    }
    return {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      business_name: '',
      billing_street: '',
      billing_city: '',
      billing_province: '',
      billing_country: 'South Africa',
      billing_postal: '',
      invoice_date: todayISO(),
      due_date: addDaysISO(30),
      currency: settings?.default_currency ?? 'ZAR',
      payment_terms: settings?.default_payment_terms ?? '30 days',
      notes: settings?.default_notes ?? '',
      payment_info: settings?.payment_info ?? '',
      items: [{ ...emptyItem(), tax_rate: settings?.default_tax_rate ?? 0 }],
    };
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showPreviewMobile, setShowPreviewMobile] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.business_name.toLowerCase().includes(customerSearch.toLowerCase()),
  );

  const selectCustomer = (c: Customer) => {
    setForm((f) => ({
      ...f,
      customer_id: c.id,
      customer_name: c.name,
      customer_email: c.email,
      customer_phone: c.phone,
      business_name: c.business_name,
      billing_street: c.street_address,
      billing_city: c.city,
      billing_province: c.province,
      billing_country: c.country,
      billing_postal: c.postal_code,
    }));
    setCustomerSearch(c.name);
    setShowCustomerDropdown(false);
  };

  const updateItem = (index: number, field: keyof InvoiceFormItem, value: string | number) => {
    setForm((f) => {
      const items = [...f.items];
      const item = { ...items[index], [field]: value };
      item.line_total = calcLineTotal(item);
      items[index] = item;
      return { ...f, items };
    });
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, { ...emptyItem(), tax_rate: settings?.default_tax_rate ?? 0 }] }));
  const removeItem = (index: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));

  const subtotal = form.items.reduce((s, i) => s + i.quantity * i.unit_price, 0);
  const discountAmount = form.items.reduce((s, i) => s + (i.quantity * i.unit_price) * (i.discount / 100), 0);
  const taxAmount = form.items.reduce((s, i) => {
    const gross = i.quantity * i.unit_price * (1 - i.discount / 100);
    return s + gross * (i.tax_rate / 100);
  }, 0);
  const total = subtotal - discountAmount + taxAmount;

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.customer_name.trim()) e.customer_name = 'Customer name is required.';
    if (!form.customer_email.trim()) e.customer_email = 'Customer email is required.';
    if (form.items.length === 0) e.items = 'Add at least one item.';
    form.items.forEach((item, i) => {
      if (!item.product_name.trim()) e[`item_name_${i}`] = 'Product name required.';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogoUpload = async (file: File) => {
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      // Update settings with logo
      if (settings) {
        const updated = { ...settings, logo_url: dataUrl };
        if (settings.id) {
          await supabase.from('settings').update({ logo_url: dataUrl, updated_at: new Date().toISOString() }).eq('id', settings.id);
        }
      }
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = async () => {
    if (settings?.id) {
      await supabase.from('settings').update({ logo_url: '', updated_at: new Date().toISOString() }).eq('id', settings.id);
    }
  };

  const saveInvoice = async (status: 'draft' | 'sent') => {
    if (!validate()) return;
    setSaving(true);

    try {
      let customerId = form.customer_id;
      if (!customerId) {
        const newCustomer = {
          name: form.customer_name,
          email: form.customer_email,
          phone: form.customer_phone,
          business_name: form.business_name,
          address: [form.billing_street, form.billing_city, form.billing_province, form.billing_postal].filter(Boolean).join(', '),
          street_address: form.billing_street,
          city: form.billing_city,
          province: form.billing_province,
          country: form.billing_country,
          postal_code: form.billing_postal,
        };
        const { data: cData, error: cErr } = await supabase.from('customers').insert(newCustomer).select().single();
        if (cErr) throw cErr;
        customerId = cData.id;
        upsertCustomer(cData as Customer);
      }

      const invNumber = editInvoice?.invoice_number ?? nextInvoiceNumber();
      const invId = editInvoice?.id ?? crypto.randomUUID();

      const invoiceRow = {
        id: invId,
        invoice_number: invNumber,
        customer_id: customerId,
        invoice_date: form.invoice_date,
        due_date: form.due_date,
        currency: form.currency,
        payment_terms: form.payment_terms,
        subtotal,
        discount_amount: discountAmount,
        tax_rate: 0,
        tax_amount: taxAmount,
        total,
        status,
        notes: form.notes,
        payment_info: form.payment_info,
        updated_at: new Date().toISOString(),
      };

      if (editInvoice) {
        await supabase.from('invoices').update(invoiceRow).eq('id', invId);
        await supabase.from('invoice_items').delete().eq('invoice_id', invId);
      } else {
        await supabase.from('invoices').insert({ ...invoiceRow, created_at: new Date().toISOString() });
      }

      const itemRows = form.items.map((item, idx) => ({
        id: crypto.randomUUID(),
        invoice_id: invId,
        product_code: item.product_code,
        product_name: item.product_name,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount,
        tax_rate: item.tax_rate,
        line_total: item.line_total,
        sort_order: idx,
        created_at: new Date().toISOString(),
      }));
      await supabase.from('invoice_items').insert(itemRows);

      const customer = customers.find((c) => c.id === customerId) ?? {
        id: customerId!,
        name: form.customer_name,
        email: form.customer_email,
        phone: form.customer_phone,
        business_name: form.business_name,
        address: '',
        street_address: form.billing_street,
        city: form.billing_city,
        province: form.billing_province,
        country: form.billing_country,
        postal_code: form.billing_postal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const fullInvoice: Invoice = {
        ...invoiceRow,
        created_at: editInvoice?.created_at ?? new Date().toISOString(),
        customer,
        items: itemRows,
      };

      upsertInvoice(fullInvoice);

      if (status === 'sent') {
        setSuccess(true);
        setTimeout(() => {
          setSelectedInvoiceId(invId);
          setView('invoice-detail');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invoice Generated!</h2>
          <p className="text-slate-500 text-sm">Redirecting to invoice preview...</p>
        </div>
      </div>
    );
  }

  const previewData = formToPreviewData(form, editInvoice?.invoice_number ?? nextInvoiceNumber(), subtotal, discountAmount, taxAmount, total);
  const companyInfo = settingsToCompanyInfo(settings);
  const customerInfo = formToCustomerInfo(form);

  const inputClass = 'w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]';
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {editInvoice ? `Edit ${editInvoice.invoice_number}` : 'Invoice Builder'}
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {editInvoice ? 'Update invoice details below.' : 'Build your invoice with a live preview.'}
          </p>
        </div>
        <button
          onClick={() => setShowPreviewMobile(!showPreviewMobile)}
          className="lg:hidden flex items-center gap-2 px-3 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg"
        >
          {showPreviewMobile ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showPreviewMobile ? 'Edit' : 'Preview'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Form */}
        <div className={`${showPreviewMobile ? 'hidden' : 'block'} lg:block space-y-5`}>
          {/* Company Info + Logo */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-1 border-b border-slate-100">Company Information</h3>
            {/* Logo upload */}
            <div className="flex items-center gap-4">
              {settings?.logo_url ? (
                <div className="relative">
                  <img src={settings.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                  <button
                    onClick={removeLogo}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className={`w-16 h-16 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:border-[#6b5d8a] hover:bg-[#faf8f5] transition-colors ${logoUploading ? 'opacity-50' : ''}`}>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                  <Upload className="w-5 h-5 text-slate-400" />
                </label>
              )}
              <div>
                <p className="text-sm font-medium text-slate-700">Company Logo</p>
                <p className="text-xs text-slate-400">Click to upload or replace</p>
              </div>
            </div>
            <p className="text-xs text-slate-400">Company details are managed in Settings and auto-populate your invoices.</p>
          </div>

          {/* Bill To */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-1 border-b border-slate-100">Bill To</h3>

            {/* Customer search */}
            <div className="relative">
              <label className={labelClass}>Search Existing Customer</label>
              <div className="relative">
                <input
                  type="text"
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  placeholder="Type to search..."
                  className={`${inputClass} pr-8`}
                />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
              {showCustomerDropdown && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {filteredCustomers.map((c) => (
                    <button key={c.id} onClick={() => selectCustomer(c)} className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-800">{c.name}</span>
                      {c.business_name && <span className="text-slate-500 ml-2">· {c.business_name}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className={labelClass}>Customer / Company Name *</label>
                <input type="text" value={form.customer_name} onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))} placeholder="Full name or company" className={errors.customer_name ? `${inputClass} border-red-400` : inputClass} />
                {errors.customer_name && <p className="text-red-500 text-xs mt-0.5">{errors.customer_name}</p>}
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={form.customer_email} onChange={(e) => setForm((f) => ({ ...f, customer_email: e.target.value }))} placeholder="email@example.com" className={errors.customer_email ? `${inputClass} border-red-400` : inputClass} />
                {errors.customer_email && <p className="text-red-500 text-xs mt-0.5">{errors.customer_email}</p>}
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={form.customer_phone} onChange={(e) => setForm((f) => ({ ...f, customer_phone: e.target.value }))} placeholder="+27 83 000 0000" className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Street Address</label>
                <input type="text" value={form.billing_street} onChange={(e) => setForm((f) => ({ ...f, billing_street: e.target.value }))} placeholder="Street address" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City</label>
                <input type="text" value={form.billing_city} onChange={(e) => setForm((f) => ({ ...f, billing_city: e.target.value }))} placeholder="City" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Province / State</label>
                <input type="text" value={form.billing_province} onChange={(e) => setForm((f) => ({ ...f, billing_province: e.target.value }))} placeholder="Province" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Country</label>
                <input type="text" value={form.billing_country} onChange={(e) => setForm((f) => ({ ...f, billing_country: e.target.value }))} placeholder="Country" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Postal Code</label>
                <input type="text" value={form.billing_postal} onChange={(e) => setForm((f) => ({ ...f, billing_postal: e.target.value }))} placeholder="Postal code" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-1 border-b border-slate-100">Invoice Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Invoice Number</label>
                <input type="text" value={editInvoice?.invoice_number ?? nextInvoiceNumber()} disabled className={`${inputClass} bg-slate-50 text-slate-500 cursor-not-allowed`} />
              </div>
              <div>
                <label className={labelClass}>Currency</label>
                <select value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} className={inputClass}>
                  <option value="ZAR">ZAR (R)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Invoice Date</label>
                <input type="date" value={form.invoice_date} onChange={(e) => setForm((f) => ({ ...f, invoice_date: e.target.value }))} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Payment Terms</label>
                <input type="text" value={form.payment_terms} onChange={(e) => setForm((f) => ({ ...f, payment_terms: e.target.value }))} placeholder="e.g. 30 days" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Line Items</h3>
              {errors.items && <p className="text-red-500 text-xs">{errors.items}</p>}
            </div>

            <div className="space-y-3">
              {form.items.map((item, index) => (
                <div key={item.id} className="bg-slate-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-slate-400 uppercase">Product Code</label>
                        <input type="text" value={item.product_code} onChange={(e) => updateItem(index, 'product_code', e.target.value)} placeholder="PRD-001" className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#6b5d8a] bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-slate-400 uppercase">Product / Service *</label>
                        <input type="text" value={item.product_name} onChange={(e) => updateItem(index, 'product_name', e.target.value)} placeholder="e.g. Website Design" className={`w-full px-2 py-1.5 border rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#6b5d8a] bg-white ${errors[`item_name_${index}`] ? 'border-red-400' : 'border-slate-300'}`} />
                      </div>
                    </div>
                    <button onClick={() => removeItem(index)} disabled={form.items.length === 1} className="p-1.5 text-slate-400 hover:text-red-500 disabled:opacity-30 rounded mt-4">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-400 uppercase">Description</label>
                    <input type="text" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} placeholder="Optional description" className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#6b5d8a] bg-white" />
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 uppercase">Qty</label>
                      <input type="number" min="0" step="0.01" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#6b5d8a] bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 uppercase">Price</label>
                      <input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-right focus:outline-none focus:ring-1 focus:ring-[#6b5d8a] bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 uppercase">Disc %</label>
                      <input type="number" min="0" max="100" value={item.discount} onChange={(e) => updateItem(index, 'discount', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#6b5d8a] bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 uppercase">Tax %</label>
                      <input type="number" min="0" max="100" value={item.tax_rate} onChange={(e) => updateItem(index, 'tax_rate', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-[#6b5d8a] bg-white" />
                    </div>
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 uppercase">Total</label>
                      <div className="px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-700 text-right">
                        {formatCurrency(item.line_total, form.currency)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={addItem} className="flex items-center gap-2 text-sm text-[#6b5d8a] hover:text-[#3d3551] font-medium">
              <Plus className="w-4 h-4" /> Add Line Item
            </button>

            {/* Calculations */}
            <div className="border-t border-slate-200 pt-3">
              <div className="ml-auto w-full max-w-xs space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span><span>{formatCurrency(subtotal, form.currency)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Discount</span><span>-{formatCurrency(discountAmount, form.currency)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Tax</span><span>{formatCurrency(taxAmount, form.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-1.5 border-t border-slate-200">
                  <span>Grand Total</span><span>{formatCurrency(total, form.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes + Payment Info */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h3 className="font-semibold text-slate-800 text-sm pb-1 border-b border-slate-100">Notes & Payment Information</h3>
            <div>
              <label className={labelClass}>Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2} placeholder="Payment terms, additional notes..." className={`${inputClass} resize-none`} />
            </div>
            <div>
              <label className={labelClass}>Payment Instructions / Banking Details</label>
              <textarea value={form.payment_info} onChange={(e) => setForm((f) => ({ ...f, payment_info: e.target.value }))} rows={2} placeholder="Bank details, payment instructions..." className={`${inputClass} resize-none`} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pb-8">
            <button onClick={() => saveInvoice('draft')} disabled={saving} className="flex-1 sm:flex-none px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-60">
              Save Draft
            </button>
            <button onClick={() => setShowPreviewMobile(true)} disabled={saving} className="flex-1 sm:flex-none px-5 py-2.5 border border-[#d4cce0] text-[#6b5d8a] bg-[#f0ebf5] text-sm font-medium rounded-lg hover:bg-[#e0d5ea] disabled:opacity-60 lg:hidden">
              Preview
            </button>
            <button onClick={() => saveInvoice('sent')} disabled={saving} className="flex-1 px-5 py-2.5 bg-[#3d3551] hover:bg-[#2a2438] text-white text-sm font-medium rounded-lg shadow-sm disabled:opacity-60">
              {saving ? 'Generating...' : 'Generate Invoice'}
            </button>
          </div>
        </div>

        {/* RIGHT: Live Preview */}
        <div className={`${showPreviewMobile ? 'block' : 'hidden'} lg:block lg:sticky lg:top-0 lg:self-start lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto`}>
          <div className="mb-2 hidden lg:block">
            <h3 className="font-semibold text-slate-700 text-sm">Live Preview</h3>
            <p className="text-xs text-slate-400">Updates as you type</p>
          </div>
          <InvoicePreview preview={previewData} company={companyInfo} customer={customerInfo} compact />
        </div>
      </div>
    </div>
  );
}
