-- Create enum for Biztech service types
CREATE TYPE public.service_type AS ENUM (
  'software_development',
  'digital_marketing', 
  'audiovisual',
  'web_development'
);

-- Add service_type column to projects table
ALTER TABLE public.projects 
ADD COLUMN service_type public.service_type;

-- Add comment for clarity
COMMENT ON COLUMN public.projects.service_type IS 'Biztech service category: software_development, digital_marketing, audiovisual, web_development';