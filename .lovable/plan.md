

## Plan: Botón WhatsApp en Detalle de Reunión

### Cambios

**`src/components/calendar/EventDetailDialog.tsx`**
- Agregar un botón "Enviar por WhatsApp" debajo del bloque de "Unirse a la Reunión" (solo visible si `event_type === 'meeting'` y hay `meeting_url`)
- Al hacer clic, abre `https://wa.me/NUMERO?text=MENSAJE` en nueva pestaña
- El mensaje prellenado incluye: título del evento, fecha/hora, y link de Meet
- Número del grupo configurado como constante en el archivo (ej: `56912345678`)

**Necesito saber**: El número de teléfono del grupo de Biztech (formato internacional sin +, ej: `56912345678`).

### Detalle técnico

- Se usa `window.open()` con URL `wa.me` que abre WhatsApp Web o la app nativa
- El texto se codifica con `encodeURIComponent`
- Icono: usar `MessageCircle` de lucide-react (similar al ícono de WhatsApp)
- Estilo: botón verde (`bg-green-500/10 border-green-500/20`) similar al botón azul de Meet

