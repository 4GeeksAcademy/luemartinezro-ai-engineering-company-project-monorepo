[ROL]

Eres un programador fullstack y  desarrollador de software


[CONTEXTO]

Aquí empieza tu proyecto de empresa. Tienes un repositorio de plantilla y un escenario de compañía — pero aún no hay un sistema coherente. Todo lo que construyas de aquí en adelante — interfaces, APIs, agentes, automatizaciones — vivirá en este mismo espacio. Antes de añadir features, hay que construir la infraestructura que hará que ese código sea coherente, mantenible y AI-ready.

Tu tech lead ha dejado una tarea pendiente en el tablero desde hace dos semanas:

    Asunto: Monorepo AI Setup — necesitamos esto esta semana

    Hola,

    He revisado el estado del repo y estamos empezando sin estructura de soporte. Si meto un agente sobre esto ahora mismo va a cometer errores que nos van a costar el triple de tiempo.

    Necesito que el repositorio tenga un contexto claro y persistente antes de que sigamos añadiendo features: qué es la empresa, qué estamos construyendo, cuáles son las reglas del proyecto. Eso va al banco de memoria. El agente tiene que leerlo antes de tocar nada — y tiene que incluir tanto el contexto de negocio como el técnico, no solo uno de los dos.

    También quiero un AGENTS.md que defina cómo opera cualquier agente en este repo — qué flujo tiene que seguir antes de hacer un commit. Nada de agentes que escriban código sin pasar por el proceso de entrega.

    Para las reglas más específicas usaremos la carpeta .agents/. Piensa en qué convenciones necesita conocer el agente para no romper lo que ya tenemos, y documéntalas ahí con el alcance correcto.

    Por último, quiero que formalicemos al menos una skill que capture una tarea recurrente de nuestro flujo de trabajo — algo que el agente pueda ejecutar de forma consistente y que podamos reutilizar a medida que el proyecto crezca. Que tenga criterios de aceptación explícitos: si no se puede verificar, no vale.

    En cuanto a la capa de aplicación, sigue la estructura del monorepo de plantilla: el website de cara al público en ./uis/website y las aplicaciones internas en ./uis/backoffice con su propio layout y vista de entrada para tener algo visible desde el primer día. Cualquier servicio backend va dentro de /services.

    Cuando termines, PR y avísame.

    — [Tu tech lead]

💡 Banco de memoria, reglas y skills: qué son y por qué importan

Un banco de memoria es un conjunto de archivos Markdown que el agente de programación lee antes de cada sesión. No es documentación estática — es el contexto activo del proyecto: negocio, decisiones de arquitectura tomadas, restricciones en vigor y estado actual del desarrollo. Sin él, cada sesión del agente empieza desde cero y repite los mismos errores. Por eso, el banco de memoria debe actualizarse cada vez que el proyecto evoluciona: nuevas decisiones, cambios de arquitectura, features completadas, problemas encontrados. Un banco de memoria que no se mantiene al día deja de ser útil en cuestión de días. ¡Nunca lo olvides!

La estructura esperada para la configuración de agentes en el monorepo es la siguiente:

./.agents
└─ /rules
   └─ <rule-name>.md
└─ /skills
   └─ /<skill>
      └─ SKILL.md
./memory-bank
└─ <context>.md

    ⚠️ Atención: No confundas .agents/ con las carpetas /agents y /skills que verás en el monorepo. .agents/ es el directorio de configuración para los agentes de código (Cursor, Windsurf, Claude Code…) — aquí van las reglas y skills que le enseñan al agente cómo trabajar en este repositorio. Las carpetas /agents y /skills son para los agentes e integraciones que construirás para la empresa en módulos posteriores. Son cosas distintas: una configura cómo trabaja tu herramienta de desarrollo, la otra es código de producto.

Antes de crear ninguna carpeta nueva, revisa el README.md de cada carpeta del monorepo — el repositorio de plantilla incluye instrucciones sobre qué debe ir en cada espacio. Siguiéndolas evitarás duplicidades y mantendrás una estructura que el agente pueda navegar sin ambigüedad.

Las reglas de desarrollo (AGENTS.md y .agents/rules/) son el protocolo que el agente sigue automáticamente: qué leer al empezar, qué pasos son obligatorios antes de cada commit, qué convenciones respetar y cuándo detenerse y preguntar. Actúan como el acuerdo de equipo que garantiza que el agente no tome decisiones por su cuenta donde no debería.

Una skill de agente es una instrucción estructurada y reutilizable: más concreta que una regla genérica, con inputs definidos, output esperado y criterios de aceptación verificables. Una buena skill tiene un único objetivo y puede testearse de forma independiente.


[OUTPUT]

## Cómo iniciar el proyecto

Lee los archivos  PROMPT.md y CONTEXT.md en la raíz de tu monorepo antes de hacer nada más. Ese archivo debe ser el briefing de tu empresa de 00-general-contexts (CONTEXT-<company>-briefing.es.md / .en.md) — no el placeholder vacío de la plantilla. El banco de memoria que vas a construir debe describir la empresa y el proyecto de tu escenario específico — no una empresa ficticia genérica.

## Lo que debes hacer

* Crear la carpeta memory-bank/ en la raiz del monorepo con al menos los siguientes archivos:
	- projectbrief.md -- descripcion del negocio, los objetivos del proyecto y el problema que se resuelve.
	- techContext.md  -- stack tecnologico, decisiones de arquitecturas tomadas y restricciones tecnicas.
	- progress.md     -- estado actual del desarrollo y proximos pasos previstos.
	
* Crear el archivo AGENTS.md en la raiz del monorepo que defina:
	- Que archivos del banco de memoria debe leer el agente al inicio de cada sesion
	- El flujo obligatorio antes de commit (minimo 4 pasos ordenados y explicitos)
	- Las carpetas y archivos que el agente no debe modificar sin confirmacion explicita del desarrollador

* Crear la carpeta .agents/ con al menoS una regla de desarrollo documentada con su alcance de aplicacion (siempre activa, por patron de archivo o solicitada por el agente). Usar esta regla para este caso y documentarla: 
	- Use Tailwind CSS via CDN for all styling - no custom Custom CSS files, no inline style attributes.

* Implementar al menos skill de agente para una tarea recurrente del fluto de trabajo con:
	- Un objetivo unico y claramente definido
	- Inputs documentados
	- Criterios de aceptacion explicitos y verificables

⚠️ IMPORTANTE: El banco de memoria, las reglas y la skill deben estar alineados con los datos, procesos y restricciones del CONTEXT.md de tu monorepo (el briefing de tu empresa). Una infraestructura genérica — o construida sobre el placeholder de plantilla sin reemplazar — no será aceptada.

## Estructura de aplicacion

- Iniciar la estructrura frontend dentro de /uis en el monorepo siguiendo la estructura del repositorio de plantilla.
- Crear el proyecto de cara al publico en ./uis/website:
	- La ruta de inicio (/) renderiza una web corporativa alineada con el briefing de tu empresa en CONTEXT.md
	- El contenido se construye con componentes reutilizables y estilos coherentes con la identidad visual de la empresa.
- Crear la aplicacion interna en ./uis/backoffice:
	- Ruta / accesible con una vista de entrada basica (pantalla de bienvenida o estructura vacia de dashboard)
	- Layout propio, separado del layout de la web publica en ./uis/website.
	- Al menos un fragmento de logica o datos relevantes para la empresa, tomados de CONTEXT.md, visible en la interfaz - no solo en consola o terminal.
- Colocar cualquier servicio backend bajo /services, siguiendo las convenciones del monorepo de plantilla.

[DESIGN]


- use a color traditional for help companies, like as {#92eaff	(146,234,255), #75d4ff	(117,212,255), #0069ff	(0,105,255),
#0031c4	(0,49,196), #0016a2	(0,22,162)}