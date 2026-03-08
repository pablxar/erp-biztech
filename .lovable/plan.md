

# Plan: Precios Referenciales por Servicio y Logica de Cobro en Proyectos

## Resumen

Al seleccionar un tipo de servicio en el modal de crear/editar proyecto, se mostrara automaticamente un precio referencial. El campo "Presupuesto" se reemplaza por una seccion de pricing que permite ver el precio base, editarlo, seleccionar modalidad de pago y marcar el proyecto como "Por Pagar". Los proyectos marcados como pendientes de pago se reflejaran en la seccion "Por Cobrar" de Finanzas.

## Precios Referenciales por Servicio

| Servicio | Precio Base | Modalidad |
|---|---|---|
| Desarrollo de Software | $300,000 | Monto fijo (editable) |
| Web Development - Landing Page | $200,000 | Monto fijo (editable) |
| Web Development - E-commerce | $400,000 | Monto fijo (editable) |
| Marketing Digital | % por resultado | Growth Partner (porcentaje editable) |
| Audiovisual | $5,000/video | Por unidad (cantidad editable) |

Para Web Development se agregara un sub-selector (Landing Page vs E-commerce) que cambia el precio base.

## Cambios en Base de Datos

Se agregaran 4 columnas a la tabla `projects`:

```text
+-----------------------+----------+-----------------------------+
| Columna               | Tipo     | Descripcion                 |
+-----------------------+----------+-----------------------------+
| payment_status        | text     | 'pending' | 'partial' |     |
|                       |          | 'paid' (default: 'pending') |
| payment_mode          | text     | 'fixed' | 'percentage' |    |
|                       |          | 'per_unit'                  |
| reference_price       | numeric  | Precio referencial base     |
| payment_details       | jsonb    | Detalles extra: porcentaje, |
|                       |          | cantidad de videos, etc.    |
+-----------------------+----------+-----------------------------+
```

Tambien se creara una politica RLS consistente con las existentes (team members can manage).

## Cambios en el Frontend

### 1. Constantes de precios (nuevo archivo `src/lib/servicePricing.ts`)
- Mapa de precios referenciales por tipo de servicio
- Funciones helper para calcular el monto segun modalidad

### 2. CreateProjectDialog.tsx
- Al seleccionar un servicio, mostrar el precio referencial debajo de cada tarjeta de servicio
- Reemplazar el campo "Presupuesto ($)" por una seccion de pricing:
  - Precio referencial (pre-llenado, editable)
  - Selector de modalidad de pago (Monto Fijo / Porcentaje / Por Unidad)
  - Para Audiovisual: campo de cantidad de videos (calculo automatico)
  - Para Marketing Digital: campo de porcentaje
  - Para Web Development: sub-selector Landing/E-commerce
  - Checkbox "Marcar como Por Pagar"

### 3. EditProjectDialog.tsx
- Misma logica de pricing que en Create
- Mostrar estado de pago actual y permitir cambiarlo

### 4. useProjects.ts
- Agregar los nuevos campos al tipo `Project` y `CreateProjectInput`
- Incluirlos en las mutaciones de crear/actualizar

### 5. Finance.tsx - Seccion "Por Cobrar"
- Modificar la tarjeta "Por Cobrar" para incluir proyectos con `payment_status = 'pending'`
- Sumar el `reference_price` (o budget) de proyectos pendientes de pago a las facturas pendientes
- Agregar una seccion/lista de "Proyectos por cobrar" que muestre los proyectos marcados como pendientes

### 6. Projects.tsx
- Mostrar badge de estado de pago en las tarjetas de proyecto (Por Pagar / Pagado / Parcial)

## Detalles Tecnicos

### Migracion SQL
```text
ALTER TABLE projects ADD COLUMN payment_status text DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN payment_mode text;
ALTER TABLE projects ADD COLUMN reference_price numeric DEFAULT 0;
ALTER TABLE projects ADD COLUMN payment_details jsonb DEFAULT '{}';
```

### Estructura de payment_details (jsonb)
- Para audiovisual: `{ "video_count": 3, "price_per_video": 5000 }`
- Para marketing: `{ "percentage": 15, "description": "Growth Partner" }`
- Para web (landing): `{ "web_subtype": "landing_page" }`
- Para web (ecommerce): `{ "web_subtype": "ecommerce" }`

### Flujo de datos
1. Usuario selecciona servicio --> precio referencial se muestra y se pre-llena
2. Usuario puede editar el precio final --> se guarda en `budget` (monto final) y `reference_price` (precio base)
3. Al marcar "Por Pagar" --> `payment_status = 'pending'`
4. En Finanzas, se consultan proyectos con `payment_status IN ('pending', 'partial')` y se suman a "Por Cobrar"

