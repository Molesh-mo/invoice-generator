import { useState } from 'react';
import { FileText, Upload, ArrowRight, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import type { Settings } from '@/types';

export function OnboardingPage() {
  const { completeOnboarding, currentUser } = useApp();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    business_name: '',
    business_email: currentUser?.email ?? '',
    business_phone: '',
    business_website: '',
    street_address: '',
    city: '',
    province: '',
    country: 'South Africa',
    postal_code: '',
    tax_number: '',
    default_currency: 'ZAR',
    default_payment_terms: '30 days',
    default_tax_rate: 15,
    logo_url: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const handleLogoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => set('logo_url', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleFinish = async () => {
    if (!form.business_name.trim()) return;
    setSaving(true);
    const settings: Partial<Settings> = {
      ...form,
      business_address: [form.street_address, form.city, form.province, form.postal_code].filter(Boolean).join(', '),
      sender_name: form.business_name,
      sender_email: form.business_email,
      vat_enabled: form.default_tax_rate > 0,
      vat_percentage: form.default_tax_rate,
      default_notes: 'Thank you for your business.',
      invoice_prefix: 'INV',
      payment_info: '',
    };
    await completeOnboarding(settings);
    setSaving(false);
  };

  const inputClass = 'w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#6b5d8a]';
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1';

  return (
    <div className="min-h-screen bg-[#faf8f5] flex flex-col">
      {/* Header */}
      <div className="border-b border-[#ece6df] bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3d3551] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-[#2a2438]">InvoiceFlow</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl animate-fade-in-up">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-[#3d3551] text-white' : 'bg-white border border-[#ece6df] text-[#b8b0c4]'}`}>
                  {step > s ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 3 && <div className={`w-12 h-0.5 rounded-full transition-colors ${step > s ? 'bg-[#3d3551]' : 'bg-[#ece6df]'}`} />}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-[#3d3551]/8 border border-[#f0ebe5] p-7 sm:p-9">
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-[#2a2438] mb-1.5 tracking-tight">Let's set up your business</h2>
                <p className="text-[#8a8295] text-sm mb-7">Tell us about your company. These details appear on every invoice.</p>
                <div className="space-y-4">
                  {/* Logo */}
                  <div className="flex items-center gap-4">
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="Logo" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                    ) : (
                      <label className="w-16 h-16 rounded-lg border-2 border-dashed border-[#d4cce0] flex items-center justify-center cursor-pointer hover:border-[#6b5d8a] hover:bg-[#faf8f5] transition-colors">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])} />
                        <Upload className="w-5 h-5 text-[#c4bedb]" />
                      </label>
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#5a5266]">Company Logo</p>
                      <p className="text-xs text-[#b8b0c4]">Click to upload</p>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Business Name *</label>
                    <input type="text" value={form.business_name} onChange={(e) => set('business_name', e.target.value)} placeholder="Your Business Name" className={inputClass} autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Business Email</label>
                      <input type="email" value={form.business_email} onChange={(e) => set('business_email', e.target.value)} placeholder="hello@business.co.za" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Phone</label>
                      <input type="tel" value={form.business_phone} onChange={(e) => set('business_phone', e.target.value)} placeholder="+27 11 000 0000" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Website</label>
                    <input type="text" value={form.business_website} onChange={(e) => set('business_website', e.target.value)} placeholder="www.business.co.za" className={inputClass} />
                  </div>
                </div>
                <button onClick={() => setStep(2)} disabled={!form.business_name.trim()} className="group w-full mt-6 py-3 bg-[#3d3551] hover:bg-[#2a2438] disabled:opacity-50 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                  Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-[#2a2438] mb-1.5 tracking-tight">Business address</h2>
                <p className="text-[#8a8295] text-sm mb-7">Where is your business located?</p>
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>Street Address</label>
                    <input type="text" value={form.street_address} onChange={(e) => set('street_address', e.target.value)} placeholder="Street address" className={inputClass} autoFocus />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>City</label>
                      <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} placeholder="City" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Province / State</label>
                      <input type="text" value={form.province} onChange={(e) => set('province', e.target.value)} placeholder="Province" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Country</label>
                      <input type="text" value={form.country} onChange={(e) => set('country', e.target.value)} placeholder="Country" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Postal Code</label>
                      <input type="text" value={form.postal_code} onChange={(e) => set('postal_code', e.target.value)} placeholder="Postal code" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Tax / VAT Number</label>
                    <input type="text" value={form.tax_number} onChange={(e) => set('tax_number', e.target.value)} placeholder="VAT123456789" className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(1)} className="px-5 py-3 border border-[#d4cce0] text-[#5a5266] text-sm font-medium rounded-xl hover:bg-[#faf8f5] transition-colors">Back</button>
                  <button onClick={() => setStep(3)} className="group flex-1 py-3 bg-[#3d3551] hover:bg-[#2a2438] text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                    Continue <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-[#2a2438] mb-1.5 tracking-tight">Invoice defaults</h2>
                <p className="text-[#8a8295] text-sm mb-7">Set your default invoice preferences. You can change these later.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Default Currency</label>
                      <select value={form.default_currency} onChange={(e) => set('default_currency', e.target.value)} className={inputClass}>
                        <option value="ZAR">ZAR (R)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Default Tax Rate (%)</label>
                      <input type="number" min="0" max="100" value={form.default_tax_rate} onChange={(e) => set('default_tax_rate', parseFloat(e.target.value) || 0)} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Default Payment Terms</label>
                    <input type="text" value={form.default_payment_terms} onChange={(e) => set('default_payment_terms', e.target.value)} placeholder="30 days" className={inputClass} />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setStep(2)} className="px-5 py-3 border border-[#d4cce0] text-[#5a5266] text-sm font-medium rounded-xl hover:bg-[#faf8f5] transition-colors">Back</button>
                  <button onClick={handleFinish} disabled={saving} className="group flex-1 py-3 bg-[#3d3551] hover:bg-[#2a2438] disabled:opacity-60 text-white font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                    {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Setting up...</> : <>Start invoicing <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
