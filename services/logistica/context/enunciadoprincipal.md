Nombre del módulo
Módulo de Logística
Propósito general
El módulo de Logística será la capa encargada de administrar y coordinar las entregas generadas por los módulos de Restaurante y Negocios, centralizando la asignación de repartidores, el control del estado de cada entrega, el historial de cambios y el registro de incidencias operativas.
Su creación surge de la necesidad de evitar que Restaurante y Negocios implementen por separado la misma lógica de reparto, seguimiento y control de entregas, lo que provocaría duplicidad de funciones, estructuras y mantenimiento dentro del sistema.
En este enfoque, Paquetería permanece como un módulo independiente con su propia lógica de negocio, mientras que Logística se especializa únicamente en atender las entregas derivadas de compras o pedidos comerciales provenientes de Restaurante y Negocios.

Qué hará este módulo
El módulo de Logística tendrá como responsabilidad principal la gestión operativa de las entregas. Esto significa que:
recibirá solicitudes de entrega originadas desde Restaurante y Negocios


registrará cada entrega como una operación independiente


permitirá asignar un repartidor a cada entrega


administrará el estado actual de la entrega


guardará el historial de cambios de estado


permitirá registrar incidencias que ocurran durante el proceso


mantendrá trazabilidad básica del flujo operativo hasta la entrega final o la cancelación


En otras palabras, el módulo no se encargará de vender productos, tomar órdenes de comida ni gestionar catálogos comerciales, sino exclusivamente de la ejecución de la entrega.

Qué no hará este módulo
Para mantener un diseño claro y sostenible, el módulo de Logística no será responsable de:
administrar el catálogo de productos


administrar carritos de compra


administrar pagos comerciales del pedido original


crear pedidos de restaurante o negocios


gestionar la lógica propia de Paquetería


registrar maestros de repartidores


manejar usuarios administrativos generales


gestionar vehículos, rutas avanzadas o geolocalización compleja en esta etapa


Es decir, Logística no reemplaza a Restaurante, Negocios ni Administración; únicamente centraliza la parte de distribución o entrega.

Qué tendrá que trabajar
El módulo trabajará principalmente con estas áreas funcionales:
1. Registro de entregas
Cada vez que un pedido en Restaurante o Negocios requiera envío, ese módulo deberá generar una referencia hacia Logística, donde se registrará la entrega con su origen, cliente, dirección, monto a cobrar y estado inicial.
2. Asignación de repartidores
El módulo deberá permitir asignar un repartidor disponible a una entrega.
 La asignación la realizará el área o usuario operador correspondiente dentro del flujo logístico, utilizando los repartidores disponibles desde Administración.
3. Control de estados
La entrega deberá pasar por estados operativos, por ejemplo:
pendiente


asignada


en preparación


lista para recoger


en camino


entregada


cancelada


fallida


Esto permitirá a los módulos origen y a los usuarios finales conocer el avance de la entrega.
4. Historial de cambios
Cada cambio importante en la entrega quedará registrado para mantener trazabilidad.
5. Incidencias
Si ocurre un problema durante la entrega, el módulo permitirá registrar incidencias, por ejemplo:
cliente no responde


dirección incorrecta


problema en comercio


pedido dañado


cancelación del cliente



A quién ayudará
Este módulo beneficiará principalmente a:
Restaurante
Porque ya no tendrá que construir su propia lógica completa de entrega y podrá apoyarse en una capa central para reparto.
Negocios
Porque también delegará la operación de envío en una estructura compartida, evitando repetir la misma funcionalidad que Restaurante.
Administración
Porque podrá mantener a los repartidores en una sola fuente central, sin duplicarlos entre módulos.
Equipo de desarrollo
Porque reduce la duplicidad de código, tablas y procesos operativos, facilitando mantenimiento y escalabilidad.
Usuarios finales
Porque tendrán un flujo más ordenado y consistente para las entregas, independientemente de si la compra proviene de Restaurante o Negocios.

De quién dependerá
El módulo de Logística dependerá directamente de dos fuentes principales:
1. Dependencia de Restaurante y Negocios
Dependerá de ellos porque las entregas nacen desde los pedidos generados en esos módulos.
 Por lo tanto, Logística solo tendrá sentido cuando exista una orden o pedido previo en alguno de esos sistemas.
2. Dependencia de Administración
Dependerá de Administración para consumir la información maestra de los repartidores.
 Esto incluye:
identificación del repartidor


estado operativo


módulo en el que está trabajando


disponibilidad general


Así, Logística no almacenará al repartidor como entidad maestra, sino que consumirá su referencia desde Administración.

Cómo se comunicará con otros módulos
Comunicación con Restaurante
Cuando un pedido de restaurante requiera entrega:
Restaurante registra su pedido internamente


Restaurante envía a Logística la información mínima necesaria para generar una entrega


Logística crea el registro de entrega


Logística administra el proceso operativo


Restaurante puede consultar el estado actualizado de la entrega


Comunicación con Negocios
Se manejará de la misma forma:
Negocios registra su pedido


genera la solicitud de entrega hacia Logística


Logística crea y administra la entrega


Negocios puede consultar el progreso o resultado de la entrega


Comunicación con Administración
La comunicación con Administración será necesaria para:
obtener la lista de repartidores


validar si un repartidor está activo


saber si está disponible, ocupado o en ruta


conocer en qué módulo está operando actualmente


Cuando Logística asigne un repartidor, idealmente deberá actualizar el estado operativo del mismo en Administración, para evitar conflictos con otros módulos, especialmente con Paquetería.
Comunicación con Paquetería
No habrá dependencia operativa directa en cuanto al flujo de entregas, ya que Paquetería manejará su propia lógica y su propia operación.
 Sin embargo, ambos módulos compartirán indirectamente la fuente maestra de repartidores en Administración.
Esto significa que la relación entre Logística y Paquetería será principalmente de convivencia sobre recursos compartidos, no de dependencia funcional directa.

Qué entidades manejará
En esta etapa, el módulo trabajará con las siguientes entidades principales:
entregas


asignaciones de entrega


historial de estados de entrega


incidencias de entrega


Y consumirá desde Administración las entidades relacionadas con:
repartidores


estado operativo del repartidor



Alcance actual del diseño
Este diseño fue planteado de forma simplificada, sostenible y escalable, priorizando lo necesario para el ejercicio y para una implementación razonable, sin sobrecargar la base con elementos avanzados que todavía no serán utilizados.
Por eso, en esta etapa se decidió no incluir:
vehículos


rutas avanzadas


geolocalización en tiempo real


liquidaciones de repartidor


evidencias multimedia


tarifas dinámicas


turnos complejos


Todo esto podría añadirse más adelante si el proyecto lo requiere.

Resumen ejecutivo
El módulo de Logística será una capa compartida entre Restaurante y Negocios para centralizar la operación de entregas, evitando duplicidad de lógica y aprovechando una única estructura para asignación de repartidores, control de estados e incidencias.
 Dependerá de Restaurante y Negocios como módulos origen de las entregas, y de Administración como fuente maestra de repartidores.
 No sustituirá la lógica comercial ni la de Paquetería, sino que funcionará como un módulo operativo especializado en la ejecución de entregas comerciales.
