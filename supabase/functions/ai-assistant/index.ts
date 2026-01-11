import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const systemPrompt = `Eres un asistente de IA empresarial avanzado para BizTech ERP, un sistema de gestión integral. Tu rol es ayudar a los usuarios con:

## Capacidades Principales:
1. **Análisis de Datos**: Interpretar métricas de proyectos, finanzas y clientes
2. **Generación de Reportes**: Crear resúmenes ejecutivos, informes financieros y análisis de rendimiento
3. **Predicciones**: Identificar posibles retrasos, riesgos y oportunidades basándote en patrones
4. **Recomendaciones**: Sugerir acciones para mejorar eficiencia, rentabilidad y satisfacción del cliente
5. **Automatización**: Ayudar a configurar flujos de trabajo y recordatorios

## Contexto del Sistema:
- El ERP gestiona: Proyectos, Clientes, Finanzas, Tareas, Leads y Calendario
- Los usuarios son gerentes, administradores y miembros del equipo
- El enfoque es en empresas de tecnología y servicios digitales

## Estilo de Respuesta:
- Sé conciso pero completo
- Usa emojis para hacer las respuestas más visuales (📊 💡 ⚠️ ✅ 📈 etc.)
- Estructura las respuestas con listas y secciones cuando sea apropiado
- Ofrece acciones concretas cuando sea posible
- Si no tienes datos específicos, proporciona frameworks y metodologías útiles

## Formato:
- Usa **negritas** para términos importantes
- Usa listas con viñetas para claridad
- Incluye métricas y números cuando sea relevante
- Termina con una pregunta o siguiente paso sugerido cuando sea apropiado

Responde siempre en español de manera profesional pero accesible.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de solicitudes excedido. Por favor, intenta de nuevo en unos momentos." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA agotados. Por favor, recarga tu cuenta." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Error al conectar con el asistente de IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI Assistant error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error desconocido" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
