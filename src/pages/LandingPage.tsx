import { FileText, ArrowRight, Check, TrendingUp, Users, Clock, BarChart3, Mail, Bell, Calendar, ShieldCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const FEATURES = [
  { icon: FileText, title: 'Professional Invoice Creation', desc: 'Build branded invoices with live preview, line items, discounts, and tax in minutes.' },
  { icon: Users, title: 'Customer Management', desc: 'Keep all your client details, billing info, and invoice history in one organized place.' },
  { icon: Clock, title: 'Invoice Tracking', desc: 'Track every invoice from draft to paid with real-time status updates and filters.' },
  { icon: Calendar, title: 'Recurring Invoices', desc: 'Set up weekly, monthly, or yearly recurring billing and never miss a cycle.' },
  { icon: TrendingUp, title: 'Payment Tracking', desc: 'Monitor outstanding payments, overdue invoices, and revenue at a glance.' },
  { icon: Bell, title: 'Automated Reminders', desc: 'Connect Make.com to send automatic payment reminders and follow-ups.' },
  { icon: BarChart3, title: 'Business Dashboard', desc: 'Visualize your cash flow with charts for monthly revenue and payment status.' },
  { icon: ShieldCheck, title: 'Reports & Insights', desc: 'Generate financial reports filtered by date, customer, or status.' },
];

const STEPS = [
  { num: '01', title: 'Create your business profile', desc: 'Add your logo, contact details, and default invoice settings.' },
  { num: '02', title: 'Add your customers', desc: 'Import or manually add clients with their billing information.' },
  { num: '03', title: 'Create an invoice', desc: 'Build a professional invoice with line items, tax, and discounts.' },
  { num: '04', title: 'Send it to your customer', desc: 'Connect Make.com to email invoices automatically.' },
  { num: '05', title: 'Track payment status', desc: 'Monitor paid, unpaid, and overdue invoices from your dashboard.' },
];

const PRICING = [
  { name: 'Starter', price: 'Free', period: '', desc: 'Perfect for freelancers getting started', features: ['Up to 10 invoices / month', 'Customer management', 'Basic dashboard', 'PDF download', '1 user'], cta: 'Get started', highlight: false },
  { name: 'Business', price: 'R199', period: '/month', desc: 'For growing businesses that need more', features: ['Unlimited invoices', 'Recurring invoices', 'Payment tracking', 'Advanced reports', 'Make.com automation', '3 users'], cta: 'Start free trial', highlight: true },
  { name: 'Pro', price: 'R499', period: '/month', desc: 'For established businesses with teams', features: ['Everything in Business', 'Multi-currency', 'Custom branding', 'API access', 'Priority support', 'Unlimited users'], cta: 'Contact sales', highlight: false },
];

export function LandingPage() {
  const { setView } = useApp();

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#faf8f5]/80 backdrop-blur-md border-b border-[#ece6df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-[#3d3551] rounded-lg flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-[#2a2438] text-lg">InvoiceFlow</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            <a href="#features" className="text-sm text-[#6b6275] hover:text-[#2a2438] transition-colors">Features</a>
            <a href="#how" className="text-sm text-[#6b6275] hover:text-[#2a2438] transition-colors">How it works</a>
            <a href="#pricing" className="text-sm text-[#6b6275] hover:text-[#2a2438] transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setView('login')} className="text-sm font-medium text-[#5a5266] hover:text-[#2a2438] transition-colors">Sign in</button>
            <button onClick={() => setView('signup')} className="text-sm font-medium px-4 py-2 bg-[#3d3551] hover:bg-[#2a2438] text-white rounded-lg transition-colors">Get started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#cdd5e0] opacity-30 blur-3xl" />
        <div className="absolute top-1/4 -right-20 w-80 h-80 rounded-full bg-[#d4c5db] opacity-25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-[#c3d2c5] opacity-20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-[#ece6df] rounded-full text-xs font-medium text-[#6b5d8a] mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 bg-[#6b5d8a] rounded-full" />
                Built for South African small businesses
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-[#2a2438] leading-[1.1] tracking-tight mb-5">
                Simple invoicing.<br />
                <span className="text-[#6b5d8a]">Smarter business.</span>
              </h1>
              <p className="text-lg text-[#6b6275] leading-relaxed mb-8 max-w-lg">
                Create professional invoices, track payments, manage customers and stay on top of outstanding payments — all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => setView('signup')} className="group flex items-center justify-center gap-2 px-6 py-3 bg-[#3d3551] hover:bg-[#2a2438] text-white font-semibold rounded-xl transition-all shadow-lg shadow-[#3d3551]/15 hover:shadow-xl hover:-translate-y-0.5">
                  Create your first invoice
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
                <a href="#how" className="flex items-center justify-center gap-2 px-6 py-3 border border-[#d4cce0] text-[#5a5266] font-semibold rounded-xl hover:bg-white transition-colors">
                  See how it works
                </a>
              </div>
              <div className="flex items-center gap-5 mt-8">
                <div className="flex -space-x-2">
                  {['S', 'M', 'N', 'A', 'L'].map((c, i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-[#f0ebf5] border-2 border-[#faf8f5] flex items-center justify-center text-xs font-semibold text-[#6b5d8a]">{c}</div>
                  ))}
                </div>
                <p className="text-sm text-[#8a8295]">Trusted by 2,000+ businesses</p>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="bg-white rounded-2xl shadow-xl shadow-[#3d3551]/8 border border-white p-5 animate-float">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-semibold text-[#9e96ad] uppercase tracking-widest">Total Revenue</p>
                    <p className="text-2xl font-bold text-[#2a2438] mt-0.5">R 84,250</p>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-[#e8f0e9] rounded-full">
                    <TrendingUp className="w-3 h-3 text-[#5a8a5e]" />
                    <span className="text-xs font-semibold text-[#5a8a5e]">+12.5%</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 h-20 mb-4">
                  {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%`, background: i === 5 ? '#6b5d8a' : '#d4cce0' }} />
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { num: 'INV-0100', name: 'Beauty Hub', amount: 'R 12,650', paid: true },
                    { num: 'INV-0101', name: 'ABC Salon', amount: 'R 6,210', paid: false },
                  ].map((row) => (
                    <div key={row.num} className="flex items-center justify-between py-2 px-3 bg-[#faf8f5] rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${row.paid ? 'bg-[#e8f0e9]' : 'bg-[#fdf3e8]'}`}>
                          <Check className={`w-3.5 h-3.5 ${row.paid ? 'text-[#5a8a5e]' : 'text-[#c9a96e]'}`} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#2a2438]">{row.num}</p>
                          <p className="text-[10px] text-[#9e96ad]">{row.name}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#2a2438]">{row.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 bg-[#3d3551] text-white rounded-xl shadow-xl px-4 py-3 animate-float-delayed">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#a99fc0]">Paid Today</p>
                <p className="text-lg font-bold">R 18,425</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 lg:py-24 bg-white border-y border-[#ece6df]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2a2438] mb-3">Everything you need to run your billing</h2>
            <p className="text-[#6b6275] text-lg max-w-2xl mx-auto">A complete invoicing and payment tracking workspace built for small businesses.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="bg-[#faf8f5] rounded-xl border border-[#ece6df] p-5 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-[#f0ebf5] rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-[#6b5d8a]" />
                  </div>
                  <h3 className="font-semibold text-[#2a2438] text-sm mb-1.5">{f.title}</h3>
                  <p className="text-sm text-[#8a8295] leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-16 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2a2438] mb-3">How it works</h2>
            <p className="text-[#6b6275] text-lg">Get from signup to your first sent invoice in under five minutes.</p>
          </div>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div key={s.num} className="flex items-start gap-5 bg-white rounded-xl border border-[#ece6df] p-5 hover:shadow-sm transition-shadow">
                <div className="w-12 h-12 bg-[#3d3551] rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{s.num}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2a2438] mb-1">{s.title}</h3>
                  <p className="text-sm text-[#8a8295]">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-16 bg-white border-y border-[#ece6df]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-14 h-14 bg-[#e8f0e9] rounded-2xl flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="w-7 h-7 text-[#5a8a5e]" />
          </div>
          <h2 className="text-2xl font-bold text-[#2a2438] mb-3">Built to save you time</h2>
          <p className="text-[#6b6275] text-lg leading-relaxed max-w-2xl mx-auto">
            InvoiceFlow helps small businesses reduce manual invoice administration, stay organised, and get paid faster.
            No more chasing spreadsheets or lost email threads — everything lives in one clean workspace.
          </p>
          <div className="grid grid-cols-3 gap-6 mt-10 max-w-lg mx-auto">
            <div><p className="text-2xl font-bold text-[#2a2438]">2,000+</p><p className="text-xs text-[#9e96ad] mt-0.5">Businesses</p></div>
            <div><p className="text-2xl font-bold text-[#2a2438]">R 14M+</p><p className="text-xs text-[#9e96ad] mt-0.5">Invoiced</p></div>
            <div><p className="text-2xl font-bold text-[#2a2438]">48hrs</p><p className="text-xs text-[#9e96ad] mt-0.5">Avg. payment</p></div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#2a2438] mb-3">Simple, transparent pricing</h2>
            <p className="text-[#6b6275] text-lg">Start free. Upgrade when you need more.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PRICING.map((p) => (
              <div key={p.name} className={`bg-white rounded-2xl border p-6 ${p.highlight ? 'border-[#6b5d8a] shadow-lg shadow-[#6b5d8a]/10 ring-1 ring-[#6b5d8a]/20' : 'border-[#ece6df] shadow-sm'}`}>
                {p.highlight && (
                  <div className="inline-block px-2.5 py-1 bg-[#6b5d8a] text-white text-xs font-semibold rounded-full mb-4">Most popular</div>
                )}
                <h3 className="font-bold text-[#2a2438] text-lg mb-1">{p.name}</h3>
                <p className="text-sm text-[#8a8295] mb-4">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-bold text-[#2a2438]">{p.price}</span>
                  <span className="text-sm text-[#9e96ad]">{p.period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#6b6275]">
                      <Check className="w-4 h-4 text-[#5a8a5e] shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setView('signup')} className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${p.highlight ? 'bg-[#3d3551] hover:bg-[#2a2438] text-white' : 'border border-[#d4cce0] text-[#5a5266] hover:bg-[#faf8f5]'}`}>
                  {p.cta}
                </button>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-[#b8b0c4] mt-6">Pricing shown in ZAR. Plans can be adjusted at any time.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#3d3551]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Ready to invoice smarter?</h2>
          <p className="text-[#a99fc0] text-lg mb-7">Create your free account and send your first invoice today.</p>
          <button onClick={() => setView('signup')} className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-[#faf8f5] text-[#3d3551] font-semibold rounded-xl transition-all shadow-lg hover:-translate-y-0.5">
            Get started free
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-[#2a2438]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">InvoiceFlow</span>
          </div>
          <p className="text-xs text-[#a99fc0]">Built for small businesses. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
