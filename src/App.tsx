import { AppProvider, useApp } from '@/context/AppContext';
import { Layout } from '@/components/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { Dashboard } from '@/pages/Dashboard';
import { Invoices } from '@/pages/Invoices';
import { InvoiceDetail } from '@/pages/InvoiceDetail';
import { CreateInvoice } from '@/pages/CreateInvoice';
import { Customers } from '@/pages/Customers';
import { Recurring } from '@/pages/Recurring';
import { Payments } from '@/pages/Payments';
import { Reports } from '@/pages/Reports';
import { Settings } from '@/pages/Settings';

function AppContent() {
  const { isAuthenticated, isOnboarded, view, invoices, selectedInvoiceId, loading } = useApp();

  if (!isAuthenticated) {
    if (view === 'login') return <AuthPage mode="login" />;
    if (view === 'signup') return <AuthPage mode="signup" />;
    return <LandingPage />;
  }

  if (!isOnboarded) return <OnboardingPage />;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#3d3551] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const editInvoice = view === 'edit-invoice'
    ? invoices.find((i) => i.id === selectedInvoiceId) ?? null
    : null;

  return (
    <Layout>
      {view === 'dashboard' && <Dashboard />}
      {view === 'invoices' && <Invoices />}
      {view === 'invoice-detail' && <InvoiceDetail />}
      {(view === 'create-invoice' || view === 'edit-invoice') && (
        <CreateInvoice editInvoice={editInvoice} />
      )}
      {view === 'customers' && <Customers />}
      {view === 'customer-detail' && <Customers />}
      {view === 'recurring' && <Recurring />}
      {view === 'payments' && <Payments />}
      {view === 'reports' && <Reports />}
      {view === 'settings' && <Settings />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
