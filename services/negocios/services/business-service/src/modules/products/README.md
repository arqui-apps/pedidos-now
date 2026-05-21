# Entrega propuesta: módulo products

Esta entrega está alineada con el schema real observado y con el patrón del módulo `business`.

## Ubicación de archivos

Copiar la carpeta `src/modules/products` dentro de:

- `services/business-service/src/modules/products`

## Cambio mínimo en `app.module.ts`

Agregar:

```ts
import { ProductsModule } from './modules/products/products.module';
```

Y en `imports`:

```ts
ProductsModule,
```

Sugerencia de orden final:

```ts
imports: [
  ConfigModule.forRoot({
    isGlobal: true,
    validationSchema: envValidationSchema,
  }),
  PrismaModule,
  HealthModule,
  BusinessModule,
  SchedulesModule,
  ProductTypesModule,
  ProductsModule,
]
```

## Observaciones técnicas reales del schema

- El modelo real es `product`.
- El producto pertenece directamente a `business` por `business_id`.
- El producto requiere `product_type_id`.
- El campo de precio real es `base_price`.
- El identificador operativo opcional real es `internal_code`; no existe `sku` en el schema compartido.
- Sí existe soft delete en `product`: `deleted_at` y `deletion_reason`.
- `product_type` también tiene soft delete, por lo que el servicio valida que el tipo exista y no esté eliminado.
- `product_stock` existe como relación opcional 1:1 y solo se usa aquí para lectura mínima.
- `visible_in_catalog` está modelado como `Int` (`0/1`), por lo que los DTO lo exponen como boolean y el servicio hace el mapeo.
