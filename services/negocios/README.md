# Backend del proyecto - Guía de trabajo del equipo

## Descripción general
Este repositorio contiene el backend del proyecto, desarrollado con **Node.js**, **TypeScript**, **NestJS** y **Prisma**.

La finalidad de este README es que todos los integrantes del equipo trabajen de forma ordenada, evitando conflictos y manteniendo una versión estable del proyecto en GitHub.

---

## Estructura general del proyecto

La estructura principal del repositorio es la siguiente:

```text
backend/
├── scripts/
└── services/
    └── business-service/
        ├── prisma/
        ├── src/
        ├── test/
        ├── package.json
        ├── package-lock.json
        ├── .env.example
        └── README.md
```

Dentro de `src/modules/` ya existe una organización por módulos, por ejemplo:

- `business`
- `deliveries`
- `delivery-fee-adjustments`
- `inventory`
- `metrics`
- `orders`
- `product-types`
- `products`
- `promotions`
- `schedules`
- `support`
- `internal`

Esto permite que cada integrante pueda trabajar en una parte concreta del sistema sin mezclar responsabilidades.

---

## Tecnologías principales

- Node.js
- TypeScript
- NestJS
- Prisma
- MySQL / MariaDB
- Swagger
- Jest

---

## Reglas importantes antes de trabajar

### 1. Nunca subir archivos sensibles
No se debe subir al repositorio:

- `.env`
- credenciales reales
- contraseñas
- tokens
- llaves privadas

Solo se debe subir `.env.example` con variables de ejemplo, sin datos reales.

> **Importante:** antes de subir este proyecto, revisen `.env.example` y reemplacen cualquier valor real por marcadores de ejemplo.

Ejemplo correcto:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL="mysql://usuario:password@localhost:3306/nombre_bd"
```

### 2. No subir dependencias ni archivos compilados
No se debe subir:

- `node_modules/`
- `dist/`
- `coverage/`

Para eso se utiliza `.gitignore`.

### 3. No trabajar directamente en `main`
La rama `main` debe mantenerse como la versión más estable del proyecto.

Ningún integrante debe desarrollar una funcionalidad grande directamente sobre `main`.

---

## Flujo de trabajo del equipo

El flujo de trabajo oficial del proyecto será:

1. `main` será la rama estable.
2. Cada integrante trabajará en una rama propia.
3. Cada cambio se subirá a GitHub en esa rama.
4. Luego se creará un **Pull Request** hacia `main`.
5. Los cambios se revisarán antes de fusionarse.

---

## Convención de nombres para ramas

Se recomienda usar ramas con nombres claros.

### Para nuevas funcionalidades
```text
feature/nombre-funcionalidad
```

Ejemplos:
- `feature/inventario`
- `feature/productos`
- `feature/pedidos`
- `feature/promociones`

### Para correcciones
```text
fix/nombre-correccion
```

Ejemplos:
- `fix/swagger`
- `fix/validacion-env`
- `fix/prisma-config`

### Para documentación
```text
docs/nombre-documento
```

Ejemplo:
- `docs/readme-inicial`

---

## Primeros pasos para cada integrante

Una vez que el repositorio ya exista en GitHub y el integrante haya sido agregado como colaborador, debe hacer lo siguiente.

### 1. Clonar el repositorio
```bash
git clone https://github.com/USUARIO/NOMBRE-REPOSITORIO.git
```

### 2. Entrar a la carpeta del proyecto
```bash
cd NOMBRE-REPOSITORIO
```

### 3. Ubicarse en el servicio backend
```bash
cd services/business-service
```

### 4. Instalar dependencias
```bash
npm install
```

### 5. Crear el archivo `.env`
Copiar el archivo de ejemplo:

```bash
cp .env.example .env
```

En Windows Git Bash normalmente funciona este comando. Si no funciona, pueden copiar el archivo manualmente.

### 6. Configurar las variables de entorno
Editar `.env` con los valores locales necesarios, especialmente `DATABASE_URL`.

### 7. Generar Prisma Client si es necesario
```bash
npm run prisma:generate
```

### 8. Levantar el proyecto en desarrollo
```bash
npm run start:dev
```

---

## Cómo empezar una nueva tarea

Cada vez que un integrante vaya a trabajar en una nueva funcionalidad o corrección, debe seguir este orden.

### 1. Volver a la raíz del repositorio
Si está dentro de `services/business-service`, regresar a la raíz del repositorio o ejecutar los comandos Git desde donde corresponda.

### 2. Cambiar a `main`
```bash
git checkout main
```

### 3. Actualizar `main`
```bash
git pull origin main
```

### 4. Crear una nueva rama
```bash
git checkout -b feature/nombre-de-la-tarea
```

Ejemplo:
```bash
git checkout -b feature/inventario
```

Desde ese momento todo el trabajo de esa tarea se hará en esa rama.

---

## Cómo guardar avances

Cuando el integrante ya hizo cambios en el proyecto:

### 1. Verificar el estado
```bash
git status
```

### 2. Agregar cambios
```bash
git add .
```

### 3. Crear commit
Los commits deben ser claros y en español.

Ejemplos:
```bash
git commit -m "Agregar estructura inicial del módulo de inventario"
git commit -m "Implementar controlador y servicio de productos"
git commit -m "Corregir validación de variables de entorno"
```

### 4. Subir la rama a GitHub
```bash
git push -u origin feature/nombre-de-la-tarea
```

Ejemplo:
```bash
git push -u origin feature/inventario
```

---

## Cómo crear un Pull Request

Después de subir la rama a GitHub:

1. Entrar al repositorio en GitHub.
2. Ir a la opción para crear un **Pull Request**.
3. Seleccionar:
   - **base:** `main`
   - **compare:** la rama trabajada, por ejemplo `feature/inventario`
4. Escribir un título claro.
5. Agregar una descripción breve de lo realizado.
6. Crear el Pull Request.

### Ejemplo de título
```text
Agregar módulo base de inventario
```

### Ejemplo de descripción
```text
Se agrega la estructura inicial del módulo de inventario, controladores, servicios y configuración base.
```

---

## Qué revisar antes de abrir un Pull Request

Antes de abrir un Pull Request, cada integrante debe verificar lo siguiente:

- El proyecto compila correctamente.
- No se subió `.env`.
- No se subió `node_modules`.
- No se subió `dist`.
- Los nombres de archivos y carpetas son correctos.
- El código sigue la estructura del proyecto.
- Los cambios corresponden solo a la tarea trabajada.

Comandos útiles:

```bash
npm run build
npm run lint
npm test
```

> Si alguno de estos comandos falla por una parte aún no implementada del proyecto, el integrante debe avisarlo claramente en el Pull Request.

---

## Cómo actualizar una rama cuando `main` cambió

Puede pasar que otra persona ya fusionó cambios en `main` mientras un integrante sigue trabajando en su rama.

En ese caso debe actualizarse así:

### 1. Guardar o confirmar cambios locales
```bash
git status
```

### 2. Ir a `main`
```bash
git checkout main
```

### 3. Descargar lo último
```bash
git pull origin main
```

### 4. Volver a la rama de trabajo
```bash
git checkout feature/nombre-de-la-tarea
```

### 5. Integrar cambios de `main`
```bash
git merge main
```

Si aparecen conflictos, deben resolverse antes de continuar.

---

## Cómo actuar si hay conflictos

Si Git indica que hay conflictos:

1. Abrir los archivos en conflicto.
2. Revisar las secciones marcadas por Git.
3. Elegir o combinar correctamente los cambios.
4. Guardar los archivos.
5. Agregarlos nuevamente:

```bash
git add .
```

6. Confirmar el merge si es necesario:

```bash
git commit -m "Resolver conflictos con main en modulo de inventario"
```

7. Subir la rama actualizada:

```bash
git push
```

---

## Reglas de colaboración del equipo

Para mantener orden en el proyecto, se trabajará con estas reglas:

1. No trabajar directamente en `main`.
2. Cada tarea importante debe ir en una rama independiente.
3. Antes de empezar una tarea, actualizar `main`.
4. Todo aporte debe llegar a `main` mediante Pull Request.
5. No subir archivos innecesarios o sensibles.
6. Los commits deben describir claramente lo realizado.
7. Si un integrante modifica una parte crítica del proyecto, debe explicarlo en el Pull Request.
8. Si se toca base de datos o Prisma, se debe indicar exactamente qué cambió.
9. Antes de fusionar, revisar que el cambio no rompa el proyecto.

---

## Recomendaciones para este proyecto

Dado que el backend ya está organizado por módulos, se recomienda repartir el trabajo así:

- un integrante puede trabajar en `inventory`
- otro en `products` o `product-types`
- otro en `orders`, `promotions` o `deliveries`

Siempre que sea posible, cada integrante debe concentrarse en una parte del sistema para reducir conflictos.

También es recomendable respetar la estructura interna de cada módulo:

- `application`
- `domain`
- `infrastructure`
- `presentation`

Esto ayudará a mantener el proyecto ordenado desde el inicio.

---

## Scripts útiles del proyecto

Dentro de `services/business-service`, pueden usarse estos comandos:

```bash
npm run start:dev
npm run build
npm run lint
npm test
npm run prisma:db:pull
npm run prisma:generate
npm run prisma:studio
npm run prisma:seed
```

---

## Swagger y health check

Según la configuración actual del proyecto:

- Swagger está disponible en: `/api/docs`
- Health check está disponible en: `/api/health`

---

## Flujo resumido para cada integrante

### Primera vez
```bash
git clone https://github.com/USUARIO/NOMBRE-REPOSITORIO.git
cd NOMBRE-REPOSITORIO
cd services/business-service
npm install
cp .env.example .env
npm run prisma:generate
npm run start:dev
```

### Para empezar una tarea nueva
```bash
git checkout main
git pull origin main
git checkout -b feature/nombre-de-la-tarea
```

### Para guardar y subir avances
```bash
git add .
git commit -m "Describir claramente lo realizado"
git push -u origin feature/nombre-de-la-tarea
```

### Para actualizarse con `main`
```bash
git checkout main
git pull origin main
git checkout feature/nombre-de-la-tarea
git merge main
```

---

## Responsable del repositorio

La persona propietaria del repositorio debe:

- mantener este README actualizado
- agregar a los integrantes como colaboradores
- revisar o coordinar la revisión de Pull Requests
- evitar que se mezcle código inestable en `main`

---

## Nota final

La meta no es solo subir código, sino trabajar de manera ordenada, segura y entendible para todo el equipo.

Si todos siguen este flujo, será mucho más fácil:

- dividir tareas
- revisar avances
- resolver conflictos
- mantener una versión estable del backend
- identificar qué hizo cada integrante

