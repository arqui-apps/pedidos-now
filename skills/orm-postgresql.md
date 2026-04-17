---
name: orm-postgresql
description: skill operativo para trabajar la base de datos de un proyecto node.js usando prisma orm con postgresql (neon.tech). define estructura, responsabilidades, flujos de cambio y buenas prácticas. reemplaza el enfoque de mysql2 + sql manual. la ia debe adaptarse a este stack sin introducir sql crudo en repositories, services ni controllers, salvo solicitud explícita con justificación técnica.
version: 1.0.0
scope: repository
applies_to: github copilot cli
stack:
  - node.js
  - typescript
  - "@prisma/client"
  - postgresql (neon.tech)
  - prisma migrate
---

# orm-postgresql

Skill operativo para el manejo disciplinado de base de datos en proyectos Node.js usando Prisma ORM con PostgreSQL (Neon.tech).

---

## filosofía

> Prisma es la herramienta, no la solución mágica. La disciplina sigue estando en la estructura, la separación de capas y el control explícito del esquema.

La adopción de un ORM no elimina la responsabilidad de entender qué pasa en la base de datos. Las migraciones siguen siendo obligatorias. El esquema sigue siendo la fuente de verdad. Los repositories siguen siendo la única capa que toca la base de datos.

---

## stack oficial

| decisión | valor |
|---|---|
| ORM | `@prisma/client` |
| base de datos | PostgreSQL — Neon.tech |
| evolución del esquema | `prisma migrate dev` / `prisma migrate deploy` |
| fuente de verdad del esquema | `prisma/schema.prisma` |
| sincronización automática destructiva | **no usar. `prisma db push` solo en desarrollo inicial.** |
| tipado | automático, generado por Prisma a partir del schema |
| SQL crudo | **prohibido en repositories, services y controllers sin justificación técnica explícita** |
| lógica de acceso a datos | vive en `src/repositories/` |
| lógica de negocio | vive en `src/services/` |
| variable de entorno | `DATABASE_URL` (string completo de conexión) |

---

## estructura recomendada

```
src/
  config/
    db.ts                          ← singleton de PrismaClient
  repositories/
    usuario.repository.ts          ← consultas Prisma del dominio usuario
    pedido.repository.ts
    ...
  services/
    usuario.service.ts             ← lógica de negocio
    pedido.service.ts
    ...
  controllers/
    ...

prisma/
  schema.prisma                    ← esquema declarativo único, fuente de verdad
  migrations/                      ← generadas automáticamente por Prisma
    20240101000000_crear_tabla_usuarios/
      migration.sql
    ...
```

---

## responsabilidades por archivo

### `src/config/db.ts`

- Crea y exporta el singleton de `PrismaClient`.
- Es la única fuente de instancia del ORM en todo el proyecto.
- No contiene lógica de negocio ni queries.
- Todos los repositories lo importan desde aquí.
- Implementar patrón singleton para evitar múltiples instancias en desarrollo (hot reload).

```ts
// estructura mínima esperada
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### `prisma/schema.prisma`

- Define todos los modelos del proyecto de forma declarativa.
- Es la única fuente de verdad del esquema de base de datos.
- Nunca modificar directamente las migraciones generadas.
- Cada cambio en el schema debe reflejarse en una migración versionada.
- Incluir relaciones, índices y restricciones explícitamente.

```prisma
// estructura mínima esperada
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Usuario {
  id        Int      @id @default(autoincrement())
  nombre    String
  email     String   @unique
  creadoEn  DateTime @default(now())
  pedidos   Pedido[]
}
```

### `src/repositories/`

- Contiene un archivo por dominio o entidad principal.
- Cada archivo exporta funciones que usan `prisma` importado desde `config/db.ts`.
- Solo accede a la base de datos. No contiene lógica de negocio.
- Usa los tipos generados automáticamente por Prisma.
- No usa SQL crudo (`prisma.$queryRaw`) salvo justificación técnica explícita documentada.

```ts
// estructura mínima esperada en un repository
import { prisma } from '../config/db';

export async function findById(id: number) {
  return prisma.usuario.findUnique({ where: { id } });
}

export async function create(data: { nombre: string; email: string }) {
  return prisma.usuario.create({ data });
}

export async function update(id: number, data: Partial<{ nombre: string; email: string }>) {
  return prisma.usuario.update({ where: { id }, data });
}

export async function deleteById(id: number) {
  return prisma.usuario.delete({ where: { id } });
}
```

### `prisma/migrations/`

- Generadas automáticamente por `prisma migrate dev`.
- Cada migración corresponde a un cambio específico del schema.
- **No editar** los archivos generados manualmente.
- Son la memoria histórica del esquema, igual que las migraciones SQL manuales del enfoque anterior.
- Se versionan en Git como parte del proyecto.

---

## variable de entorno

```env
# .env — conexión a Neon.tech
DATABASE_URL="postgresql://usuario:password@host.neon.tech/nombre_db?sslmode=require"
```

- No usar variables separadas (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
- El string completo `DATABASE_URL` es el formato oficial de Prisma con PostgreSQL.
- Neon.tech provee este string en el panel de su proyecto bajo "Connection string".

---

## flujo para agregar una tabla nueva

1. Agregar el modelo en `prisma/schema.prisma` con todos sus campos, tipos y relaciones.
2. Ejecutar `npx prisma migrate dev --name crear_tabla_[nombre]`.
3. Prisma genera automáticamente el archivo SQL en `prisma/migrations/`.
4. Crear el repository correspondiente en `src/repositories/[nombre].repository.ts` con las funciones básicas.
5. Verificar si algún service necesita métodos nuevos.
6. Ejecutar `npx prisma generate` si no se hizo automáticamente.

---

## flujo para agregar una columna

1. Agregar el campo en el modelo correspondiente dentro de `prisma/schema.prisma`.
2. Si el campo es obligatorio (`NOT NULL`), asignar un valor default o evaluar compatibilidad con registros existentes.
3. Ejecutar `npx prisma migrate dev --name agregar_[campo]_[tabla]`.
4. Actualizar las funciones del repository si la columna debe incluirse en `create`, `update` o filtros de `findBy`.
5. No editar la migración generada.

---

## flujo para crear un repository

1. Crear archivo `src/repositories/[entidad].repository.ts`.
2. Importar `prisma` desde `../config/db`.
3. Exportar funciones tipadas: `findById`, `findAll`, `create`, `update`, `deleteById` como mínimo.
4. Usar los tipos generados por Prisma (`Prisma.UsuarioCreateInput`, `Prisma.UsuarioUpdateInput`, etc.).
5. Agregar funciones adicionales específicas del dominio según necesidad.

---

## flujo para manejar transacciones

Usar `prisma.$transaction` cuando haya dos o más operaciones dependientes entre sí:

```ts
// transacción interactiva (recomendada para lógica compleja)
const resultado = await prisma.$transaction(async (tx) => {
  const movimiento = await tx.movimiento.create({ data: datosMovimiento });
  await tx.cuentaFondo.update({
    where: { id: datosMovimiento.cuentaId },
    data: { saldo: { decrement: datosMovimiento.monto } },
  });
  return movimiento;
});
```

```ts
// transacción por lote (para operaciones independientes en paralelo)
const [usuario, pedido] = await prisma.$transaction([
  prisma.usuario.create({ data: datosUsuario }),
  prisma.pedido.create({ data: datosPedido }),
]);
```

---

## flujo para queries complejas sin anti-patrones

Antes de recurrir a `prisma.$queryRaw`, verificar si Prisma puede resolver la consulta:

```ts
// filtros compuestos con OR, AND, NOT
const usuarios = await prisma.usuario.findMany({
  where: {
    OR: [{ email: { contains: '@neon' } }, { nombre: { startsWith: 'Admin' } }],
  },
});

// relaciones anidadas (eager loading explícito)
const pedidos = await prisma.pedido.findMany({
  where: { estado: 'activo' },
  include: {
    usuario: true,
    items: { include: { producto: true } },
  },
  orderBy: { creadoEn: 'desc' },
  take: 20,
});

// agrupaciones y conteos
const stats = await prisma.pedido.groupBy({
  by: ['estado'],
  _count: { id: true },
  _sum: { total: true },
});
```

Solo usar `prisma.$queryRaw` si Prisma no puede expresar la consulta y documentar el motivo en el mismo archivo.

---

## buenas prácticas con Prisma

- **Tipos generados**: usar siempre `Prisma.EntidadCreateInput`, `Prisma.EntidadUpdateInput` y los tipos del cliente generado. No definir interfaces manuales para datos de Prisma.
- **Validación previa**: validar entradas con Zod u otra librería antes de pasarlas a Prisma. Prisma no es la capa de validación.
- **Select explícito**: cuando el resultado se expone al exterior, usar `select` para especificar solo los campos necesarios. Evitar devolver campos sensibles.
- **Manejo de errores**: capturar errores específicos de Prisma con `PrismaClientKnownRequestError` para distinguir violaciones únicas, registros no encontrados, etc.
- **Relaciones**: preferir `include` (eager loading) con scope definido. No cargar relaciones que no se usen en la respuesta.
- **Paginación**: usar `take` y `skip` para paginación offset, o `cursor` para paginación por cursor en conjuntos grandes.

```ts
// manejo de errores específico de Prisma
import { Prisma } from '@prisma/client';

try {
  await prisma.usuario.create({ data });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new Error('El email ya está registrado');
    }
  }
  throw error;
}
```

---

## ejemplos concretos

### cómo se veía con mysql2 vs cómo se ve con Prisma

```js
// ❌ antes — mysql2 con SQL crudo
const [rows] = await pool.execute('SELECT * FROM usuarios WHERE id = ?', [id]);
return rows[0] ?? null;
```

```ts
// ✅ ahora — Prisma tipado
return prisma.usuario.findUnique({ where: { id } });
```

---

```js
// ❌ antes — INSERT manual
const [result] = await pool.execute(
  'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
  [data.nombre, data.email]
);
return result.insertId;
```

```ts
// ✅ ahora — Prisma tipado
return prisma.usuario.create({ data: { nombre: data.nombre, email: data.email } });
```

---

### repository simple completo

```ts
// src/repositories/usuario.repository.ts
import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export async function findById(id: number) {
  return prisma.usuario.findUnique({ where: { id } });
}

export async function findAll() {
  return prisma.usuario.findMany({ orderBy: { creadoEn: 'desc' } });
}

export async function create(data: Prisma.UsuarioCreateInput) {
  return prisma.usuario.create({ data });
}

export async function update(id: number, data: Prisma.UsuarioUpdateInput) {
  return prisma.usuario.update({ where: { id }, data });
}

export async function deleteById(id: number) {
  return prisma.usuario.delete({ where: { id } });
}
```

---

### repository con relaciones

```ts
// src/repositories/pedido.repository.ts
import { prisma } from '../config/db';

export async function findByIdConDetalle(id: number) {
  return prisma.pedido.findUnique({
    where: { id },
    include: {
      usuario: { select: { id: true, nombre: true, email: true } },
      items: { include: { producto: true } },
    },
  });
}

export async function findByUsuario(usuarioId: number) {
  return prisma.pedido.findMany({
    where: { usuarioId },
    orderBy: { creadoEn: 'desc' },
    include: { items: true },
  });
}
```

---

### repository con transacciones

```ts
// src/repositories/movimiento.repository.ts
import { prisma } from '../config/db';
import { Prisma } from '@prisma/client';

export async function registrarMovimientoYActualizarSaldo(
  cuentaId: number,
  monto: number,
  tipo: 'ingreso' | 'egreso',
  descripcion: string
) {
  return prisma.$transaction(async (tx) => {
    const cuenta = await tx.cuentaFondo.findUniqueOrThrow({ where: { id: cuentaId } });

    const nuevoSaldo =
      tipo === 'ingreso'
        ? cuenta.saldo.add(monto)
        : cuenta.saldo.sub(monto);

    const movimiento = await tx.movimiento.create({
      data: {
        cuentaId,
        tipo,
        monto,
        saldoAnterior: cuenta.saldo,
        saldoPosterior: nuevoSaldo,
        descripcion,
      },
    });

    await tx.cuentaFondo.update({
      where: { id: cuentaId },
      data: { saldo: nuevoSaldo },
    });

    return movimiento;
  });
}
```

---

## restricciones obligatorias

- **No SQL crudo** en repositories, services ni controllers. Si se necesita `prisma.$queryRaw`, debe estar justificado con comentario en el mismo archivo.
- **`schema.prisma` es la única fuente de verdad** del esquema. No crear tablas ni columnas fuera de él.
- **Migraciones generadas automáticamente** con `prisma migrate`. No escribir archivos de migración a mano.
- **`DATABASE_URL`** es la única variable de entorno para la conexión. No usar `DB_HOST`, `DB_USER`, etc.
- **No usar `prisma db push`** en producción. Solo para exploración inicial en desarrollo.
- **No usar `prisma db push --force-reset`** bajo ninguna circunstancia en un entorno con datos reales.

---

## checklist antes de modificar schema.prisma

- [ ] Entiendo qué tablas y relaciones existen actualmente en el schema.
- [ ] El cambio es incremental (agrega, no destruye sin advertencia).
- [ ] Si hay campos `NOT NULL` nuevos sin default, evalué el impacto en datos existentes.
- [ ] Tengo claro el nombre de la migración que usaré (`--name`).
- [ ] El cambio no duplica un modelo ya existente.
- [ ] Actualicé o crearé el repository correspondiente al modelo afectado.

---

## checklist antes de crear un repository

- [ ] El modelo correspondiente existe en `schema.prisma`.
- [ ] La instancia de `prisma` se importa desde `src/config/db.ts` (no se instancia localmente).
- [ ] Las funciones usan tipos generados por Prisma (`Prisma.EntidadCreateInput`, etc.).
- [ ] El repository no contiene lógica de negocio.
- [ ] Las funciones tienen nombres descriptivos (`findByEmail`, `updateEstado`, etc.).
- [ ] Consideré manejo de errores de Prisma (`PrismaClientKnownRequestError`).

---

## checklist antes de hacer una consulta compleja

- [ ] Verifiqué si Prisma puede expresar la consulta con su API (`where`, `include`, `groupBy`, `orderBy`, etc.).
- [ ] Si uso `prisma.$queryRaw`, documenté por qué Prisma no puede resolverlo de otra forma.
- [ ] Uso `select` para limitar los campos devueltos si el resultado va al exterior.
- [ ] Si la consulta involucra dos o más escrituras dependientes, usé `prisma.$transaction`.
- [ ] Las consultas no están en services ni controllers; están en el repository correspondiente.

---

## errores a evitar

| error | consecuencia |
|---|---|
| Usar `prisma.$queryRaw` sin justificación | rompe el propósito del ORM, introduce fragilidad |
| Crear queries sin verificar si Prisma las resuelve | complejidad innecesaria |
| No usar tipos generados por Prisma | pierde el tipado automático, fuente de bugs |
| Modificar migraciones generadas manualmente | inconsistencia entre entornos, migraciones corruptas |
| Instanciar `new PrismaClient()` en cada repository | múltiples conexiones abiertas, problemas en desarrollo |
| Usar `prisma db push` en producción | destruye el historial de migraciones |
| Escribir lógica de negocio en repositories | mezcla de responsabilidades |
| Escribir acceso a datos en services o controllers | viola la separación de capas |
| Omitir `select` en datos sensibles expuestos al exterior | fuga de información |
| No manejar `PrismaClientKnownRequestError` | errores de BD genéricos e inapropiados para el cliente |

---

## comandos de referencia

```bash
# instalar Prisma
npm install prisma @prisma/client
npx prisma init

# después de cambiar schema.prisma en desarrollo
npx prisma migrate dev --name descripcion_del_cambio

# aplicar migraciones en producción (sin generar nuevas)
npx prisma migrate deploy

# regenerar el cliente sin nueva migración
npx prisma generate

# explorar la base de datos visualmente
npx prisma studio

# ver el estado de las migraciones
npx prisma migrate status
```

---

## notas finales

Este skill reemplaza a `base-de-datos-mysql2.md` como estrategia oficial de base de datos del proyecto. El enfoque cambia de MySQL2 + SQL manual a PostgreSQL (Neon.tech) + Prisma ORM, pero la disciplina de separación de capas, el uso de repositories como única capa de acceso a datos y el control explícito del esquema mediante migraciones se mantienen como principios no negociables.

Si existe un skill de sesión base activo, este skill tiene prioridad sobre él en todo lo relacionado a base de datos, estructura de repositories, esquema y migraciones.

Ante cualquier cambio de esquema, la secuencia siempre es: modificar `schema.prisma` → ejecutar `prisma migrate` → actualizar el repository.
