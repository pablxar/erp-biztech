-- Add 'tax' to transaction_type enum
ALTER TYPE transaction_type ADD VALUE IF NOT EXISTS 'tax';

-- Add tax_type column to transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS tax_type text;

-- Add VAT fields to projects
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS vat_exempt boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vat_rate numeric NOT NULL DEFAULT 19;