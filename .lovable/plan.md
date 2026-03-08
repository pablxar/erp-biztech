

## Plan: Documento de Onboarding con IA para Clientes

### Resumen
Crear un sistema completo de onboarding por cliente que permita subir un PDF de transcripción o audio de reunión, procesarlo con IA para extraer información clave, llenar automáticamente un formulario de onboarding estandarizado, y generar una propuesta con precios basados en proyectos anteriores.

### 1. Base de datos

**Tabla `client_onboarding`:**
- `id` (uuid, PK), `client_id` (uuid, FK → clients), `status` (text: 'draft'/'processing'/'completed'), `created_by` (uuid), `created_at`, `updated_at`
- Campos del documento onboarding:
  - `company_description` (text) — Descripción del negocio
  - `business_goals` (text) — Objetivos del cliente
  - `target_audience` (text) — Público objetivo
  - `current_challenges` (text) — Problemas actuales
  - `requested_services` (jsonb) — Servicios solicitados
  - `timeline` (text) — Plazos deseados
  - `budget_range` (text) — Rango de presupuesto
  - `competitors` (text) — Competencia
  - `brand_guidelines` (text) — Lineamientos de marca
  - `additional_notes` (text) — Notas adicionales
  - `ai_proposal` (text) — Propuesta generada por IA
  - `ai_summary` (text) — Resumen ejecutivo generado por IA
  - `source_file_url` (text) — URL del archivo subido
  - `source_file_type` (text) — 'pdf' o 'audio'
- RLS: `is_team_member(auth.uid())`

**Storage bucket `onboarding-files`:** Para subir PDFs y audios.

### 2. Edge Function `process-onboarding`

- Recibe el archivo subido (PDF o audio)
- Para PDF: extrae texto del contenido
- Para audio: usa transcripción (se puede delegar a la IA con el contenido)
- Envía el texto extraído + datos de proyectos anteriores del sistema a Lovable AI (`google/gemini-2.5-flash`)
- La IA devuelve un JSON estructurado con los campos del onboarding llenos, ideas organizadas y una propuesta de cobro basada en historial
- Tool calling para extraer output estructurado

### 3. Componentes UI

**`src/pages/ClientOnboarding.tsx`** — Página principal accesible desde el detalle del cliente:
- **Paso 1 - Subir archivo**: Drag & drop zone para PDF o audio, indicador de procesamiento con IA
- **Paso 2 - Revisión y edición**: Formulario con todos los campos pre-llenados por IA, editables por el usuario. Secciones colapsables
- **Paso 3 - Propuesta**: Propuesta generada por IA con desglose de servicios y precios sugeridos (basados en `SERVICE_PRICING` + historial de proyectos del cliente). Posibilidad de ajustar antes de guardar
- **Paso 4 - Confirmación**: Resumen final, opción de crear proyecto directamente desde el onboarding

**`src/components/onboarding/OnboardingUploader.tsx`** — Zona de subida con progress
**`src/components/onboarding/OnboardingForm.tsx`** — Formulario editable con campos pre-llenados
**`src/components/onboarding/OnboardingProposal.tsx`** — Vista de propuesta con pricing

### 4. Hook `src/hooks/useOnboarding.ts`
- CRUD para `client_onboarding`
- Mutation para subir archivo y disparar procesamiento AI
- Query para obtener onboardings de un cliente

### 5. Integración con Clientes
- Botón "Onboarding" en el panel de detalle del cliente (Clients page) y como acción en el dropdown
- Ruta `/clients/:clientId/onboarding` o modal/página dedicada

### 6. Flujo completo

```text
Subir PDF/Audio → Storage bucket → Edge Function procesa con IA
       ↓
IA extrae: descripción, objetivos, servicios, retos, público
       ↓
IA consulta proyectos anteriores similares → propone precios
       ↓
Formulario pre-llenado → Usuario revisa/edita → Guarda
       ↓
Opción: Crear proyecto directamente con datos del onboarding
```

### 7. Navegación
- Agregar ruta `/clients/:clientId/onboarding` en App.tsx
- Botón en panel de detalle de cliente para acceder

### Detalles técnicos
- El edge function usa `google/gemini-2.5-flash` con tool calling para extraer JSON estructurado
- El archivo se sube a storage bucket `onboarding-files` con path `{client_id}/{timestamp}_{filename}`
- Para PDFs se extrae texto plano; para audio se envía como contexto indicando que es una transcripción
- La propuesta de precios usa los datos de `SERVICE_PRICING` + historial real de `projects` y `transactions` del cliente
- El formulario es 100% editable post-IA, el usuario siempre tiene control final

