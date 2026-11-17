# Company HealthCore

Mi eleccion es por la compañia de salud HealthCore que esta cerca a temas que me apacionan. Los retos del sistema de salud tiene muchos desafios que lo respecta a la atencion de los pacientes y la organizacion interna de las empresas para poder brindar los servicios de calidad que se necesitan en el sistema de salud. En lo personal siempre he sentido un especial gusto por temas del sector salud y sus desafios, pues es un sector donde se usa mucho estadistica para pruebas y controles.

## Departarmentos con retos de interes
### logistica
En el departamento de logistica necesitan un motor o bot de aprobaciones que pueda ser configurado para atender las especificaciones de cada cliente particular. Y tambien, requieren una solucion que permita desde una imagen clasificar el estado del producto para posteriormente cargar la informacion en un dashboard de control.

### Relaciones comerciales y con el cliente
En el departamento de relaciones comerciales y con el cliente necesitan una integracion del sistema de CMR con los perfiles del cliente, generar informes automatizados en PDF, un panel de control de salud del cliente con puntuaciones de riesgo de renovacion (modelo churn) con alertas de renovacion en varios peridos, y un servicio que ofrezca productos relevantes a clientes potenciales (segmentacion y clasificacion de clientes).


## Retos
- En el departamento de logistica se tiene el reto de personalizar el servicio de agentes para adaptanse a las condiciones particulares de cada cliente. Y a su vez, realizar un entrenamiento de clasificacion de imagenes para que el modelo identifique el estado de los productos y su posterior clasificacion.

- En el departamento de relaciones comerciales y con el cliente el reto es la integraciones de varios sistemas para que funcionen al unisono, quizas haya que construir un sistema multiagentes para atender todos los desafios en este departamento.

## Propuesta solucion con IA
- La primera solucion se enfoca en el departamento de logistica, se creara un agente que ayude a recibir y verifcar los documentos de aprobaciones de cada cliente y que brinde la oportunidad de generar adecuaciones particulares para cada cliente. 

- Se necesita una muestra de todos los formtatos de aprobaciones que se reciben por cada cliente, luego, una lista de requerimientos o puntos a revisar en cada una de las aprobaciones, luego, una serie de imagenes que permitan determinar las condiciones de los productos recibidos, cuando los empaques estan bien y ejemplos de cuando tienen problemas para realizar el entrenamiento del modelo. 

- Para iniciar seria ideal una reunion con las personas del negocio y una serie de documentos donde se especifique claramente la necesidades y los resultados esperados del proceso.


## My AI agent Idea

- Crear una agente con un chatbot y un modelo RAG que permita clasificar todos los formatos de aprobaciones diferenciados por clientes.
- Crear un segundo agente que reconozca las imagenes de los empaques de productos y pueda generar una anotacion de la calidad de la misma. En este caso, puede ser un RAG o directamente un LLM que realice este proceso.