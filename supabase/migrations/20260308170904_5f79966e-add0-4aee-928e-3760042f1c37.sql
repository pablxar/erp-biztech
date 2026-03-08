
-- Create client_onboarding table
CREATE TABLE public.client_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  company_description text,
  business_goals text,
  target_audience text,
  current_challenges text,
  requested_services jsonb DEFAULT '[]'::jsonb,
  timeline text,
  budget_range text,
  competitors text,
  brand_guidelines text,
  additional_notes text,
  ai_proposal text,
  ai_summary text,
  source_file_url text,
  source_file_type text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.client_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS policy
CREATE POLICY "Team members can manage onboarding"
  ON public.client_onboarding
  FOR ALL
  USING (is_team_member(auth.uid()))
  WITH CHECK (is_team_member(auth.uid()));

-- Updated_at trigger
CREATE TRIGGER update_client_onboarding_updated_at
  BEFORE UPDATE ON public.client_onboarding
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Storage bucket for onboarding files
INSERT INTO storage.buckets (id, name, public) VALUES ('onboarding-files', 'onboarding-files', false);

-- Storage policies
CREATE POLICY "Team members can upload onboarding files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'onboarding-files' AND is_team_member(auth.uid()));

CREATE POLICY "Team members can read onboarding files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'onboarding-files' AND is_team_member(auth.uid()));

CREATE POLICY "Team members can delete onboarding files"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'onboarding-files' AND is_team_member(auth.uid()));
