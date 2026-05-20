// Admin-contabilidad Emmanuel

const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'API Administración y Contabilidad',
        version: '1.0.0',
        description: 'Documentación del microservicio de Administración y Contabilidad para el sistema Pedidos Now.'
    },
    servers: [
        {
            url: 'http://localhost:3000',
            description: 'Servidor local'
        },
        {
            url: 'https://pedidos-now-admin-y-contabilidad.onrender.com',
            description: 'Servidor Render'
        }
    ],
    tags: [
        {
            name: 'Health',
            description: 'Verificación del estado del servicio'
        },
        {
            name: 'Movimientos',
            description: 'Movimientos financieros, ingresos, egresos y fondos'
        },
        {
            name: 'Reportes Negocios',
            description: 'Conexión, consultas y movimientos financieros del microservicio de Negocios'
        },
        {
            name: 'Reportes',
            description: 'Reportes administrativos y contables'
        },
        {
            name: 'Pagos Agentes',
            description: 'Pagos realizados a agentes de servicio al cliente'
        },
        {
            name: 'Reembolsos',
            description: 'Gestión de reembolsos a clientes'
        },
        {
            name: 'Compensaciones',
            description: 'Gestión de compensaciones a clientes o negocios'
        },
        {
            name: 'Dashboard',
            description: 'Indicadores generales del módulo'
        }, 
        //Admin-conta Jeff. Daniel Ramos
        {
            name: 'Cupones',
            description: 'Gestión administrativa de cupones'
        },
        {
            name: 'Promociones',
            description: 'Gestión de promociones generales'
        },
        {
            name: 'Promociones Flash',
            description: 'Gestión de promociones flash'
        },
        {
            name: 'Reportes Promociones',
            description: 'Reportes y sincronización de promociones'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            Movimiento: {
                type: 'object',
                properties: {
                    id: {
                        type: 'integer',
                        example: 1
                    },
                    cuenta_id: {
                        type: 'integer',
                        example: 1
                    },
                    tipo: {
                        type: 'string',
                        example: 'ingreso'
                    },
                    subtipo: {
                        type: 'string',
                        example: 'pedido'
                    },
                    modulo_origen: {
                        type: 'string',
                        example: 'broker'
                    },
                    referencia_id: {
                        type: 'integer',
                        example: 1001
                    },
                    monto: {
                        type: 'number',
                        example: 150.75
                    },
                    descripcion: {
                        type: 'string',
                        example: 'Ingreso por pedido desde broker'
                    },
                    pedido_id: {
                        type: 'integer',
                        example: 1001
                    },
                    repartidor_id: {
                        type: 'integer',
                        example: 25
                    },
                    estado: {
                        type: 'string',
                        example: 'procesado'
                    },
                    fecha: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            },
            CrearMovimiento: {
                type: 'object',
                required: ['tipo', 'subtipo', 'modulo_origen', 'monto'],
                properties: {
                    cuenta_id: {
                        type: 'integer',
                        example: 1
                    },
                    tipo: {
                        type: 'string',
                        example: 'ingreso'
                    },
                    subtipo: {
                        type: 'string',
                        example: 'pedido'
                    },
                    modulo_origen: {
                        type: 'string',
                        example: 'broker'
                    },
                    referencia_id: {
                        type: 'integer',
                        example: 1001
                    },
                    monto: {
                        type: 'number',
                        example: 150.75
                    },
                    descripcion: {
                        type: 'string',
                        example: 'Ingreso por pedido desde broker'
                    },
                    pedido_id: {
                        type: 'integer',
                        example: 1001
                    },
                    repartidor_id: {
                        type: 'integer',
                        example: 25
                    },
                    estado: {
                        type: 'string',
                        example: 'procesado'
                    }
                }
            },
            Error: {
                type: 'object',
                properties: {
                    ok: {
                        type: 'boolean',
                        example: false
                    },
                    error: {
                        type: 'string',
                        example: 'Mensaje de error'
                    },
                    timestamp: {
                        type: 'string',
                        format: 'date-time'
                    }
                }
            }
        }
    }
};

const options = {
    swaggerDefinition,
    apis: ['./src/routes/*.js', './src/app.js']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;