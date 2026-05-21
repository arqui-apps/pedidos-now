# Módulo de Restaurantes — Proyecto de Microservicios

## 📋 Descripción General

Este es el microservicio encargado de la gestión de restaurantes, productos, combos, precios, descuentos y pedidos dentro de una arquitectura de microservicios.

## 🎯 Responsabilidades del Módulo

1. **Gestión de Restaurantes**
   - CRUD de restaurantes
   - Manejo de horarios de atención
   - Activación/inactivación de restaurantes

2. **Gestión de Productos y Combos**
   - CRUD de productos y combos
   - Clasificación por tipos
   - Control de disponibilidad
   - Historial de precios

3. **Gestión de Pedidos**
   - Creación y seguimiento de pedidos
   - Estados del pedido
   - Cancelación con aplicación de multas
   - Integración con Broker para notificaciones

4. **Gestión de Descuentos**
   - Descuentos a nivel de restaurante, producto o combo
   - Validación de fechas de vigencia
   - Tipos: porcentaje o monto fijo

## 🔗 Integraciones Externas

- **Servicio de Auth**: Validación de tokens JWT
- **Broker**: Notificaciones de nuevos pedidos
- **Módulo de Descuentos**: Consulta de promociones vigentes
- **Módulo de Cobros**: Aplicación de multas por cancelación

## 🛠️ Stack Tecnológico

- **Node.js** + **Express.js**
- **Sequelize** (ORM)
- **MySQL** (Base de datos)
- **Axios** (Cliente HTTP para APIs externas)
- **JWT** (Autenticación)
- **express-validator** (Validación de datos)

## 👥 Equipo

4 integrantes trabajando colaborativamente con soporte de IA

## 📝 Notas

- Los modelos usan timestamps automáticos (createdAt, updatedAt)
- Soft deletes mediante campo `activo`
- Validaciones en capa de modelo y controlador
- Manejo centralizado de errores
