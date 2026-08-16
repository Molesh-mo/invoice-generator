import { useState, useEffect } from 'react';
import { Save, CheckCircle } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import type { Settings as SettingsType } from '@/types';

export function Settings() {
  const { settings, updateSettings } = useApp();
  const [form, setForm] = useState<Partial<SettingsType>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  const set = (key: keyof SettingsType, value: unknown) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, updated_at: new Date().toISOString() };
    if (form.id) {
      await supabase.from('settings').update(payload).eq('id', form.id);
    } else {
      const { data } = await supabase.from('settings').insert(payload).select().single();
      if (data) payload.id = data.id;
    }
    updateSettings(payload as SettingsType);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputClass = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1.5';

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage your business and invoice settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] disabled:opacity-60 text-white text-sm font-medium rounded-lg shadow-sm"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 text-base pb-1 border-b border-slate-100">Business Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Business Name</label>
            <input type="text" value={form.business_name ?? ''} onChange={(e) => set('business_name', e.target.value)} className={inputClass} placeholder="Your Business Name" />
          </div>
          <div>
            <label className={labelClass}>Business Email</label>
            <input type="email" value={form.business_email ?? ''} onChange={(e) => set('business_email', e.target.value)} className={inputClass} placeholder="hello@yourbusiness.co.za" />
          </div>
          <div>
            <label className={labelClass}>Phone Number</label>
            <input type="tel" value={form.business_phone ?? ''} onChange={(e) => set('business_phone', e.target.value)} className={inputClass} placeholder="+27 11 000 0000" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Business Address</label>
            <textarea value={form.business_address ?? ''} onChange={(e) => set('business_address', e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Street, City, Province, Postal Code" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Website</label>
            <input type="text" value={form.business_website ?? ''} onChange={(e) => set('business_website', e.target.value)} className={inputClass} placeholder="www.yourbusiness.co.za" />
          </div>
        </div>
      </div>

      {/* Invoice Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:p-6 space-y-4">
        <h3 className="font-semibold text-slate-800 text-base pb-1 border-b border-slate-100">Invoice Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Invoice Prefix</label>
            <input type="text" value={form.invoice_prefix ?? ''} onChange={(e) => set('invoice_prefix', e.target.value)} className={inputClass} placeholder="INV" />
            <p className="text-xs text-slate-400 mt-1">Example: INV-0001</p>
          </div>
          <div>
            <label className={labelClass}>Default Payment Terms</label>
            <input type="text" value={form.default_payment_terms ?? ''} onChange={(e) => set('default_payment_terms', e.target.value)} className={inputClass} placeholder="30 days" />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Default Notes</label>
            <textarea value={form.default_notes ?? ''} onChange={(e) => set('default_notes', e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Thank you for your business." />
          </div>
        </div>

        {/* VAT Settings */}
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <h4 className="font-medium text-slate-700 text-sm">VAT / Tax</h4>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.vat_enabled ?? false}
              onChange={(e) => set('vat_enabled', e.target.checked)}
              className="rounded border-slate-300 text-[#6b5d8a] focus:ring-[#6b5d8a]/30 w-4 h-4"
            />
            <span className="text-sm text-slate-700">Enable VAT/Tax on invoices by default</span>
          </label>
          {form.vat_enabled && (
            <div className="flex items-center gap-3">
              <label className={`${labelClass} mb-0 shrink-0`}>Default VAT %</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={form.vat_percentage ?? 15}
                  onChange={(e) => set('vat_percentage', parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                />
                <span className="text-sm text-slate-500">%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 lg:p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-800 text-base pb-1 border-b border-slate-100">Email Settings</h3>
          <p className="text-xs text-slate-400 mt-2">These settings will be used when sending invoices via Make.com automation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Sender Name</label>
            <input type="text" value={form.sender_name ?? ''} onChange={(e) => set('sender_name', e.target.value)} className={inputClass} placeholder="Your Name or Business" />
          </div>
          <div>
            <label className={labelClass}>Sender Email</label>
            <input type="email" value={form.sender_email ?? ''} onChange={(e) => set('sender_email', e.target.value)} className={inputClass} placeholder="invoices@yourbusiness.co.za" />
          </div>
        </div>
      </div>

      {/* Make.com note */}
      <div className="bg-[#f0ebf5] border border-[#e0d5ea] rounded-xl p-4">
        <p className="text-sm font-semibold text-[#3d3551] mb-1">Make.com Integration</p>
        <p className="text-sm text-[#6b6275]">
          When you're ready to connect Make.com, add your webhook URL as the{' '}
          <code className="bg-[#e0d5ea] px-1 py-0.5 rounded text-xs font-mono">VITE_MAKE_WEBHOOK_URL</code>{' '}
          environment variable. The app will automatically send invoice data to your Make.com scenario when generating invoices.
        </p>
      </div>

      <div className="pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-2.5 bg-[#3d3551] hover:bg-[#2a2438] disabled:opacity-60 text-white text-sm font-medium rounded-lg shadow-sm flex items-center justify-center gap-2"
        >
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Changes Saved!' : saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
