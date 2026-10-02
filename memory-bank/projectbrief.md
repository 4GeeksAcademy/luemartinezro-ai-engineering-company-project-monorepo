# Project Brief — HealthCore Digital

> **Empresa:** HealthCore  
> **Unidad:** HealthCore Digital (tecnología interna)  
> **CEO:** Dra. Sandra Okonkwo  
> **CTO:** James Osei  
> **Fecha de fundación:** 2011  
> **Sede central:** Austin, Texas, EE.UU.

---

## 1. Descripción del negocio

HealthCore es una red de **atención ambulatoria (outpatient care)** que opera **12 clínicas** en dos países:

| País | Ciudades | Clínicas |
|------|----------|----------|
| 🇺🇸 Estados Unidos | Austin (2), San Antonio, Miami, Orlando, Atlanta | 9 |
| 🇬🇧 Reino Unido | Londres (2), Mánchester | 3 |

**Facturación anual:** ~28 millones USD  
**Empleados:** ~200 personas (personal clínico, operaciones, administración, tecnología)

### Servicios que ofrece

- Atención primaria (*primary care*)
- Consultas con especialistas (*specialist consultations*)
- Gestión de enfermedades crónicas (*chronic disease management*)
- Programas de salud preventiva (*preventive health programmes*)

### Diferenciación competitiva

- Citas en el mismo día (*same-day appointments*)
- Horarios ampliados (*extended hours*)
- Personal bilingüe (inglés/español) en mercados estadounidenses

---

## 2. Problema que se resuelve

HealthCore creció de forma orgánica durante una década, pero la **infraestructura tecnológica no acompañó ese crecimiento**. Las consecuencias actuales son:

### Fragmentación de sistemas
- **2 sistemas de historia clínica electrónica (EHR)** distintos que no se comunican entre sí (uno en EE.UU., otro en Reino Unido).
- **Facturación en EE.UU.:** plataforma específica con tasa de rechazo del 14% (el doble de la media del sector).
- **Facturación en Reino Unido:** hoja de cálculo.
- **Citas en EE.UU.:** sistema telefónico sin reserva online.
- **Citas en Reino Unido:** agenda manual.
- **No existe una capa de datos compartida** entre ningún sistema.

### Problemas operativos por departamento

| Departamento | Problema principal |
|-------------|-------------------|
| 🏥 Operaciones Clínicas | 35 min/día de documentación administrativa por clínico; historiales que no cruzan sedes ni países |
| 🗓️ Paciente y Acceso | 22% de no-shows (~1.8M USD/año perdidos); sin sistema de recordatorios ni reserva online |
| 💰 Ciclo de Ingresos | 14% de rechazo de reclamaciones; facturación UK en spreadsheet; sin visión unificada |
| 🔒 Cumplimiento | Doble marco regulatorio (HIPAA + UK GDPR); auditorías incompletas; peticiones de datos manuales |
| 👥 Personas (RR.HH.) | 47 días en contratar perfiles clínicos; onboarding manual; CME en hoja de cálculo |
| 💻 Tecnología | Sin telemetría, sin logging centralizado, sin API unificada |
| 📊 Dirección Ejecutiva | Informes semanales en formatos dispares y contradictorios; sin dashboard en tiempo real |

---

## 3. Objetivos del proyecto

Construir los sistemas, flujos de trabajo y herramientas inteligentes que permitan a HealthCore operar como un **proveedor sanitario moderno, seguro, eficiente y centrado en el paciente**.

### Principios rectores

1. **Privacidad por diseño** — Todos los sistemas deben cumplir HIPAA (EE.UU.) y UK GDPR (Reino Unido). Los datos de pacientes no son negociables.
2. **Coherencia multiplataforma** — Una única fuente de verdad para datos de pacientes, citas, facturación y personal.
3. **AI aumentativa, no autónoma** — La IA asiste a clínicos y operadores; las decisiones críticas siempre tienen supervisión humana.
4. **Transfronterizo desde el día 1** — Los sistemas deben funcionar en EE.UU. y Reino Unido respetando ambos marcos legales.
5. **Deuda técnica cero en gobernanza** — Cada componente nuevo incluye documentación, tests y trazabilidad.

---

## 4. Stack tecnológico base

| Capa | Tecnología |
|------|-----------|
| **Frontend web pública** | HTML + Tailwind CSS (CDN) + TypeScript |
| **Frontend aplicaciones** | Next.js + TypeScript + Tailwind CSS |
| **Backend API** | FastAPI (Python) |
| **Tipos compartidos** | TypeScript (`@repo/shared-types`) |
| **Estilos** | Tailwind CSS vía CDN — sin archivos CSS personalizados ni estilos inline |

---

## 5. Equipo HealthCore Digital

| Rol | Persona |
|-----|---------|
| CEO / Fundadora | Dra. Sandra Okonkwo |
| CTO | James Osei (Austin, 6 personas) |
| Operaciones Clínicas | Dr. Marcus Reid (~120 clínicos) |
| Paciente y Acceso | Priya Nair (Londres) |
| Ciclo de Ingresos | Tom Callahan |
| Cumplimiento | Claire Whitfield |
| Personas (RR.HH.) | Diane Foster |