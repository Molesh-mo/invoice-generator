import { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Users,
  PlusCircle,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  RefreshCw,
  CreditCard,
  BarChart3,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

type NavItem = {
  label: string;
  icon: React.ElementType;
  view: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' },
  { label: 'Invoices', icon: FileText, view: 'invoices' },
  { label: 'Customers', icon: Users, view: 'customers' },
  { label: 'Recurring', icon: RefreshCw, view: 'recurring' },
  { label: 'Payments', icon: CreditCard, view: 'payments' },
  { label: 'Reports', icon: BarChart3, view: 'reports' },
  { label: 'Settings', icon: Settings, view: 'settings' },
];

const VIEW_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  invoices: 'Invoices',
  'invoice-detail': 'Invoice Details',
  'create-invoice': 'Create Invoice',
  'edit-invoice': 'Edit Invoice',
  customers: 'Customers',
  'customer-detail': 'Customer Details',
  recurring: 'Recurring Invoices',
  payments: 'Payments',
  reports: 'Reports',
  settings: 'Settings',
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { view, setView, currentUser, logout } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = (v: string) => {
    setView(v as Parameters<typeof setView>[0]);
    setMobileOpen(false);
  };

  const initials = currentUser?.name.split(' ').map((n) => n[0]).join('').toUpperCase() ?? 'U';

  const isActive = (itemView: string) => {
    if (view === itemView) return true;
    if (itemView === 'invoices' && (view === 'invoice-detail' || view === 'create-invoice' || view === 'edit-invoice')) return true;
    if (itemView === 'customers' && view === 'customer-detail') return true;
    return false;
  };

  const sidebarContent = (isMobile: boolean) => (
    <>
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.view);
          return (
            <button
              key={item.view}
              onClick={() => navigate(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#f0ebf5] text-[#3d3551]'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#6b5d8a]' : ''}`} />
              {item.label}
              {isMobile && <ChevronRight className="ml-auto w-4 h-4 text-slate-400" />}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#f0ebf5] text-[#3d3551] font-semibold text-sm flex items-center justify-center shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">{currentUser?.name}</p>
            <p className="text-xs text-slate-500 truncate">{currentUser?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 bg-[#3d3551] rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg">InvoiceFlow</span>
        </div>
        {sidebarContent(false)}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#3d3551] rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-slate-900">InvoiceFlow</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent(true)}
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 py-3 flex items-center gap-4 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-slate-800 text-sm lg:text-base truncate">
              {VIEW_TITLES[view] ?? 'InvoiceFlow'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('create-invoice')}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#3d3551] hover:bg-[#2a2438] text-white text-sm font-medium rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              New Invoice
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-400 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-[#f0ebf5] text-[#3d3551] font-semibold text-xs flex items-center justify-center cursor-pointer">
              {initials}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
