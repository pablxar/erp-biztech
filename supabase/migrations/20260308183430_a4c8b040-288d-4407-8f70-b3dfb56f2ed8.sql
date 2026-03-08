
ALTER TABLE public.events 
  ADD COLUMN event_type text NOT NULL DEFAULT 'meeting',
  ADD COLUMN meeting_url text,
  ADD COLUMN attendee_email text,
  ADD COLUMN client_id uuid REFERENCES public.clients(id),
  ADD COLUMN email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN google_event_id text;
