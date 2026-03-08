import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { event_id, title, description, start_time, end_time, meeting_url, attendee_email } = await req.json();

    if (!attendee_email || !title) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const startDate = new Date(start_time);
    const endDate = new Date(end_time);
    
    const formatDate = (d: Date) => d.toLocaleDateString("es-ES", { 
      weekday: "long", year: "numeric", month: "long", day: "numeric" 
    });
    const formatTime = (d: Date) => d.toLocaleTimeString("es-ES", { 
      hour: "2-digit", minute: "2-digit", hour12: false 
    });

    const meetingButton = meeting_url ? `
      <div style="text-align: center; margin: 24px 0;">
        <a href="${meeting_url}" 
           style="background-color: #00C9A7; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
          🎥 Unirse a la Reunión
        </a>
        <p style="color: #6b7280; font-size: 12px; margin-top: 8px;">
          ${meeting_url}
        </p>
      </div>
    ` : "";

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f0f23;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden; border: 1px solid #2d2d44;">
          
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #00C9A7 0%, #00B4D8 100%); padding: 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📅 Invitación a Evento</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Biztech Solutions</p>
          </div>

          <!-- Content -->
          <div style="padding: 32px;">
            <h2 style="color: #f0f0f0; margin: 0 0 20px; font-size: 20px;">${title}</h2>
            
            ${description ? `<p style="color: #9ca3af; margin: 0 0 20px; line-height: 1.6;">${description}</p>` : ""}

            <!-- Event Details -->
            <div style="background: rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
              <div style="margin-bottom: 12px;">
                <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">📆 Fecha</span>
                <p style="color: #f0f0f0; margin: 4px 0 0; font-size: 16px; font-weight: 600; text-transform: capitalize;">
                  ${formatDate(startDate)}
                </p>
              </div>
              <div>
                <span style="color: #6b7280; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">🕐 Hora</span>
                <p style="color: #f0f0f0; margin: 4px 0 0; font-size: 16px; font-weight: 600;">
                  ${formatTime(startDate)} - ${formatTime(endDate)}
                </p>
              </div>
            </div>

            ${meetingButton}
          </div>

          <!-- Footer -->
          <div style="padding: 20px 32px; border-top: 1px solid #2d2d44; text-align: center;">
            <p style="color: #6b7280; font-size: 12px; margin: 0;">
              Este email fue enviado automáticamente por Biztech ERP
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Biztech ERP <noreply@reu.biztech.cl>",
        to: [attendee_email],
        subject: `📅 Invitación: ${title}`,
        html: htmlContent,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mark event as email_sent
    if (event_id) {
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      );
      await serviceClient.from("events").update({ email_sent: true }).eq("id", event_id);
    }

    return new Response(
      JSON.stringify({ success: true, email_id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
