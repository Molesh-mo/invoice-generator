import { useState } from 'react';
import { FileText, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, TrendingUp, CheckCircle2, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';

type Mode = 'login' | 'signup' | 'forgot';

export function AuthPage({ mode: initialMode }: { mode: Mode }) {
  const { login, signup, setView } = useApp();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(mode === 'login' ? 'demo@mybusiness.co.za' : '');
  const [password, setPassword] = useState(mode === 'login' ? 'demo1234' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [forgotSent, setForgotSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || (!forgotSent && mode !== 'forgot' && !password)) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');

    if (mode === 'login') {
      const ok = await login(email, password);
      if (!ok) { setError('Invalid credentials.'); setLoading(false); }
    } else if (mode === 'signup') {
      if (!name.trim()) { setError('Please enter your name.'); setLoading(false); return; }
      const ok = await signup(name, email, password);
      if (!ok) { setError('Could not create account.'); setLoading(false); }
    } else if (mode === 'forgot') {
      setForgotSent(true);
      setLoading(false);
    }
  };

  const titles: Record<Mode, { title: string; sub: string }> = {
    login: { title: 'Welcome back', sub: 'Sign in to manage your invoices.' },
    signup: { title: 'Create your account', sub: 'Start invoicing in minutes.' },
    forgot: { title: 'Reset your password', sub: 'Enter your email and we\u2019ll send a reset link.' },
  };

  return (
    <div className="min-h-screen flex bg-[#faf8f5]">
      {/* LEFT — Brand visual */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#f5f0ea]">
        <div className="absolute -top-24 -left-16 w-96 h-96 rounded-full bg-[#cdd5e0] opacity-50 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/3 -right-20 w-80 h-80 rounded-full bg-[#d4c5db] opacity-40 blur-3xl animate-pulse-slower" />
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-[#c3d2c5] opacity-30 blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/3 w-40 h-40 rounded-full bg-[#e8d5d0] opacity-25 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #1e1b2e 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-20 max-w-2xl">
          <button onClick={() => setView('landing')} className="flex items-center gap-3 mb-12 group">
            <div className="w-11 h-11 bg-[#3d3551] rounded-xl flex items-center justify-center shadow-lg shadow-[#3d3551]/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-[#2a2438] text-xl tracking-tight group-hover:text-[#6b5d8a] transition-colors">InvoiceFlow</span>
          </button>

          <h1 className="text-4xl xl:text-5xl font-bold text-[#2a2438] leading-[1.15] tracking-tight mb-5">
            Invoice smarter.<br />
            <span className="text-[#6b5d8a]">Run your business better.</span>
          </h1>
          <p className="text-[#6b6275] text-lg leading-relaxed mb-10 max-w-md">
            Create, manage and track your invoices from one simple workspace.
          </p>

          <div className="relative max-w-md">
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
                        <CheckCircle2 className={`w-3.5 h-3.5 ${row.paid ? 'text-[#5a8a5e]' : 'text-[#c9a96e]'}`} />
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

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        <div className="lg:hidden absolute top-0 left-0 w-72 h-72 rounded-full bg-[#d4c5db] opacity-20 blur-3xl" />
        <div className="lg:hidden absolute bottom-0 right-0 w-64 h-64 rounded-full bg-[#cdd5e0] opacity-20 blur-3xl" />

        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <button onClick={() => setView('landing')} className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3d3551] rounded-xl flex items-center justify-center shadow-lg shadow-[#3d3551]/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-[#2a2438] text-lg">InvoiceFlow</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-[#3d3551]/8 border border-[#f0ebe5] p-7 sm:p-9">
            <div className="hidden lg:flex items-center gap-2.5 mb-7">
              <button onClick={() => setView('landing')} className="flex items-center gap-2.5 group">
                <div className="w-9 h-9 bg-[#3d3551] rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-[#2a2438] text-sm group-hover:text-[#6b5d8a] transition-colors">InvoiceFlow</span>
              </button>
            </div>

            <h2 className="text-2xl font-bold text-[#2a2438] mb-1.5 tracking-tight">{titles[mode].title}</h2>
            <p className="text-[#8a8295] text-sm mb-7">{titles[mode].sub}</p>

            {forgotSent && (
              <div className="mb-4 p-3 bg-[#e8f0e9] border border-[#c3d2c5] rounded-lg text-[#3a6b3e] text-sm animate-fade-in">
                If an account exists for that email, a reset link has been sent.
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-[#fdf0f0] border border-[#f0d5d5] rounded-lg text-[#c44] text-sm animate-fade-in">
                {error}
              </div>
            )}

            {!forgotSent && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#5a5266] mb-1.5 uppercase tracking-wide">Full name</label>
                    <div className="relative">
                      <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === 'name' ? 'text-[#6b5d8a]' : 'text-[#c4bedb]'}`} />
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Alex Morgan"
                        className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all duration-200 outline-none ${focused === 'name' ? 'border-[#6b5d8a] ring-2 ring-[#6b5d8a]/15 bg-white' : 'border-[#e8e3dd] bg-[#faf8f5] hover:border-[#d4cce0]'}`} />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#5a5266] mb-1.5 uppercase tracking-wide">Email address</label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === 'email' ? 'text-[#6b5d8a]' : 'text-[#c4bedb]'}`} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocused('email')} onBlur={() => setFocused(null)} placeholder="you@business.co.za"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm transition-all duration-200 outline-none ${focused === 'email' ? 'border-[#6b5d8a] ring-2 ring-[#6b5d8a]/15 bg-white' : 'border-[#e8e3dd] bg-[#faf8f5] hover:border-[#d4cce0]'}`} />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div>
                    <label className="block text-xs font-semibold text-[#5a5266] mb-1.5 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${focused === 'password' ? 'text-[#6b5d8a]' : 'text-[#c4bedb]'}`} />
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocused('password')} onBlur={() => setFocused(null)} placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-3 border rounded-xl text-sm transition-all duration-200 outline-none ${focused === 'password' ? 'border-[#6b5d8a] ring-2 ring-[#6b5d8a]/15 bg-white' : 'border-[#e8e3dd] bg-[#faf8f5] hover:border-[#d4cce0]'}`} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#c4bedb] hover:text-[#6b5d8a] transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'login' && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 text-sm text-[#6b6275] cursor-pointer select-none">
                      <input type="checkbox" className="w-4 h-4 rounded border-[#d4cce0] text-[#6b5d8a] focus:ring-[#6b5d8a]/30 focus:ring-offset-0" />
                      Remember me
                    </label>
                    <button type="button" onClick={() => { setMode('forgot'); setForgotSent(false); setError(''); }} className="text-sm text-[#6b5d8a] hover:text-[#3d3551] font-medium transition-colors">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="group w-full py-3 px-4 bg-[#3d3551] hover:bg-[#2a2438] disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 text-sm mt-2 shadow-lg shadow-[#3d3551]/20 hover:shadow-xl hover:shadow-[#3d3551]/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                  {loading ? (
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{mode === 'login' ? 'Signing in...' : 'Creating account...'}</>
                  ) : (
                    <>{mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send reset link'}<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
                  )}
                </button>
              </form>
            )}

            {forgotSent && (
              <button onClick={() => { setMode('login'); setForgotSent(false); }} className="flex items-center gap-2 text-sm text-[#6b5d8a] hover:text-[#3d3551] font-medium mt-4">
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>
            )}

            <div className="mt-7 pt-6 border-t border-[#f0ebe5] text-center">
              {mode === 'login' && (
                <p className="text-sm text-[#8a8295]">Don't have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError(''); }} className="text-[#6b5d8a] hover:text-[#3d3551] font-semibold transition-colors">Create account</button>
                </p>
              )}
              {mode === 'signup' && (
                <p className="text-sm text-[#8a8295]">Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} className="text-[#6b5d8a] hover:text-[#3d3551] font-semibold transition-colors">Sign in</button>
                </p>
              )}
              {mode === 'forgot' && !forgotSent && (
                <p className="text-sm text-[#8a8295]">Remembered it?{' '}
                  <button onClick={() => { setMode('login'); setError(''); }} className="text-[#6b5d8a] hover:text-[#3d3551] font-semibold transition-colors">Sign in</button>
                </p>
              )}
            </div>
          </div>

          {mode === 'login' && (
            <p className="text-center text-xs text-[#b8b0c4] mt-5">Demo credentials pre-filled — just click Sign In.</p>
          )}
        </div>
      </div>
    </div>
  );
}
