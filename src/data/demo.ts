import type { Customer, Invoice, InvoiceItem } from '@/types';

export const DEMO_CUSTOMERS: Omit<Customer, 'created_at' | 'updated_at'>[] = [
  {
    id: 'demo-cust-1',
    name: 'Sarah Johnson',
    business_name: 'Beauty Hub',
    email: 'sarah@beautyhub.co.za',
    phone: '+27 83 456 7890',
    address: '14 Rosebank Mall, Rosebank, Johannesburg, 2196',
    street_address: '14 Rosebank Mall',
    city: 'Rosebank',
    province: 'Gauteng',
    country: 'South Africa',
    postal_code: '2196',
  },
  {
    id: 'demo-cust-2',
    name: 'Mike Pretorius',
    business_name: 'ABC Salon',
    email: 'mike@abcsalon.co.za',
    phone: '+27 71 234 5678',
    address: '7 Long Street, Cape Town, 8001',
    street_address: '7 Long Street',
    city: 'Cape Town',
    province: 'Western Cape',
    country: 'South Africa',
    postal_code: '8001',
  },
  {
    id: 'demo-cust-3',
    name: 'Nomvula Dlamini',
    business_name: 'Glow Beauty',
    email: 'nomvula@glowbeauty.co.za',
    phone: '+27 82 345 6789',
    address: '23 Florida Road, Morningside, Durban, 4001',
    street_address: '23 Florida Road',
    city: 'Morningside',
    province: 'KwaZulu-Natal',
    country: 'South Africa',
    postal_code: '4001',
  },
  {
    id: 'demo-cust-4',
    name: 'James van der Berg',
    business_name: 'Prestige Hair Studio',
    email: 'james@prestigehair.co.za',
    phone: '+27 79 876 5432',
    address: '88 Menlyn Park Drive, Pretoria, 0181',
    street_address: '88 Menlyn Park Drive',
    city: 'Pretoria',
    province: 'Gauteng',
    country: 'South Africa',
    postal_code: '0181',
  },
  {
    id: 'demo-cust-5',
    name: 'Ayanda Nkosi',
    business_name: 'Elite Spa & Wellness',
    email: 'ayanda@elitespa.co.za',
    phone: '+27 84 567 8901',
    address: '5 Sandton Drive, Sandton, Johannesburg, 2196',
    street_address: '5 Sandton Drive',
    city: 'Sandton',
    province: 'Gauteng',
    country: 'South Africa',
    postal_code: '2196',
  },
  {
    id: 'demo-cust-6',
    name: 'Lerato Mokoena',
    business_name: 'Urban Cuts Barbershop',
    email: 'lerato@urbancuts.co.za',
    phone: '+27 76 111 2222',
    address: '42 Bree Street, Cape Town, 8001',
    street_address: '42 Bree Street',
    city: 'Cape Town',
    province: 'Western Cape',
    country: 'South Africa',
    postal_code: '8001',
  },
];

const fmtDate = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => fmtDate(new Date(Date.now() - n * 86400000));
const daysAhead = (n: number) => fmtDate(new Date(Date.now() + n * 86400000));
const monthsAgo = (m: number, day = 15) => {
  const d = new Date();
  d.setMonth(d.getMonth() - m);
  d.setDate(day);
  return fmtDate(d);
};

type ItemSeed = Omit<InvoiceItem, 'invoice_id' | 'created_at'>;

export const DEMO_INVOICE_ITEMS: Record<string, ItemSeed[]> = {
  'demo-inv-1': [
    { id: 'ii-1-1', product_code: 'PRD-001', product_name: 'Website Design', description: 'Full responsive website design', quantity: 1, unit_price: 8500, discount: 0, tax_rate: 15, line_total: 9775, sort_order: 0 },
    { id: 'ii-1-2', product_code: 'PRD-002', product_name: 'SEO Setup', description: 'Basic on-page SEO optimisation', quantity: 1, unit_price: 2500, discount: 0, tax_rate: 15, line_total: 2875, sort_order: 1 },
  ],
  'demo-inv-2': [
    { id: 'ii-2-1', product_code: 'PRD-003', product_name: 'Social Media Management', description: 'Monthly social media package', quantity: 3, unit_price: 1800, discount: 0, tax_rate: 15, line_total: 6210, sort_order: 0 },
  ],
  'demo-inv-3': [
    { id: 'ii-3-1', product_code: 'PRD-004', product_name: 'Logo Design', description: 'Brand identity & logo package', quantity: 1, unit_price: 3200, discount: 10, tax_rate: 15, line_total: 3888, sort_order: 0 },
    { id: 'ii-3-2', product_code: 'PRD-005', product_name: 'Business Cards', description: 'Design & print 500 cards', quantity: 1, unit_price: 800, discount: 0, tax_rate: 15, line_total: 920, sort_order: 1 },
  ],
  'demo-inv-4': [
    { id: 'ii-4-1', product_code: 'PRD-006', product_name: 'Photography Session', description: 'Product photography (3 hours)', quantity: 3, unit_price: 950, discount: 0, tax_rate: 0, line_total: 2850, sort_order: 0 },
  ],
  'demo-inv-5': [
    { id: 'ii-5-1', product_code: 'PRD-007', product_name: 'Email Marketing', description: 'Email campaign design & setup', quantity: 2, unit_price: 1200, discount: 0, tax_rate: 15, line_total: 2760, sort_order: 0 },
    { id: 'ii-5-2', product_code: 'PRD-008', product_name: 'Copywriting', description: 'Marketing copy (5 pages)', quantity: 5, unit_price: 400, discount: 5, tax_rate: 15, line_total: 2261, sort_order: 1 },
  ],
  'demo-inv-6': [
    { id: 'ii-6-1', product_code: 'PRD-009', product_name: 'POS System Setup', description: 'Point of sale installation & training', quantity: 1, unit_price: 5500, discount: 0, tax_rate: 15, line_total: 6325, sort_order: 0 },
  ],
  'demo-inv-7': [
    { id: 'ii-7-1', product_code: 'PRD-010', product_name: 'Monthly Retainer', description: 'Digital marketing retainer', quantity: 1, unit_price: 4500, discount: 0, tax_rate: 15, line_total: 5175, sort_order: 0 },
  ],
  'demo-inv-8': [
    { id: 'ii-8-1', product_code: 'PRD-011', product_name: 'Promotional Flyers', description: 'Design & print 1000 A5 flyers', quantity: 1, unit_price: 1800, discount: 0, tax_rate: 15, line_total: 2070, sort_order: 0 },
    { id: 'ii-8-2', product_code: 'PRD-012', product_name: 'Poster Design', description: 'A1 promotional poster', quantity: 2, unit_price: 600, discount: 0, tax_rate: 15, line_total: 1380, sort_order: 1 },
  ],
  'demo-inv-9': [
    { id: 'ii-9-1', product_code: 'PRD-001', product_name: 'Website Design', description: 'E-commerce website redesign', quantity: 1, unit_price: 12000, discount: 5, tax_rate: 15, line_total: 13110, sort_order: 0 },
  ],
  'demo-inv-10': [
    { id: 'ii-10-1', product_code: 'PRD-010', product_name: 'Monthly Retainer', description: 'Digital marketing retainer', quantity: 1, unit_price: 4500, discount: 0, tax_rate: 15, line_total: 5175, sort_order: 0 },
  ],
  'demo-inv-11': [
    { id: 'ii-11-1', product_code: 'PRD-013', product_name: 'Brand Strategy', description: 'Full brand strategy workshop', quantity: 1, unit_price: 8000, discount: 0, tax_rate: 15, line_total: 9200, sort_order: 0 },
  ],
  'demo-inv-12': [
    { id: 'ii-12-1', product_code: 'PRD-014', product_name: 'Content Creation', description: 'Blog content (10 articles)', quantity: 10, unit_price: 350, discount: 0, tax_rate: 15, line_total: 4025, sort_order: 0 },
  ],
  'demo-inv-13': [
    { id: 'ii-13-1', product_code: 'PRD-003', product_name: 'Social Media Management', description: 'Monthly social media package', quantity: 3, unit_price: 1800, discount: 0, tax_rate: 15, line_total: 6210, sort_order: 0 },
  ],
  'demo-inv-14': [
    { id: 'ii-14-1', product_code: 'PRD-015', product_name: 'Google Ads Setup', description: 'Campaign setup & first month', quantity: 1, unit_price: 6500, discount: 10, tax_rate: 15, line_total: 6727, sort_order: 0 },
  ],
  'demo-inv-15': [
    { id: 'ii-15-1', product_code: 'PRD-016', product_name: 'Video Editing', description: 'Promotional video (2 min)', quantity: 1, unit_price: 4200, discount: 0, tax_rate: 15, line_total: 4830, sort_order: 0 },
  ],
  'demo-inv-16': [
    { id: 'ii-16-1', product_code: 'PRD-010', product_name: 'Monthly Retainer', description: 'Digital marketing retainer', quantity: 1, unit_price: 4500, discount: 0, tax_rate: 15, line_total: 5175, sort_order: 0 },
  ],
};

function makeInvoice(
  id: string,
  num: string,
  custId: string,
  invDate: string,
  dueDate: string,
  status: Invoice['status'],
  subtotal: number,
  taxAmount: number,
  total: number,
  notes: string,
  itemsKey: string,
): Omit<Invoice, 'created_at' | 'updated_at'> {
  return {
    id,
    invoice_number: num,
    customer_id: custId,
    invoice_date: invDate,
    due_date: dueDate,
    currency: 'ZAR',
    payment_terms: '30 days',
    subtotal,
    discount_amount: 0,
    tax_rate: 15,
    tax_amount: taxAmount,
    total,
    status,
    notes,
    payment_info: '',
    items: DEMO_INVOICE_ITEMS[itemsKey],
    customer: {
      ...DEMO_CUSTOMERS.find((c) => c.id === custId)!,
      created_at: invDate,
      updated_at: invDate,
    },
  };
}

export const DEMO_INVOICES: Omit<Invoice, 'created_at' | 'updated_at'>[] = [
  // August 2026 (current month)
  makeInvoice('demo-inv-1', 'INV-0100', 'demo-cust-1', daysAgo(1), daysAhead(29), 'paid', 11000, 1650, 12650, 'Payment received. Thank you for your business.', 'demo-inv-1'),
  makeInvoice('demo-inv-2', 'INV-0101', 'demo-cust-2', daysAgo(2), daysAhead(28), 'sent', 5400, 810, 6210, 'Payment due within 30 days.', 'demo-inv-2'),
  makeInvoice('demo-inv-3', 'INV-0102', 'demo-cust-3', daysAgo(45), daysAgo(15), 'overdue', 4000, 600, 4600, 'Payment overdue. Please settle immediately.', 'demo-inv-3'),
  makeInvoice('demo-inv-4', 'INV-0103', 'demo-cust-4', daysAgo(5), daysAhead(25), 'paid', 2850, 0, 2850, '', 'demo-inv-4'),
  makeInvoice('demo-inv-5', 'INV-0104', 'demo-cust-5', daysAgo(3), daysAhead(27), 'unpaid', 4400, 660, 5060, 'Monthly billing cycle.', 'demo-inv-5'),
  makeInvoice('demo-inv-6', 'INV-0105', 'demo-cust-1', daysAgo(60), daysAgo(30), 'paid', 5500, 825, 6325, '', 'demo-inv-6'),
  makeInvoice('demo-inv-7', 'INV-0106', 'demo-cust-2', daysAgo(6), daysAhead(24), 'sent', 4500, 675, 5175, 'Retainer for August 2026.', 'demo-inv-7'),
  makeInvoice('demo-inv-8', 'INV-0107', 'demo-cust-3', daysAgo(10), daysAgo(0), 'cancelled', 3000, 450, 3450, 'Cancelled by customer request.', 'demo-inv-8'),
  // July 2026
  makeInvoice('demo-inv-9', 'INV-0108', 'demo-cust-5', monthsAgo(1, 5), monthsAgo(0, 5), 'paid', 12000, 1710, 13710, 'E-commerce project completed.', 'demo-inv-9'),
  makeInvoice('demo-inv-10', 'INV-0109', 'demo-cust-1', monthsAgo(1, 12), monthsAgo(0, 12), 'paid', 4500, 675, 5175, 'July retainer.', 'demo-inv-10'),
  makeInvoice('demo-inv-11', 'INV-0110', 'demo-cust-4', monthsAgo(1, 20), monthsAgo(0, 20), 'paid', 8000, 1200, 9200, 'Brand strategy workshop.', 'demo-inv-11'),
  // June 2026
  makeInvoice('demo-inv-12', 'INV-0111', 'demo-cust-6', monthsAgo(2, 8), monthsAgo(1, 8), 'paid', 3500, 525, 4025, 'Content package delivered.', 'demo-inv-12'),
  makeInvoice('demo-inv-13', 'INV-0112', 'demo-cust-2', monthsAgo(2, 18), monthsAgo(1, 18), 'paid', 5400, 810, 6210, 'Social media management.', 'demo-inv-13'),
  // May 2026
  makeInvoice('demo-inv-14', 'INV-0113', 'demo-cust-3', monthsAgo(3, 10), monthsAgo(2, 10), 'paid', 6500, 975, 7475, 'Google Ads campaign setup.', 'demo-inv-14'),
  makeInvoice('demo-inv-15', 'INV-0114', 'demo-cust-5', monthsAgo(3, 22), monthsAgo(2, 22), 'paid', 4200, 630, 4830, 'Video editing project.', 'demo-inv-15'),
  // April 2026
  makeInvoice('demo-inv-16', 'INV-0115', 'demo-cust-1', monthsAgo(4, 15), monthsAgo(3, 15), 'paid', 4500, 675, 5175, 'April retainer.', 'demo-inv-16'),
];
