-- Create lead status enum
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'qualified', 'discarded', 'converted');

-- Create leads table
CREATE TABLE public.leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT DEFAULT 'landing_page',
  status lead_status NOT NULL DEFAULT 'new',
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id),
  meeting_scheduled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add lead_id to events table to link meetings with leads
ALTER TABLE public.events ADD COLUMN lead_id UUID REFERENCES public.leads(id) ON DELETE SET NULL;

-- Enable RLS on leads
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- RLS policies for leads - team members can manage
CREATE POLICY "Team members can view leads"
ON public.leads
FOR SELECT
USING (is_team_member(auth.uid()));

CREATE POLICY "Team members can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (is_team_member(auth.uid()));

CREATE POLICY "Team members can update leads"
ON public.leads
FOR UPDATE
USING (is_team_member(auth.uid()));

CREATE POLICY "Team members can delete leads"
ON public.leads
FOR DELETE
USING (is_team_member(auth.uid()));

-- Policy for public insertion via service role (edge function)
CREATE POLICY "Service role can insert leads"
ON public.leads
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_leads_status ON public.leads(status);
CREATE INDEX idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX idx_leads_assigned_to ON public.leads(assigned_to);
CREATE INDEX idx_events_lead_id ON public.events(lead_id);