/*
# Upgrade invoice schema: discounts, per-item tax, product codes, currency, payment terms, split addresses

## Changes

### invoices table
- Add `currency` (text, default 'ZAR')
- Add `payment_terms` (text, default '30 days')
- Add `discount_amount` (numeric, default 0) — total invoice-level discount

### invoice_items table
- Add `product_code` (text, default '')
- Add `discount` (numeric(5,2), default 0) — percentage discount per line
- Add `tax_rate` (numeric(5,2), default 0) — per-item tax rate override

### settings table
- Add `street_address`, `city`, `province`, `country`, `postal_code` (all text, default '')
- Add `tax_number` (text, default '')
- Add `default_currency` (text, default 'ZAR')
- Add `default_tax_rate` (numeric(5,2), default 15)
- Add `payment_info` (text, default '') — banking/payment instructions

### customers table
- Add `street_address`, `city`, `province`, `country`, `postal_code` (all text, default '')

## Notes
- All additions are additive (no drops, no type changes).
- Existing `address` and `business_address` columns are preserved for backward compatibility.
*/

ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'ZAR';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS payment_terms text NOT NULL DEFAULT '30 days';
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS discount_amount numeric(12,2) NOT NULL DEFAULT 0;

ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS product_code text NOT NULL DEFAULT '';
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount numeric(5,2) NOT NULL DEFAULT 0;
ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS tax_rate numeric(5,2) NOT NULL DEFAULT 0;

ALTER TABLE settings ADD COLUMN IF NOT EXISTS street_address text NOT NULL DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS province text NOT NULL DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS postal_code text NOT NULL DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS tax_number text NOT NULL DEFAULT '';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_currency text NOT NULL DEFAULT 'ZAR';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS default_tax_rate numeric(5,2) NOT NULL DEFAULT 15;
ALTER TABLE settings ADD COLUMN IF NOT EXISTS payment_info text NOT NULL DEFAULT '';

ALTER TABLE customers ADD COLUMN IF NOT EXISTS street_address text NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS city text NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS province text NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country text NOT NULL DEFAULT '';
ALTER TABLE customers ADD COLUMN IF NOT EXISTS postal_code text NOT NULL DEFAULT '';
