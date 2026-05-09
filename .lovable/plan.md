
# Plan: Manejo de IVA en Finanzas y Proyectos

## Objetivo
Separar el IVA del cálculo de ingresos/gastos operativos para que pagar IVA al fisco no distorsione los gastos, y permitir marcar proyectos como afectos o exentos de IVA.

## 1. Base de datos

**Transacciones** (`transactions`)
- Extender el enum `transaction_type` para incluir un tercer valor: `tax` (además de `income` y `expense`).
- Agregar campo opcional `tax_type` (text) para distinguir: `iva_debito` (IVA cobrado a clientes), `iva_credito` (IVA pagado en compras), `iva_pago_fisco` (pago neto al SII).

**Proyectos** (`projects`)
- Agregar columna `vat_exempt` (boolean, default `false`) → indica si el proyecto es exento.
- Agregar columna `vat_rate` (numeric, default `19`) → tasa aplicable.

## 2. Lógica financiera

- **Cálculos en `useFinancialStats`**: ingresos y gastos solo consideran `type='income'` y `type='expense'`. El tipo `tax` se contabiliza por separado en una nueva métrica "IVA neto" (débito − crédito − pagos al fisco).
- **Por Cobrar**: si el proyecto es afecto, mostrar el desglose Neto + IVA = Total. El "Precio Acordado" se sigue tratando como total bruto (sin cambiar la lógica actual), pero se muestra el detalle del IVA implícito.
- **Registro de cobro de proyecto** (`RegisterPaymentDialog`): si el proyecto es afecto, generar automáticamente dos transacciones vinculadas:
  - Una `income` por el monto neto.
  - Una `tax` con `tax_type='iva_debito'` por el IVA.
  Si es exento, una sola transacción `income`.

## 3. UI

**CreateTransactionDialog**
- Selector de tipo con tres opciones: Ingreso, Gasto, IVA / Impuesto.
- Si se elige IVA, mostrar selector de subtipo (Débito, Crédito, Pago al Fisco).

**Finance.tsx**
- Nueva tarjeta de resumen "IVA neto a pagar" (débito − crédito − pagos hechos).
- Filtro/sección para listar transacciones de IVA aparte.
- Las transacciones tipo IVA se muestran con badge distintivo y no afectan el margen.

**CreateProjectDialog / EditProjectDialog**
- Switch "Afecto a IVA" (default activado) y campo de tasa editable (default 19%).

**ProjectDetail (pestaña pagos)**
- Mostrar desglose Neto / IVA / Total cuando el proyecto es afecto.

## 4. Migración de datos
- Marcar todos los proyectos existentes como afectos (`vat_exempt=false`) por defecto, ya que es lo más común.
- Las transacciones existentes quedan como están (income/expense); no se reclasifican retroactivamente.

## Archivos a tocar
- Migración SQL (enum + columnas + default)
- `src/hooks/useTransactions.ts` (tipos + stats con métrica IVA)
- `src/hooks/useProjects.ts` (campos vat_exempt, vat_rate)
- `src/components/finance/CreateTransactionDialog.tsx`
- `src/components/projects/RegisterPaymentDialog.tsx` (split neto + IVA)
- `src/components/projects/CreateProjectDialog.tsx` y `EditProjectDialog.tsx`
- `src/pages/Finance.tsx` (tarjeta IVA, badge, filtros)
- `src/pages/ProjectDetail.tsx` (desglose visible)
