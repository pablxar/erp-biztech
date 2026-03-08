import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { onboardingId, fileContent, clientId } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Update status to processing
    await supabase.from("client_onboarding").update({ status: "processing" }).eq("id", onboardingId);

    // Fetch client info
    const { data: client } = await supabase.from("clients").select("*").eq("id", clientId).single();

    // Fetch client's project history for pricing context
    const { data: clientProjects } = await supabase
      .from("projects")
      .select("name, service_type, budget, reference_price, payment_mode, payment_details, status")
      .eq("client_id", clientId);

    // Fetch all projects for general pricing context
    const { data: allProjects } = await supabase
      .from("projects")
      .select("service_type, budget, reference_price, payment_mode, status")
      .not("budget", "is", null);

    const pricingContext = `
## Precios Referenciales de BizTech:
- Desarrollo de Software: $300,000 (monto fijo)
- Web Development - Landing Page: $200,000 (monto fijo)
- Web Development - E-commerce: $400,000 (monto fijo)
- Marketing Digital: Porcentaje por resultado (Growth Partner)
- Audiovisual: $5,000 por video editado

## Historial de proyectos del cliente (${client?.name || "N/A"}):
${clientProjects?.length ? clientProjects.map(p => `- ${p.name}: ${p.service_type || "N/A"} | Budget: $${p.budget || 0} | Estado: ${p.status}`).join("\n") : "Sin proyectos previos"}

## Historial general de precios en proyectos:
${allProjects?.slice(0, 20).map(p => `- ${p.service_type}: $${p.budget || 0}`).join("\n") || "Sin datos"}
`;

    const systemPrompt = `Eres un analista de negocios experto de BizTech, una agencia de tecnología y marketing digital. 
Tu tarea es analizar la transcripción de una reunión con un cliente potencial o existente y extraer información estructurada para un documento de onboarding.

${pricingContext}

INSTRUCCIONES:
1. Lee cuidadosamente la transcripción/contenido proporcionado
2. Extrae y organiza la información en las categorías del onboarding
3. Si alguna información no está disponible, déjala vacía (no inventes datos)
4. Organiza las ideas de forma clara y profesional
5. Genera una propuesta de precios basada en los servicios identificados y el historial de precios
6. El resumen ejecutivo debe ser conciso pero completo

IMPORTANTE: 
- Sé preciso con los datos extraídos, no inventes información que no esté en la transcripción
- Para la propuesta, basa los precios en el historial real y los precios referenciales
- Identifica claramente qué servicios necesita el cliente`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analiza el siguiente contenido de reunión/transcripción y extrae la información de onboarding:\n\n${fileContent}` },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "fill_onboarding",
              description: "Llena el formulario de onboarding con la información extraída de la transcripción",
              parameters: {
                type: "object",
                properties: {
                  company_description: { type: "string", description: "Descripción del negocio del cliente" },
                  business_goals: { type: "string", description: "Objetivos del negocio del cliente" },
                  target_audience: { type: "string", description: "Público objetivo del cliente" },
                  current_challenges: { type: "string", description: "Problemas o retos actuales del cliente" },
                  requested_services: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        service: { type: "string", enum: ["software_development", "web_development", "digital_marketing", "audiovisual"] },
                        description: { type: "string" },
                        estimated_price: { type: "number" },
                        notes: { type: "string" },
                      },
                      required: ["service", "description"],
                    },
                    description: "Servicios solicitados por el cliente",
                  },
                  timeline: { type: "string", description: "Plazos deseados por el cliente" },
                  budget_range: { type: "string", description: "Rango de presupuesto mencionado por el cliente" },
                  competitors: { type: "string", description: "Competidores mencionados" },
                  brand_guidelines: { type: "string", description: "Lineamientos de marca o preferencias de diseño" },
                  additional_notes: { type: "string", description: "Notas adicionales relevantes" },
                  ai_summary: { type: "string", description: "Resumen ejecutivo de la reunión en 3-5 oraciones" },
                  ai_proposal: { type: "string", description: "Propuesta comercial detallada en formato markdown con desglose de servicios, precios sugeridos, timeline estimado y valor agregado. Incluye tabla de precios." },
                },
                required: ["company_description", "business_goals", "requested_services", "ai_summary", "ai_proposal"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "fill_onboarding" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      
      if (response.status === 429) {
        await supabase.from("client_onboarding").update({ status: "draft" }).eq("id", onboardingId);
        return new Response(JSON.stringify({ error: "Límite de solicitudes excedido. Intenta de nuevo en unos momentos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        await supabase.from("client_onboarding").update({ status: "draft" }).eq("id", onboardingId);
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await supabase.from("client_onboarding").update({ status: "draft" }).eq("id", onboardingId);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      await supabase.from("client_onboarding").update({ status: "draft" }).eq("id", onboardingId);
      throw new Error("No structured output from AI");
    }

    const onboardingData = JSON.parse(toolCall.function.arguments);

    // Update onboarding record with AI results
    const { error: updateError } = await supabase
      .from("client_onboarding")
      .update({
        status: "completed",
        company_description: onboardingData.company_description || null,
        business_goals: onboardingData.business_goals || null,
        target_audience: onboardingData.target_audience || null,
        current_challenges: onboardingData.current_challenges || null,
        requested_services: onboardingData.requested_services || [],
        timeline: onboardingData.timeline || null,
        budget_range: onboardingData.budget_range || null,
        competitors: onboardingData.competitors || null,
        brand_guidelines: onboardingData.brand_guidelines || null,
        additional_notes: onboardingData.additional_notes || null,
        ai_summary: onboardingData.ai_summary || null,
        ai_proposal: onboardingData.ai_proposal || null,
      })
      .eq("id", onboardingId);

    if (updateError) {
      console.error("Update error:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, data: onboardingData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Process onboarding error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
