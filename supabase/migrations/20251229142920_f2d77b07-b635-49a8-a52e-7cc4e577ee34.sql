-- Add priority enum
CREATE TYPE public.lead_priority AS ENUM ('low', 'medium', 'high');

-- Add missing columns to leads table
ALTER TABLE public.leads 
  ADD COLUMN IF NOT EXISTS country_code TEXT,
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS company_size TEXT,
  ADD COLUMN IF NOT EXISTS company_stage TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS challenges TEXT,
  ADD COLUMN IF NOT EXISTS wants_meeting BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_time TEXT,
  ADD COLUMN IF NOT EXISTS priority lead_priority DEFAULT 'medium',
  ADD COLUMN IF NOT EXISTS ip_address TEXT,
  ADD COLUMN IF NOT EXISTS user_agent TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT,
  ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS converted_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_priority ON public.leads(priority);
CREATE INDEX IF NOT EXISTS idx_leads_industry ON public.leads(industry);
CREATE INDEX IF NOT EXISTS idx_leads_utm_source ON public.leads(utm_source);