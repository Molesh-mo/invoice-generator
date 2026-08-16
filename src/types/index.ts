export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'unpaid' | 'overdue' | 'cancelled';

export interface Customer {
  id: string;
  name: string;
  business_name: string;
  email: string;
  phone: string;
  address: string;
  street_address: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  product_code: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  line_total: number;
  sort_order: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  payment_terms: string;
  subtotal: number;
  discount_amount: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  status: InvoiceStatus;
  notes: string;
  payment_info: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  items?: InvoiceItem[];
}

export interface Settings {
  id: string;
  business_name: string;
  business_email: string;
  business_phone: string;
  business_address: string;
  business_website: string;
  logo_url: string;
  invoice_prefix: string;
  default_payment_terms: string;
  default_notes: string;
  vat_enabled: boolean;
  vat_percentage: number;
  sender_name: string;
  sender_email: string;
  street_address: string;
  city: string;
  province: string;
  country: string;
  postal_code: string;
  tax_number: string;
  default_currency: string;
  default_tax_rate: number;
  payment_info: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceFormItem {
  id: string;
  product_code: string;
  product_name: string;
  description: string;
  quantity: number;
  unit_price: number;
  discount: number;
  tax_rate: number;
  line_total: number;
}

export interface InvoiceFormData {
  customer_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  business_name: string;
  billing_street: string;
  billing_city: string;
  billing_province: string;
  billing_country: string;
  billing_postal: string;
  invoice_date: string;
  due_date: string;
  currency: string;
  payment_terms: string;
  notes: string;
  payment_info: string;
  items: InvoiceFormItem[];
}

export interface MakeWebhookPayload {
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    business_name: string;
    address: string;
  };
  company: {
    name: string;
    email: string;
    phone: string;
    address: string;
    website: string;
  };
  items: {
    product_code: string;
    description: string;
    quantity: number;
    unit_price: number;
    discount: number;
    tax_rate: number;
    line_total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  payment_status: string;
  notes: string;
}
