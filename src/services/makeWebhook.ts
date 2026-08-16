import type { Invoice, Settings, MakeWebhookPayload } from '@/types';

function buildAddress(s: Settings): string {
  const parts = [s.street_address, s.city, s.province, s.postal_code, s.country].filter(Boolean);
  return parts.join(', ');
}

export function buildMakePayload(invoice: Invoice, settings: Settings): MakeWebhookPayload {
  const customer = invoice.customer;
  const customerAddress = customer
    ? [customer.street_address, customer.city, customer.province, customer.postal_code, customer.country].filter(Boolean).join(', ')
    : '';

  return {
    invoice_number: invoice.invoice_number,
    invoice_date: invoice.invoice_date,
    due_date: invoice.due_date,
    customer: {
      name: customer?.name ?? '',
      email: customer?.email ?? '',
      phone: customer?.phone ?? '',
      business_name: customer?.business_name ?? '',
      address: customerAddress || customer?.address || '',
    },
    company: {
      name: settings.business_name,
      email: settings.business_email,
      phone: settings.business_phone,
      address: buildAddress(settings) || settings.business_address,
      website: settings.business_website,
    },
    items: (invoice.items ?? []).map((item) => ({
      product_code: item.product_code,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      tax_rate: item.tax_rate,
      line_total: item.line_total,
    })),
    subtotal: invoice.subtotal,
    discount: invoice.discount_amount,
    tax: invoice.tax_amount,
    total: invoice.total,
    payment_status: invoice.status,
    notes: invoice.notes,
  };
}

export async function triggerMakeWebhook(payload: MakeWebhookPayload): Promise<void> {
  const webhookUrl = import.meta.env.VITE_MAKE_WEBHOOK_URL;
  if (!webhookUrl) {
    console.info('[Make.com] Webhook not configured. Payload ready:', payload);
    return;
  }
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
