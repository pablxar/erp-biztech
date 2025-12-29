import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LeadSubmission {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  notes?: string;
  meeting?: {
    date: string; // ISO date string YYYY-MM-DD
    time: string; // HH:MM format
    duration?: number; // minutes, default 30
  };
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
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
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

    if (body.notes && body.notes.length > 1000) {
      errors.push('Notes must be less than 1000 characters');
    }

    if (body.meeting) {
      if (!body.meeting.date || !validateDate(body.meeting.date)) {
        errors.push('Invalid meeting date format (expected YYYY-MM-DD)');
      }
      if (!body.meeting.time || !validateTime(body.meeting.time)) {
        errors.push('Invalid meeting time format (expected HH:MM)');
      }
      if (body.meeting.duration && (body.meeting.duration < 15 || body.meeting.duration > 480)) {
        errors.push('Meeting duration must be between 15 and 480 minutes');
      }
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
    if (body.meeting) {
      meetingScheduledAt = `${body.meeting.date}T${body.meeting.time}:00`;
    }

    // Insert lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .insert({
        name: body.name.trim(),
        email: body.email?.trim() || null,
        phone: body.phone?.trim() || null,
        company: body.company?.trim() || null,
        source: body.source?.trim() || 'landing_page',
        notes: body.notes?.trim() || null,
        status: 'new',
        meeting_scheduled_at: meetingScheduledAt,
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      return new Response(JSON.stringify({ error: 'Failed to create lead' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Lead created successfully:', lead.id);

    // If meeting was scheduled, create an event
    let event = null;
    if (body.meeting && meetingScheduledAt) {
      const duration = body.meeting.duration || 30;
      const startTime = new Date(meetingScheduledAt);
      const endTime = new Date(startTime.getTime() + duration * 60000);

      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          title: `Reunión con ${body.name}`,
          description: `Lead: ${body.company || 'Sin empresa'}\nEmail: ${body.email || 'No proporcionado'}\nTeléfono: ${body.phone || 'No proporcionado'}\n\nNotas: ${body.notes || 'Sin notas'}`,
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
