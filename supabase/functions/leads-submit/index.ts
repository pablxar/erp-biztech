import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadSubmission {
  // Basic info
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  country_code?: string;
  
  // Business info
  referral_source?: string;
  company_size?: string;
  company_stage?: string;
  industry?: string;
  services?: string[];
  challenges?: string;
  
  // Meeting
  wants_meeting?: boolean;
  preferred_date?: string; // ISO date string YYYY-MM-DD
  preferred_time?: string; // HH:MM format
  
  // Lead management
  status?: string;
  priority?: string;
  notes?: string;
  source?: string;
  
  // Tracking
  ip_address?: string;
  user_agent?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateTime(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

function validateDate(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}/;
  if (!dateRegex.test(date)) return false;
  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body: LeadSubmission = await req.json();
    console.log('Received lead submission:', JSON.stringify(body));

    // Validation
    const errors: string[] = [];

    if (!body.name || body.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (body.name && body.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    if (body.email && !validateEmail(body.email)) {
      errors.push('Invalid email format');
    }

    if (body.email && body.email.length > 255) {
      errors.push('Email must be less than 255 characters');
    }

    if (body.phone && body.phone.length > 50) {
      errors.push('Phone must be less than 50 characters');
    }

    if (body.company && body.company.length > 100) {
      errors.push('Company must be less than 100 characters');
    }

    if (body.notes && body.notes.length > 2000) {
      errors.push('Notes must be less than 2000 characters');
    }

    if (body.challenges && body.challenges.length > 2000) {
      errors.push('Challenges must be less than 2000 characters');
    }

    if (body.preferred_date && !validateDate(body.preferred_date)) {
      errors.push('Invalid preferred_date format (expected YYYY-MM-DD)');
    }

    if (body.preferred_time && !validateTime(body.preferred_time)) {
      errors.push('Invalid preferred_time format (expected HH:MM)');
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high'];
    if (body.priority && !validPriorities.includes(body.priority)) {
      errors.push('Invalid priority. Must be: low, medium, or high');
    }

    if (errors.length > 0) {
      console.log('Validation errors:', errors);
      return new Response(JSON.stringify({ error: 'Validation failed', details: errors }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate meeting times if provided
    let meetingScheduledAt: string | null = null;
    if (body.wants_meeting && body.preferred_date) {
      const time = body.preferred_time || '09:00';
      // Handle date format with timezone
      const dateStr = body.preferred_date.split('T')[0].split('+')[0];
      meetingScheduledAt = `${dateStr}T${time}:00`;
    }

    // Insert lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        country_code: body.country_code?.trim() || null,
        referral_source: body.referral_source?.trim() || null,
        company_size: body.company_size?.trim() || null,
        company_stage: body.company_stage?.trim() || null,
        industry: body.industry?.trim() || null,
        services: body.services || [],
        challenges: body.challenges?.trim() || null,
        wants_meeting: body.wants_meeting || false,
        preferred_time: body.preferred_time?.trim() || null,
        priority: body.priority || 'medium',
        source: body.source?.trim() || 'landing_page',
        notes: body.notes?.trim() || null,
        status: 'new',
        meeting_scheduled_at: meetingScheduledAt,
        ip_address: body.ip_address || null,
        user_agent: body.user_agent || null,
        utm_source: body.utm_source || null,
        utm_medium: body.utm_medium || null,
        utm_campaign: body.utm_campaign || null,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      return new Response(JSON.stringify({ error: 'Failed to create lead', details: leadError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Lead created successfully:', lead.id);

    // If meeting was scheduled, create an event
    let event = null;
    if (body.wants_meeting && meetingScheduledAt) {
      const duration = 30; // Default 30 minutes
      const startTime = new Date(meetingScheduledAt);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      // Build description with all available info
      const descriptionParts = [
        `Lead: ${body.company || 'Sin empresa'}`,
        `Email: ${body.email || 'No proporcionado'}`,
        `Teléfono: ${body.phone ? `${body.country_code || ''} ${body.phone}` : 'No proporcionado'}`,
      ];
      
      if (body.industry) descriptionParts.push(`Industria: ${body.industry}`);
      if (body.company_size) descriptionParts.push(`Tamaño: ${body.company_size} empleados`);
      if (body.company_stage) descriptionParts.push(`Etapa: ${body.company_stage}`);
      if (body.services && body.services.length > 0) {
        descriptionParts.push(`Servicios de interés: ${body.services.join(', ')}`);
      }
      if (body.challenges) descriptionParts.push(`\nDesafíos:\n${body.challenges}`);
      if (body.notes) descriptionParts.push(`\nNotas:\n${body.notes}`);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: `Reunión con ${body.name}${body.company ? ` - ${body.company}` : ''}`,
          description: descriptionParts.join('\n'),
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          all_day: false,
          lead_id: lead.id,
        })
        .select()
        .single();

      if (eventError) {
        console.error('Error creating event:', eventError);
        // Don't fail the whole request, lead was created successfully
      } else {
        event = eventData;
        console.log('Event created successfully:', event.id);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      lead_id: lead.id,
      event_id: event?.id || null,
      message: 'Lead submitted successfully' 
    }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
