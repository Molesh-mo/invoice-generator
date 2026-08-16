import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Customer, Invoice, Settings } from '@/types';
import { supabase } from '@/lib/supabase';
import { DEMO_CUSTOMERS, DEMO_INVOICES } from '@/data/demo';

type View =
  | 'landing'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'onboarding'
  | 'dashboard'
  | 'invoices'
  | 'invoice-detail'
  | 'create-invoice'
  | 'edit-invoice'
  | 'customers'
  | 'customer-detail'
  | 'recurring'
  | 'payments'
  | 'reports'
  | 'settings';

interface AppContextValue {
  isAuthenticated: boolean;
  isOnboarded: boolean;
  currentUser: { name: string; email: string } | null;
  view: View;
  setView: (view: View) => void;
  selectedInvoiceId: string | null;
  setSelectedInvoiceId: (id: string | null) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  invoices: Invoice[];
  customers: Customer[];
  settings: Settings | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  completeOnboarding: (s: Partial<Settings>) => Promise<void>;
  refreshInvoices: () => Promise<void>;
  refreshCustomers: () => Promise<void>;
  refreshSettings: () => Promise<void>;
  nextInvoiceNumber: () => string;
  upsertInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  upsertCustomer: (customer: Customer) => void;
  updateSettings: (s: Settings) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const DEFAULT_SETTINGS: Settings = {
  id: '',
  business_name: 'Lumen Creative Studio',
  business_email: 'hello@lumenstudio.co.za',
  business_phone: '+27 11 234 5678',
  business_address: '1 Main Road, Johannesburg, 2000',
  business_website: 'www.lumenstudio.co.za',
  logo_url: '',
  invoice_prefix: 'INV',
  default_payment_terms: '30 days',
  default_notes: 'Thank you for your business.',
  vat_enabled: true,
  vat_percentage: 15,
  sender_name: 'Lumen Creative Studio',
  sender_email: 'invoices@lumenstudio.co.za',
  street_address: '1 Main Road',
  city: 'Johannesburg',
  province: 'Gauteng',
  country: 'South Africa',
  postal_code: '2000',
  tax_number: 'VAT123456789',
  default_currency: 'ZAR',
  default_tax_rate: 15,
  payment_info: 'Bank: FNB | Account: 6200 1234 5678 | Branch: 250655 | Ref: Invoice Number',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('iv_auth') === 'true');
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem('iv_onboarded') === 'true');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(() => {
    const stored = localStorage.getItem('iv_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [view, setView] = useState<View>(isAuthenticated ? (isOnboarded ? 'dashboard' : 'onboarding') : 'landing');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const seedDemoData = useCallback(async () => {
    const { count } = await supabase.from('customers').select('*', { count: 'exact', head: true });
    if ((count ?? 0) > 0) return;

    const customersToInsert = DEMO_CUSTOMERS.map((c) => ({
      id: c.id, name: c.name, business_name: c.business_name, email: c.email, phone: c.phone,
      address: c.address, street_address: c.street_address, city: c.city, province: c.province,
      country: c.country, postal_code: c.postal_code,
    }));
    await supabase.from('customers').insert(customersToInsert);

    for (const inv of DEMO_INVOICES) {
      const { items, customer, ...invoiceRow } = inv;
      await supabase.from('invoices').insert({ ...invoiceRow, created_at: inv.invoice_date, updated_at: inv.invoice_date });
      if (items && items.length > 0) {
        await supabase.from('invoice_items').insert(items.map((it) => ({ ...it, invoice_id: inv.id, created_at: inv.invoice_date })));
      }
    }
    await supabase.from('settings').insert(DEFAULT_SETTINGS);
  }, []);

  const refreshInvoices = useCallback(async () => {
    const { data, error } = await supabase.from('invoices').select(`*, customer:customers(*), items:invoice_items(*)`).order('invoice_date', { ascending: false });
    if (!error && data) setInvoices(data as Invoice[]);
  }, []);

  const refreshCustomers = useCallback(async () => {
    const { data, error } = await supabase.from('customers').select('*').order('name');
    if (!error && data) setCustomers(data as Customer[]);
  }, []);

  const refreshSettings = useCallback(async () => {
    const { data } = await supabase.from('settings').select('*').maybeSingle();
    setSettings(data ?? DEFAULT_SETTINGS);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isOnboarded || seeded) return;
    (async () => {
      setLoading(true);
      await seedDemoData();
      await Promise.all([refreshInvoices(), refreshCustomers(), refreshSettings()]);
      setSeeded(true);
      setLoading(false);
    })();
  }, [isAuthenticated, isOnboarded, seeded, seedDemoData, refreshInvoices, refreshCustomers, refreshSettings]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    if (!email) return false;
    localStorage.setItem('iv_auth', 'true');
    setIsAuthenticated(true);
    const user = { name: 'Alex Morgan', email };
    setCurrentUser(user);
    localStorage.setItem('iv_user', JSON.stringify(user));
    setView(isOnboarded ? 'dashboard' : 'onboarding');
    return true;
  };

  const signup = async (name: string, email: string, _password: string): Promise<boolean> => {
    if (!email || !name) return false;
    localStorage.setItem('iv_auth', 'true');
    localStorage.setItem('iv_onboarded', 'false');
    setIsAuthenticated(true);
    setIsOnboarded(false);
    const user = { name, email };
    setCurrentUser(user);
    localStorage.setItem('iv_user', JSON.stringify(user));
    setView('onboarding');
    return true;
  };

  const completeOnboarding = async (s: Partial<Settings>) => {
    const payload = { ...DEFAULT_SETTINGS, ...s, updated_at: new Date().toISOString() };
    const { data } = await supabase.from('settings').insert(payload).select().single();
    if (data) setSettings(data as Settings); else setSettings(payload as Settings);
    localStorage.setItem('iv_onboarded', 'true');
    setIsOnboarded(true);
    setView('dashboard');
  };

  const logout = () => {
    localStorage.removeItem('iv_auth');
    localStorage.removeItem('iv_onboarded');
    localStorage.removeItem('iv_user');
    setIsAuthenticated(false);
    setIsOnboarded(false);
    setCurrentUser(null);
    setView('landing');
    setSeeded(false);
    setInvoices([]);
    setCustomers([]);
    setSettings(null);
  };

  const nextInvoiceNumber = (): string => {
    const prefix = settings?.invoice_prefix ?? 'INV';
    const maxNum = invoices.reduce((max, inv) => {
      const num = parseInt(inv.invoice_number.replace(/\D/g, ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 99);
    return `${prefix}-${String(maxNum + 1).padStart(4, '0')}`;
  };

  const upsertInvoice = (invoice: Invoice) => {
    setInvoices((prev) => {
      const idx = prev.findIndex((i) => i.id === invoice.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = invoice; return n; }
      return [invoice, ...prev];
    });
  };

  const deleteInvoice = (id: string) => setInvoices((prev) => prev.filter((i) => i.id !== id));
  const upsertCustomer = (customer: Customer) => {
    setCustomers((prev) => {
      const idx = prev.findIndex((c) => c.id === customer.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = customer; return n; }
      return [...prev, customer];
    });
  };
  const updateSettings = (s: Settings) => setSettings(s);

  return (
    <AppContext.Provider value={{
      isAuthenticated, isOnboarded, currentUser, view, setView,
      selectedInvoiceId, setSelectedInvoiceId, selectedCustomerId, setSelectedCustomerId,
      invoices, customers, settings, loading,
      login, signup, logout, completeOnboarding,
      refreshInvoices, refreshCustomers, refreshSettings,
      nextInvoiceNumber, upsertInvoice, deleteInvoice, upsertCustomer, updateSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
