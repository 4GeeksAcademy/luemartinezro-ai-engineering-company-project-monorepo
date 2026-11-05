# Propuesta de arquitectura de backend — HealthCore Digital

**Fecha:** 2026-10-14  
**Destinatarios:** James Osei, CTO, y equipo de HealthCore Digital  
**Estado:** Borrador para revisión; las nuevas decisiones requieren aprobación.  
**Entregable:** Propuesta documental conforme a [prompt.md](../prompt.md). No incluye implementación.

## 1. Resumen ejecutivo

Se propone un **monolito modular con arquitectura en capas**, construido con FastAPI y organizado por dominios de negocio. Los routers atenderán HTTP, los servicios aplicarán reglas de negocio y los repositorios o adaptadores accederán a datos propios o sistemas externos. El frontend y el backend permanecerán en el monorepo, con procesos de construcción y despliegue independientes.

HealthCore necesita integrar operaciones de doce clínicas y dos países, pero su equipo tecnológico tiene seis personas. Una API modular permite unificar contratos, autorización y trazabilidad sin asumir el coste operativo de múltiples microservicios. Esta propuesta desarrolla la decisión existente ADR-004, no sustituye los EHR ni supone que las integraciones estén implementadas.

La prioridad es construir una base verificable: contratos estables, persistencia transaccional, permisos y auditoría. La automatización avanzada y la IA se incorporarían después, con supervisión humana y evaluación de sus riesgos. No se promete cumplimiento normativo ni ahorro económico por elegir una tecnología.

## 2. Alcance y contexto de negocio

El requerimiento rector es [prompt.md](../prompt.md). [CONTEXT.md](../CONTEXT.md) aporta los hechos generales de HealthCore; [CONTEXT-company.md](../CONTEXT-company.md) aporta contexto adicional de la empresa y de RR.HH. **Sus solicitudes del Talent Pipeline Tracker no forman parte de este trabajo**: no se propone implementar, migrar ni envolver su API.

HealthCore opera nueve clínicas en Estados Unidos y tres en Reino Unido, emplea a unas 200 personas y utiliza dos plataformas EHR que no se comunican. Las restricciones técnicas y las decisiones vigentes se documentan en [techContext.md](../memory-bank/techContext.md).

| Necesidad empresarial documentada | Respuesta arquitectónica propuesta | Resultado que se debe verificar |
|---|---|---|
| Dos EHR sin comunicación; 35 minutos diarios de documentación por clínico | Dominio clínico con contrato común y adaptadores específicos por EHR | Acceso autorizado y trazable sin acoplar las pantallas a cada proveedor |
| No-shows del 22%, asociados a aproximadamente USD 1,8 millones anuales en citas perdidas | Dominio de citas con transiciones controladas y futura programación persistente de recordatorios | Medición consistente de asistencia y seguimiento de entregas; no reducción garantizada |
| Rechazo de reclamaciones del 14%; facturación UK en hoja de cálculo | Dominio de facturación con reglas distintas para reclamaciones US y facturas UK | Integridad de importes, estados y trazabilidad de cambios |
| Auditorías incompletas y solicitudes de datos manuales | Autorización transversal, eventos de auditoría y flujos de solicitudes | Saber quién accedió a qué información y poder tramitar solicitudes verificadas |
| Contratación media de 47 días y CME en hoja de cálculo | Dominio de personal, credenciales y formación | Datos de plantilla coherentes y controles de caducidad; no reconstrucción del Talent Tracker |
| Informes ejecutivos tardíos o contradictorios | Dominio de informes sobre definiciones compartidas de indicadores | Métricas con periodo, fuente, denominador y fecha de actualización explícitos |

La propuesta cubre la organización del backend y sus contratos iniciales. No define algoritmos clínicos, entrena modelos de IA, selecciona proveedores EHR ni autoriza el uso de datos reales en el entorno del curso. Los ejemplos de rutas expresan diseño futuro, no endpoints ya disponibles.

## 3. Punto de partida y estado propuesto

La API actual en [services/api/README.md](../services/api/README.md) ofrece información de clínicas, departamentos y KPIs con datos en memoria. [main.py](../services/api/app/main.py) compone dos routers y un health check; configura CORS con orígenes abiertos y credenciales habilitadas. Es una base demostrativa, no una plataforma preparada para datos sanitarios reales.

| Aspecto | Base actual | Evolución propuesta |
|---|---|---|
| Organización | Routers globales de clínicas y departamentos | Módulos de negocio con capas internas y composición central |
| Datos | Información estática en memoria | PostgreSQL para datos propios; EHR como fuente clínica autorizada |
| Modelos | Schemas Pydantic en `app/models/schemas.py` | Separar contratos Pydantic de entidades de persistencia |
| Seguridad | Sin autenticación ni autorización en el punto de entrada examinado | Identidad verificada y permisos por rol, sede, recurso y jurisdicción |
| Integraciones | No acreditadas por esta base | Adaptadores definidos tras conocer contratos y permisos de los EHR |
| Operación | Health check básico | Auditoría, observabilidad, migraciones y recuperación verificable |

Las cifras estáticas actuales no constituyen mediciones en tiempo real. La migración de estructura, rutas o datos se ejecutaría en un trabajo posterior y no debe romper consumidores existentes.

## 4. Patrón elegido y alternativas

El **monolito modular** define la unidad de organización y despliegue: una aplicación FastAPI con módulos delimitados. La **arquitectura en capas** define cómo trabaja cada módulo. Son decisiones complementarias, no alternativas excluyentes.

| Alternativa | Evaluación para HealthCore |
|---|---|
| Monolito modular en capas — recomendado | Facilita transacciones, pruebas y controles compartidos; encaja con seis personas y la infraestructura local o del curso. Exige disciplina para evitar dependencias indiscriminadas entre módulos. |
| MVC clásico con vistas de servidor | No sería el patrón principal: las interfaces Next.js y HTML son sistemas separados; FastAPI entrega contratos JSON, no las vistas. La separación de responsabilidades sigue siendo útil. |
| Microservicios desde el inicio | Añaden despliegues, autenticación entre servicios, observabilidad distribuida y consistencia eventual sin una necesidad acreditada. Revisar si un dominio requiere escalado, aislamiento o evolución independiente medibles. |
| Serverless como base | No está prohibido técnicamente, pero añade decisiones de proveedor, conectividad, residencia y coste no resueltas. No hay presupuesto adicional ni necesidad demostrada de esa plataforma. |

Un único código de aplicación no obliga a almacenar todos los datos US/UK juntos ni a desplegarlo en una sola jurisdicción. La topología productiva deberá definirse con cumplimiento e infraestructura; puede reutilizar el mismo artefacto en entornos regionales separados.

## 5. Capas y límites de responsabilidad

| Capa | Responsabilidad | Lo que debe evitar |
|---|---|---|
| Router | Validar contratos HTTP, aplicar dependencias, invocar casos de uso y mapear respuestas | Consultas SQL directas, reglas clínicas o llamadas EHR mezcladas con HTTP |
| Servicio | Reglas de negocio, transiciones, alcance autorizado y coordinación transaccional | Depender de pantallas Next.js o de detalles del protocolo de un proveedor |
| Repositorio | Lectura y escritura de datos propios mediante una sesión controlada | Tomar decisiones de negocio o hacer commits que impidan una transacción del caso de uso |
| Adaptador de integración | Traducir contratos externos y gestionar errores, timeouts y capacidades | Presentar una respuesta fallida o incompleta como historial válido |
| Infraestructura transversal | Configuración, identidad, sesiones, auditoría técnica y observabilidad | Convertirse en un contenedor de reglas de todos los departamentos |

La autorización inicial puede inyectarse con `Depends`; el servicio debe además comprobar el acceso al recurso concreto antes de leerlo o modificarlo. Un rol por sí solo no autoriza todos los pacientes ni todas las sedes.

Cada módulo es dueño de sus escrituras. Un módulo que necesita información de otro utiliza un servicio explícito o una consulta de informes autorizada, no modifica sus tablas directamente. Las dependencias deben ser acíclicas; la coordinación entre varios módulos pertenece a un caso de uso identificado.

## 6. Estructura de carpetas propuesta

```text
services/api/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── core/
│   │   ├── settings.py
│   │   ├── security.py
│   │   ├── errors.py
│   │   └── observability.py
│   ├── db/
│   │   ├── base.py
│   │   └── session.py
│   ├── modules/
│   │   ├── clinics/
│   │   ├── clinical/
│   │   ├── appointments/
│   │   ├── billing/
│   │   ├── workforce/
│   │   ├── compliance/
│   │   └── reporting/
│   └── integrations/
│       ├── ehr_us/
│       └── ehr_uk/
├── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/
├── .env.example
├── requirements.txt
└── README.md
```

Dentro de cada módulo se crearían `router.py`, `schemas.py` y `service.py`; `repository.py` y `models.py` se añadirían solamente cuando exista persistencia propia. Los archivos de paquete `__init__.py` se incluyen donde proceda. No se requieren repositorios vacíos ni una interfaz abstracta por cada clase.

- `main.py` compone la aplicación, registra middleware y routers; no concentra el negocio.
- `core/` reúne configuración tipada, verificación de identidad, errores y observabilidad compartidos.
- `db/` gestiona sesiones y base ORM; `migrations/` contiene cambios versionados de esquema.
- `modules/` mantiene juntos los cambios de cada dominio; no replica el organigrama ni crea un router por dashboard.
- `integrations/` aísla los contratos US/UK. Tener dos carpetas no garantiza aislamiento legal o de almacenamiento.
- `tests/` separa reglas de negocio, comportamiento persistente y contratos API/integración.

**Límites de dominio:** `clinics` posee sedes y su catálogo operativo; `clinical` posee contratos de pacientes y acceso a historia clínica; `appointments` posee agendas, reserva y asistencia; `billing` posee facturación; `workforce` posee plantilla, credenciales y CME; `compliance` posee expedientes de auditoría y solicitudes; `reporting` posee definiciones y consultas de indicadores. Los perfiles clínicos expuestos por `clinical` son proyecciones autorizadas de personal, no una segunda fuente de credenciales.

La estructura actual `app/routers/` puede convivir temporalmente con nuevos módulos. Los departamentos existentes se mantendrían como catálogo informativo, mientras sus indicadores evolucionan hacia informes calculados. Esta propuesta no renombra archivos existentes.

## 7. Organización de endpoints y routers

Las rutas de negocio usarían el prefijo **`/api/v1`**, nombres de recursos en plural y tags por dominio. Cada módulo expone un `APIRouter` que la aplicación registra mediante `include_router`. La siguiente tabla presenta ejemplos iniciales; la enumeración no implica que todos se construyan en el primer sprint.

| Dominio / router | Métodos y rutas propuestas | Propósito y acceso |
|---|---|---|
| Clínicas / `clinics` | `GET /api/v1/clinics`, `GET /api/v1/clinics/{clinic_id}` | Consultar sedes; filtros por país y servicio. Separar catálogo público de campos operativos restringidos. |
| Clínico / `clinical` | `GET /api/v1/patients/{patient_id}`, `GET /api/v1/patients/{patient_id}/clinical-records`, `GET /api/v1/clinicians` | Acceso mínimo autorizado a datos e historia vía adaptadores. No exponer búsquedas ilimitadas de pacientes ni acceso clínico a RR.HH. |
| Citas / `appointments` | `GET, POST /api/v1/appointments`, `GET, PATCH /api/v1/appointments/{appointment_id}` | Consultar, reservar y actualizar bajo reglas de disponibilidad y transición. Pacientes solo acceden a sus propias citas; operadores, a sedes autorizadas. |
| Citas / `appointments` | `POST /api/v1/appointments/{appointment_id}/reminders` | Solicitar un recordatorio autorizado y persistente, con estado de entrega; no envío inmediato garantizado. |
| Facturación / `billing` | `GET, POST /api/v1/claims`, `GET, PATCH /api/v1/claims/{claim_id}`; `GET, POST /api/v1/invoices`, `GET /api/v1/invoices/{invoice_id}` | Reclamaciones US y facturas UK con contratos diferenciados. Acceso de ciclo de ingresos, sin envío a pagadores implícito por crear un registro. |
| Personal / `workforce` | `GET /api/v1/staff`, `GET /api/v1/staff/{staff_id}`, `GET, POST /api/v1/staff/{staff_id}/cme-records` | Plantilla y formación bajo permisos de RR.HH., supervisión o acceso propio. No endpoints de candidatos en este alcance. |
| Cumplimiento / `compliance` | `GET /api/v1/audit-events`, `POST /api/v1/data-requests`, `GET /api/v1/data-requests/{request_id}` | Consultar auditoría y tramitar solicitudes verificadas; nunca descargar historias solo por conocer un identificador. |
| Informes / `reporting` | `GET /api/v1/reports/kpis` | Métricas por sede, país y periodo; datos agregados con alcance autorizado y protección contra reidentificación. |
| Sistema | `GET /health` | Liveness fuera del versionado de negocio y sin detalles sensibles. Un readiness futuro comprobaría dependencias locales esenciales sin revelar secretos. |

Los listados tendrán paginación limitada, filtros validados y orden estable. Los tiempos operativos se guardarán con referencia UTC y zona de la clínica para reglas de agenda; los informes definirán la zona y el corte temporal. Importes usarán decimal y moneda explícita; no se sumarán USD y GBP sin una política aprobada de conversión.

Los errores deberán tener códigos estables y un identificador de correlación, sin notas clínicas, SQL ni secretos. Se diferenciarán validación, falta de permisos, conflicto de estado y fallo de integración. Las actualizaciones sensibles usarán control de versión o condición equivalente para rechazar sobrescrituras concurrentes.

La incorporación de `/api/v1` no eliminaría de inmediato `/clinics` o `/departments`: primero se inventariarían sus consumidores, se acordaría una transición compatible y se verificarían contratos. Un cambio incompatible requeriría una nueva versión y un plan de retirada.

## 8. Investigación: convenciones FastAPI y su aplicación

Se consultaron las fuentes oficiales indicadas en la sección 14 el **2026-10-14**. FastAPI muestra cómo dividir una aplicación en paquetes, separar routers y reunirlos en una aplicación principal; **no obliga a un patrón universal de carpetas ni prescribe capas de servicios y repositorios**.

| Hallazgo de la documentación | Aplicación en esta propuesta |
|---|---|
| Bigger Applications presenta `APIRouter`, `include_router`, prefijos, tags y dependencias por router [F1] | Una aplicación compone módulos por dominio, con contratos documentados en OpenAPI. Los routers no son microservicios aislados. |
| Las dependencias pueden compartirse entre operaciones y routers [F1] | Inyectar identidad, contexto autorizado y sesión; permitir sustituciones en pruebas sin repetir verificación en cada endpoint. |
| Settings recomienda `BaseSettings` de `pydantic-settings` y configuración por variables de entorno [F2] | Centralizar configuración validada en `core/settings.py`; separar valores de desarrollo, pruebas y producción. |
| CORS distingue orígenes por protocolo, host y puerto, y exige configuración explícita con credenciales [F3] | Configurar allowlists por entorno; evitar trasladar los comodines actuales a un sistema real. |

La organización por módulos y las capas internas son elecciones de HealthCore para controlar complejidad y seguridad. Pydantic representa solicitudes y respuestas; los modelos ORM representarían almacenamiento. No deben exponerse automáticamente columnas internas, credenciales o datos sensibles porque existan en una entidad persistente.

## 9. Frontend y backend como sistemas separados

**Monorepo, no aplicación única.** Se conservan `uis/` y `services/api/` porque ya separan responsabilidades y facilitan cambios coordinados. Repositorios independientes podrían servir a equipos con ciclos y permisos distintos, pero aportarían coordinación adicional sin una necesidad actual. Cada aplicación mantiene dependencias y configuración propias; no importa código interno del backend ni accede a su base de datos.

La comunicación será por HTTPS y API REST/JSON. OpenAPI será la referencia de los contratos. Los clientes TypeScript deberán generarse o contrastarse con ese contrato, no mantenerse como copia manual independiente de modelos Python. Un pipeline futuro verificará cambios incompatibles antes de desplegar. Compartir repositorio no sincroniza automáticamente los tipos ni implica desplegar frontend y backend juntos.

| Configuración propuesta | Uso y límites |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL no secreta para llamadas desde el navegador. Next.js la incorpora durante el build: cada entorno debe construir con el valor correcto [F4]. |
| `API_URL` | URL interna para llamadas desde el servidor Next.js; no debe serializarse hacia el cliente. |
| `DATABASE_URL`, configuración de identidad y credenciales EHR | Solo backend o servidor autorizado; nunca variables `NEXT_PUBLIC_*`, código del cliente ni archivos versionados. |
| `CORS_ALLOWED_ORIGINS` | Lista exacta de frontends autorizados por entorno. Métodos y cabeceras también explícitos si se permiten credenciales. |
| `.env.example` | Nombres y ejemplos no sensibles; los secretos reales se suministran fuera de Git. |

Para desarrollo se podrían usar frontend `http://localhost:3000` y backend `http://localhost:8000`; son ejemplos, no direcciones productivas. Son orígenes distintos. CORS afecta llamadas del navegador, no autentica usuarios ni protege por sí solo peticiones servidor a servidor. Usar un proxy del mismo origen puede simplificar CORS, pero no sustituye permisos.

La sesión se definirá al elegir el proveedor de identidad. Si se usan cookies, deberán ser seguras y acompañarse de protección CSRF para operaciones que cambian estado; si se usan tokens, se verifican emisor, audiencia, expiración y permisos. No se enviarán secretos de aplicación al navegador. Builds, comprobaciones y despliegues independientes deben conservar compatibilidad de la API durante sus ventanas de actualización.

## 10. Decisiones técnicas iniciales recomendadas

| Decisión | Justificación, consecuencia y límite |
|---|---|
| FastAPI y Python 3.11+ | Mantener el stack acordado en ADR-004, con validación y OpenAPI. No cambiar framework para iniciar el siguiente hito. |
| PostgreSQL para datos propios | Citas, estados e importes requieren transacciones, restricciones e integridad referencial. Despliegue local o en infraestructura autorizada del curso, sujeto a capacidad disponible; no servicio cloud nuevo implícito. |
| SQLAlchemy y Alembic | Separar persistencia de contratos HTTP y versionar cambios de esquema. Cada caso de uso delimita su transacción; probar migraciones y restauración. Son recomendaciones, no dependencias instaladas. |
| SQLite solo para prototipo excepcional | Si no se dispone de PostgreSQL, documentar el bloqueo y las diferencias; no considerar que ese prototipo valida concurrencia ni operación productiva. |
| Configuración Pydantic y `pydantic-settings` | Detectar valores inválidos al iniciar y mantener secretos fuera del código. Los entornos de prueba tendrán configuración independiente. |
| Identidad OIDC/OAuth2 y autorización propia del dominio | Aprovechar estándares y un proveedor por seleccionar; no desarrollar un sistema de contraseñas improvisado. Identidad verificada no equivale a permiso sobre un paciente. |
| Adaptadores EHR independientes | Traducir a contratos mínimos comunes manteniendo identificador, fuente y procedencia. Confirmar si cada proveedor ofrece APIs, FHIR, exportaciones o webhooks; no asumir capacidades. |
| Observabilidad sin datos clínicos en logs | Medir latencia, fallos y frescura; correlacionar solicitudes sin registrar cuerpos sensibles. Separar auditoría de acceso de logging de diagnóstico. |

Las operaciones bloqueantes no deben ejecutarse directamente dentro de handlers asíncronos. Elegir un modelo de acceso a datos coherente y probar su comportamiento evita que una llamada EHR o una consulta bloquee otras solicitudes.

Para recordatorios e informes programados se recomienda, cuando se implemente ese flujo, un registro persistente de trabajos y un worker del mismo proyecto. La creación del trabajo se coordinará con la transacción de negocio; se definirán reintentos acotados, claves de deduplicación y recuperación tras reinicio. `BackgroundTasks` no ofrece por sí solo entrega durable. Un broker adicional requiere necesidad demostrada, no se añade como requisito inicial.

Los adaptadores definirán timeouts, límites, reintentos solo cuando sean seguros y señales explícitas de datos incompletos. No se promete atomicidad entre PostgreSQL y un EHR remoto: las escrituras externas necesitarán idempotencia y reconciliación según las capacidades verificadas del proveedor.

## 11. Seguridad y gobierno del dato

La API unifica acceso y contratos; **no es una autorización para reunir todas las historias en una base global**. Cada EHR conserva su papel de fuente clínica autorizada. Cualquier caché o copia deberá tener finalidad, permisos, procedencia y retención definidos.

Se recomienda separar almacenamiento y credenciales por jurisdicción hasta que Claire Whitfield y el equipo técnico aprueben el diseño de tratamiento y transferencia. La residencia de datos no se presenta como obligación universal de HIPAA o UK GDPR ni como garantía suficiente de cumplimiento. Una vista ejecutiva agregada debe evaluarse también por el riesgo de identificar pacientes de grupos pequeños.

Los controles mínimos propuestos son: autorización por objeto y sede; mínimo privilegio; cifrado en tránsito y en reposo; gestión y rotación de secretos; auditoría de lecturas y escrituras sensibles con actor, acción, recurso, hora, resultado y correlación; acceso restringido y protección contra alteraciones de la auditoría; copias de seguridad y restauraciones probadas. La auditoría no debe copiar el contenido clínico consultado. Los accesos sensibles deberán seguir una política explícita ante fallos de registro, no continuar silenciosamente.

Exportación, rectificación o borrado se tratarán como solicitudes verificadas, no como un `DELETE` irrestricto. Las bases legales, obligaciones de conservación clínica, excepciones y transferencias internacionales requieren evaluación específica. No todo tratamiento depende del consentimiento ni toda solicitud permite borrar una historia clínica.

El entorno académico utilizará datos sintéticos o debidamente anonimizados. Un despliegue con pacientes reales requiere aprobación de cumplimiento, evaluación de riesgos, contratos pertinentes y procedimientos de incidentes. Las futuras funciones de IA necesitarían controles adicionales y revisión humana antes de acciones clínicas o financieras relevantes.

## 12. Riesgos y puntos de atención

| Riesgo si no se sigue la propuesta | Consecuencia para HealthCore | Mitigación y comprobación |
|---|---|---|
| Reglas y SQL dentro de routers | Validaciones inconsistentes entre sedes y cambios difíciles de probar | Casos de uso en servicios; revisión de límites y pruebas unitarias de transiciones |
| Tipos frontend y backend divergentes | Pantallas interpretan mal estados o envían campos inválidos | Contrato OpenAPI, comprobaciones de compatibilidad y pruebas de cliente |
| Permisos solo por rol o CORS | Acceso indebido a pacientes, plantilla o facturación | Autorización por recurso, pruebas negativas por sede/jurisdicción y auditoría |
| Datos US/UK unidos sin evaluación | Transferencias indebidas o uso incompatible con la finalidad | Separación inicial y revisión de políticas, infraestructura y contratos antes de cualquier transferencia |
| Fallos EHR ocultos o reintentos inseguros | Historia aparentemente completa o acciones externas duplicadas | Estado de fuente/frescura, timeouts, idempotencia cuando exista y reconciliación |
| Trabajos solo en memoria | Recordatorios e informes desaparecen tras un reinicio | Persistencia, estado de entrega y pruebas de recuperación/deduplicación |
| Actualizaciones concurrentes sin control | Pérdida de cambios en citas o facturación | Transacciones, restricciones y control de versión; pruebas con escritores simultáneos |
| KPIs sin definición o mezcla de monedas | Dirección recibe cifras contradictorias o engañosas | Diccionario de métricas, periodo y denominador explícitos; moneda y fuente visibles |
| Cambio brusco de rutas actuales | Frontends dejan de funcionar durante un despliegue | Inventario de consumidores, transición compatible y pruebas de contrato |

La arquitectura en capas aumenta el número de archivos y exige disciplina. Se mitiga evitando capas vacías y abstracciones sin necesidad: añadir separación cuando haya una regla, persistencia o integración concreta, no por completar un árbol de carpetas.

## 13. Evolución y criterios de aceptación

La secuencia siguiente es orientativa, no un calendario comprometido:

1. **Acordar contratos y límites:** validar módulos, matriz de acceso y definiciones de indicadores; inventariar consumidores y contratos EHR.
2. **Establecer la base:** configuración, persistencia, migraciones, identidad, auditoría y pruebas con datos sintéticos; conservar compatibilidad con rutas actuales.
3. **Implementar un flujo acotado:** seleccionar con responsables de negocio un caso de uso y una sede; validar reglas y recuperación antes de ampliar alcance.
4. **Integrar y automatizar gradualmente:** activar adaptadores, trabajos durables e informes; evaluar necesidades de escalado con métricas reales.
5. **Evaluar IA y evolución de despliegue:** solo tras disponer de datos gobernados, métricas y supervisión; reconsiderar servicios independientes cuando existan motivos verificables.

Una implementación futura deberá demostrar: pruebas unitarias de reglas; integración con PostgreSQL y migraciones; contratos HTTP y adaptadores con dobles de prueba; denegación de accesos fuera de alcance; registro de auditoría sin exposición clínica; conflictos concurrentes detectados; recuperación de trabajos y backups. Los objetivos de disponibilidad, latencia, pérdida de datos tolerable y tiempo de recuperación se acordarán con negocio e infraestructura, no se inventan aquí.

| Decisión pendiente | Responsable de validación | Condición antes de avanzar |
|---|---|---|
| APIs y capacidades reales de los dos EHR | James Osei y proveedores, con Operaciones Clínicas | Contratos y permisos conocidos antes de desarrollar adaptadores reales |
| Almacenamiento, retención y transferencias US/UK | Claire Whitfield y Tecnología | Evaluación aprobada antes de usar datos personales reales |
| Proveedor de identidad y matriz de acceso | James Osei, Cumplimiento y responsables de área | Flujos de sesión y pruebas de permisos definidos |
| Capacidad PostgreSQL, regiones y recuperación | James Osei y equipo técnico | Infraestructura y procedimientos viables; ninguna compra cloud implícita |
| Primer caso de uso y objetivos medibles | CTO y responsable del dominio elegido | Alcance y criterio de éxito acordados, sin promesas de ahorro automático |

Este documento no añade un ADR aceptado. Tras su aprobación, las decisiones acordadas se registrarían en el banco de memoria y los ADR correspondientes.

## 14. Fuentes y trazabilidad

### Fuentes empresariales y del repositorio

- [prompt.md](../prompt.md): requisitos del entregable; patrón, estructura, routers, investigación y riesgos.
- [CONTEXT.md](../CONTEXT.md): hechos del negocio, responsables, problemas y necesidades departamentales.
- [CONTEXT-company.md](../CONTEXT-company.md): contexto adicional; sus tareas específicas quedan excluidas.
- [memory-bank/techContext.md](../memory-bank/techContext.md): stack, ADR-004, restricciones de equipo, regulación e infraestructura.
- [services/api/README.md](../services/api/README.md), [main.py](../services/api/app/main.py) y [schemas.py](../services/api/app/models/schemas.py): punto de partida observado, no evidencia de una plataforma productiva.

### Documentación oficial consultada el 2026-10-14

- **[F1]** FastAPI, [Bigger Applications — Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/): paquetes, routers, composición y dependencias; fundamenta secciones 5 a 8.
- **[F2]** FastAPI, [Settings and Environment Variables](https://fastapi.tiangolo.com/advanced/settings/): `pydantic-settings`, variables de entorno y configuración reutilizable; fundamenta secciones 8 a 10.
- **[F3]** FastAPI, [CORS](https://fastapi.tiangolo.com/tutorial/cors/): orígenes, credenciales y restricciones de comodines; fundamenta secciones 8 y 9.
- **[F4]** Next.js, [Environment Variables](https://nextjs.org/docs/app/guides/environment-variables): separación servidor/navegador y valores públicos fijados al construir; fundamenta sección 9.

Las recomendaciones de monolito modular, PostgreSQL, SQLAlchemy, Alembic, seguridad y gobierno del dato son razonamiento de diseño para HealthCore, no requisitos impuestos por estas páginas ni asesoramiento legal.