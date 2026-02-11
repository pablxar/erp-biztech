
ALTER TABLE public.projects ADD COLUMN payment_status text DEFAULT 'pending';
ALTER TABLE public.projects ADD COLUMN payment_mode text;
ALTER TABLE public.projects ADD COLUMN reference_price numeric DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN payment_details jsonb DEFAULT '{}';
