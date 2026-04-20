<<<<<<< HEAD
# Pedidos Now (provisional)

Aplicación de pedidos en línea, desarrollada como proyecto académico para Arquitectura de Software II.  
“Pedidos Now” busca conectar clientes, negocios/restaurantes, repartidores y soporte al cliente mediante una arquitectura basada en servicios, con un **broker** (mediador) entre el front-end y los microservicios.

---

## Objetivo del proyecto

- Permitir a usuarios (clientes) explorar comercios/restaurantes y realizar pedidos.
- Gestionar el ciclo completo del pedido: creación, cobro, preparación, asignación de repartidor, entrega y soporte.
- Facilitar administración, contabilidad, descuentos y comunicación (chat/soporte automatizado).

---

## Tecnologías

### Backend
- **Node.js** (APIs y servicios).
- **MySQL** (persistencia de datos).

### Frontend
- **React** (interfaces web).
- **Tailwind CSS** (estilos y UI).

---

## Arquitectura

### Enfoque general
El proyecto se implementará con una arquitectura **por capas (Layered / MVC)** dentro de cada servicio, separando responsabilidades para mantener el código legible y mantenible.

Base general por servicio:
- **Controller / Routes**: recibe requests, valida y delega.
- **Service / Use Cases**: lógica de negocio (reglas).
- **Repository / DAO**: acceso a MySQL.
- **Models / Entities**: estructuras de dominio.

### Macro-arquitectura (Front → Broker → Servicios)
Flujo principal:

1. **UI** (React) realiza una solicitud (ej. crear pedido, ver restaurantes).
2. **Broker** recibe la solicitud y actúa como mediador:
   - Enruta al servicio correspondiente.
   - Aplica validaciones comunes / autenticación (pendiente).
   - Unifica respuestas/errores y mantiene consistencia.
3. **Microservicio** ejecuta la lógica y persiste/consulta en **MySQL**.
4. La respuesta retorna **Servicio → Broker → UI**.

---

## Servicios (Back-end)

Los microservicios planificados son:

- **Restaurantes**
- **Negocios**
- **Bancario**
- **Paquetería**
- **Administración y Contabilidad**
- **Descuentos**
- **Cobros**
- **Servicio al Cliente Automatizado**
- **Chats**

### Intermediario / Mediador
- **Broker** (Gateway / mediador entre UIs y microservicios)

---

## UIs (Front-end)

- **UI Clientes**
- **UI Repartidores**
- **UI Empresas / Negocios**
- **UI Agentes de Servicio al Cliente**

---

## Metodología de desarrollo: SCRUM

Trabajaremos con SCRUM para organizar y entregar incrementos funcionales de forma iterativa.

- **Product Backlog**: lista priorizada de historias (features).
- **Sprint Backlog**: selección de historias para el sprint.
- **Sprints**: iteraciones cortas (1–2 semanas, según cada grupo).
- **Daily (breve)**: seguimiento de avances/bloqueos.
- **Review**: demo del incremento.
- **Retrospective**: mejoras del proceso para el siguiente sprint.

Definiciones sugeridas:
- **Definition of Ready (DoR)**: historia entendida, criterios de aceptación claros.
- **Definition of Done (DoD)**: código en main, probado, con documentación mínima y sin romper build.

## Flujo de colaboradores y participantes

Para mantener el control y que sea amigable para quienes no dominan Git, se sugiere este modelo:

**Roles**
1. **Lideres de grupo (colaboradores)** 
   - Tienen permisos de escritura en el repositorio principal.
   - Revisan y aprueban PRs de su servicio/UI.
   - Son responsables de mantener su parte estable.
2. **Participantes (no líderes)**
   - Trabajan mediante fork (recomendado) o ramas (si el líder lo permite).
   - Envían PRs para que el líder revise.


**Flujo de trabajo (colaboración)**

**Participante**
1. Hacer fork del repositorio
2. Crear una rama en su fork: feature/...
3. Hacer commits y push a su fork
4. Abrir un Pull Request (PR) hacia el repositorio principal (o hacia la rama del líder, si así lo manejan)

**Líder**
1. Revisar el PR (código, estructura y que no rompa nada)
2. Solicitar cambios o aprobar
3. Hacer merge (idealmente usando Squash merge para mantener el historial limpio)

**Reglas mínimas de PR (simples)**
1. 1 PR = 1 objetivo claro
2. El PR debe indicar:
    - Qué se cambió
    - Cómo probarlo
    - Qué módulo afecta (por ejemplo: /broker, /services/cobros, /apps/ui-clientes, etc.)

Evitar PRs enormes (mejor dividir por partes)

## Colaboradores
Aquí se detallara un listado de todos los colaboradores del proyecto, agradeciendo desde ya la participación de cada uno de ellos.
=======

