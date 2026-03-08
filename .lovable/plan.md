

## Plan: Agregar página de Metas e Ideas para Biztech

### Resumen
Crear una nueva página con dos pestañas: **Metas** (objetivos que se pueden marcar como completados/tachados) e **Ideas** (banco de ideas para el futuro de Biztech). Se necesitan dos tablas nuevas en la base de datos.

### 1. Crear tablas en la base de datos

**Tabla `goals`:**
- `id` (uuid, PK), `title` (text), `description` (text, nullable), `completed` (boolean, default false), `completed_at` (timestamptz, nullable), `due_date` (date, nullable), `priority` (task_priority, default 'medium'), `created_by` (uuid), `created_at` (timestamptz)
- RLS: team members can CRUD

**Tabla `ideas`:**
- `id` (uuid, PK), `title` (text), `description` (text, nullable), `category` (text, nullable — e.g. "Producto", "Marketing", "Operaciones"), `status` (text, default 'nueva' — nueva/en_evaluacion/aprobada/descartada), `votes` (integer, default 0), `created_by` (uuid), `created_at` (timestamptz)
- RLS: team members can CRUD

### 2. Crear página `src/pages/Goals.tsx`
- Dos pestañas usando `Tabs`: **Metas** e **Ideas**
- **Tab Metas:**
  - Lista de objetivos con checkbox para tachar/completar (texto con `line-through` al completar)
  - Dialog para crear nueva meta (título, descripción, fecha límite, prioridad)
  - Filtro: Todas / Pendientes / Completadas
  - Animación suave al tachar
- **Tab Ideas:**
  - Tarjetas con título, descripción, categoría (badge de color), estado
  - Dialog para crear nueva idea
  - Filtro por categoría y estado

### 3. Crear hooks
- `src/hooks/useGoals.ts` — CRUD para goals
- `src/hooks/useIdeas.ts` — CRUD para ideas

### 4. Crear dialogs
- `src/components/goals/CreateGoalDialog.tsx`
- `src/components/goals/CreateIdeaDialog.tsx`

### 5. Actualizar navegación
- **Sidebar**: Agregar item "Metas & Ideas" con icono `Target` entre "IA Asistente" y "Configuración"
- **App.tsx**: Agregar ruta `/goals` apuntando a la nueva página

### Detalles técnicos
- Se reutilizan los tipos existentes `task_priority` para prioridad de metas
- Las tablas usan `is_team_member()` para RLS consistente con el resto del sistema
- Los hooks siguen el patrón existente con `@tanstack/react-query` + supabase client

