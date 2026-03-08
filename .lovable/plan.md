

## Plan: Rediseño de Eventos con Google Meet Automático y Envío por Email

### Prerequisito 1: Google Calendar API (Service Account)

Para crear reuniones de Meet automáticamente, se necesita configurar una **Service Account** en Google Cloud Console:

1. **Ir a** [Google Cloud Console](https://console.cloud.google.com/)
2. **Crear un proyecto** (o seleccionar uno existente)
3. **Habilitar la API de Google Calendar**:
   - Ir a "APIs & Services" → "Library"
   - Buscar "Google Calendar API" → Habilitar
4. **Crear una Service Account**:
   - Ir a "APIs & Services" → "Credentials"
   - "Create Credentials" → "Service Account"
   - Darle un nombre (ej: "biztech-erp-calendar")
   - Crear una key JSON: en la service account → "Keys" → "Add Key" → "Create new key" → JSON
5. **Habilitar Google Workspace Domain-Wide Delegation** (si usan Google Workspace):
   - En la service account, activar "Domain-wide delegation"
   - En Google Workspace Admin → Security → API Controls → Domain-wide delegation
   - Agregar el Client ID de la service account con scope: `https://www.googleapis.com/auth/calendar`
6. **Alternativa sin Workspace**: Usar OAuth2 con un usuario real:
   - Crear un "OAuth 2.0 Client ID" (tipo Web Application)
   - Generar un refresh token con el playground de OAuth2
   - Guardar `client_id`, `client_secret`, y `refresh_token` como secrets

Los secrets necesarios serán:
- `GOOGLE_SERVICE_ACCOUNT_KEY` (JSON de la service account) — o bien —
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN` (OAuth2)

### Prerequisito 2: RESEND_API_KEY

No esta configurada actualmente. Se pedira al usuario para el envio de emails.

### 1. Migración de base de datos

Agregar columnas a tabla `events`:
- `event_type` text DEFAULT 'meeting' (meeting, task, deadline, reminder)
- `meeting_url` text nullable
- `attendee_email` text nullable
- `client_id` uuid nullable (FK → clients)
- `email_sent` boolean DEFAULT false
- `google_event_id` text nullable (para sincronizar con Google Calendar)

### 2. Edge Function `create-meet-event`

- Recibe: título, fecha/hora inicio y fin, attendee_email, description
- Usa Google Calendar API para crear un evento con `conferenceData` (Google Meet auto-generado)
- Retorna el `meetLink` y `google_event_id`
- Se invoca al crear un evento tipo "meeting"

```text
Flujo:
POST → Edge Function → Google Calendar API (con conferenceDataVersion=1)
     → Respuesta incluye hangoutLink (= link de Meet)
     → Se guarda en events.meeting_url + events.google_event_id
```

### 3. Edge Function `send-event-invite`

- Recibe: evento con título, fecha, meeting_url, attendee_email
- Envía email via Resend con template HTML (branding Biztech, botón "Unirse a la reunión")
- Se invoca automáticamente después de crear el evento si hay attendee_email

### 4. Rediseño del formulario de creación (`CalendarPage.tsx`)

Nuevo diálogo con secciones visuales:

**Sección 1 — Info básica:**
- Título (input prominente)
- Tipo de evento: selector visual con iconos (Reunión/Video, Tarea/CheckSquare, Deadline/Flag, Recordatorio/Bell)
- Descripción

**Sección 2 — Fecha y hora:**
- Badge con fecha seleccionada
- Grid hora inicio / fin

**Sección 3 — Reunión** (visible solo si tipo = "meeting"):
- Campo "Email del participante" — combo: select de clientes existentes O input manual
- Proyecto asociado (select)
- El link de Meet se genera automáticamente al guardar (indicador visual de "Se generará link de Meet")

**Sección 4 — Preview:**
- Tarjeta preview de la invitación que se enviará
- Toggle "Enviar invitación por email"

### 5. Rediseño `EventDetailDialog.tsx`

- Badge colorido por tipo de evento
- Botón "Unirse a la reunión" clickeable si hay meeting_url
- Badge "Invitación enviada" si email_sent = true
- Botón "Reenviar invitación"

### 6. Visualización en calendario

- Icono de cámara en eventos tipo "meeting"
- Colores por tipo: meeting=blue, task=green, deadline=red, reminder=amber

### 7. Hook `useEvents.ts`

- Actualizar interface Event con nuevos campos
- Lógica de creación: si tipo = meeting → llamar `create-meet-event` → obtener link → guardar evento → llamar `send-event-invite`

### 8. Archivos a crear/modificar

| Archivo | Acción |
|---------|--------|
| Migración SQL | Crear — agregar columnas a events |
| `supabase/functions/create-meet-event/index.ts` | Crear — integración Google Calendar API |
| `supabase/functions/send-event-invite/index.ts` | Crear — envío email con Resend |
| `supabase/config.toml` | Agregar config de ambas edge functions |
| `src/pages/CalendarPage.tsx` | Modificar — rediseño diálogo + colores por tipo |
| `src/components/calendar/EventDetailDialog.tsx` | Modificar — rediseño completo |
| `src/hooks/useEvents.ts` | Modificar — nuevos campos + flujo Meet + email |

### 9. Flujo completo

```text
Crear evento → Tipo "Reunión" → Escribir email participante
     ↓
Confirmar → Edge function crea evento en Google Calendar con Meet
     ↓
Recibe meetLink → Guarda en DB → Edge function envía email con Resend
     ↓
En detalle: botón "Unirse", badge "Invitación enviada"
```

### Pasos para el usuario antes de implementar

1. Configurar Google Cloud Console (pasos descritos arriba)
2. Proporcionar las credenciales (service account JSON o OAuth2 tokens)
3. Proporcionar `RESEND_API_KEY` (crear cuenta gratuita en resend.com)

