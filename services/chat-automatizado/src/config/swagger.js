import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Chat Automatizado — API',
            version: '1.0.0',
            description: `
Microservicio de atención al cliente automatizado para la plataforma **Pedidos Now**.

Resuelve casos de clientes, repartidores y negocios sin intervención humana mediante una máquina de estados (XState).

**Flujo básico:**
1. \`POST /session\` → iniciar sesión y recibir primer mensaje del bot
2. \`POST /session/message\` → enviar opción o código de pedido
3. Si \`is_final: true\` → conversación terminada
4. Si \`state: ESCALAR_AGENTE\` → caso escalado a agente humano
            `,
            contact: {
                name: 'Equipo Chat Automatizado',
            },
        },
        servers: [
            {
                url: 'http://localhost:3004',
                description: 'Servidor local',
            },
            {
                url: 'https://pedidos-now-chat-automatizado.up.railway.app',
                description: 'Servidor de producción',
            },
            {
                url: 'https://broker-services-production.up.railway.app/api/soporte',
                description: 'Vía Broker',
            },
        ],
        tags: [
            { name: 'Health',        description: 'Estado del servicio' },
            { name: 'Session',       description: 'Sesiones del chat bot' },
            { name: 'FAQs',          description: 'Preguntas frecuentes' },
            { name: 'Compensation',  description: 'Cupones y reembolsos' },
            { name: 'Escalation',    description: 'Escalaciones a agentes' },
            { name: 'Support',       description: 'Solicitudes de soporte' },
            { name: 'Message',       description: 'Mensajes de sesión' },
            { name: 'Menu',          description: 'Menús del bot' },
            { name: 'Inquiry',       description: 'Consultas registradas' },
        ],
        components: {
            schemas: {
                StartSession: {
                    type: 'object',
                    required: ['id_usuario', 'user_type'],
                    properties: {
                        id_usuario: { type: 'integer', example: 1 },
                        user_type: {
                            type: 'string',
                            enum: ['cliente', 'repartidor', 'negocio'],
                            example: 'cliente',
                        },
                    },
                },
                SendMessage: {
                    type: 'object',
                    required: ['id_session', 'input'],
                    properties: {
                        id_session: { type: 'integer', example: 1 },
                        input: { type: 'string', example: '1' },
                        input_type: {
                            type: 'string',
                            enum: ['INPUT_CODE', 'OPTION'],
                            description: 'Omitir para detección automática',
                        },
                    },
                },
                SessionResponse: {
                    type: 'object',
                    properties: {
                        id_session:  { type: 'integer', example: 1 },
                        state:       { type: 'string', example: 'MENU_PRINCIPAL_CLIENTE' },
                        message:     { type: 'string', example: 'Bienvenido. Selecciona una opción:' },
                        is_final:    { type: 'boolean', example: false },
                        messages:    { type: 'array', items: { type: 'string' } },
                        escalation_payload: { type: 'object', nullable: true },
                    },
                },
                FAQ: {
                    type: 'object',
                    properties: {
                        id_faq:        { type: 'integer', example: 1 },
                        category_type: {
                            type: 'string',
                            enum: ['cliente', 'repartidor', 'restaurante', 'farmacia', 'supermercado', 'paqueteria'],
                        },
                        question:   { type: 'string', example: '¿Cómo cancelo mi pedido?' },
                        answer:     { type: 'string', example: 'Puedes cancelar en los primeros 5 minutos.' },
                        faq_status: { type: 'string', enum: ['active', 'inactive', 'archive'] },
                    },
                },
                CreateFAQ: {
                    type: 'object',
                    required: ['category_type', 'question', 'answer'],
                    properties: {
                        category_type: {
                            type: 'string',
                            enum: ['cliente', 'repartidor', 'restaurante', 'farmacia', 'supermercado', 'paqueteria'],
                            example: 'cliente',
                        },
                        question:   { type: 'string', example: '¿Cómo cancelo mi pedido?' },
                        answer:     { type: 'string', example: 'Puedes cancelar en los primeros 5 minutos.' },
                        faq_status: { type: 'string', enum: ['active', 'inactive', 'archive'], default: 'active' },
                    },
                },
                Compensation: {
                    type: 'object',
                    properties: {
                        id_compensation: { type: 'integer' },
                        id_usuario:      { type: 'integer' },
                        id_session:      { type: 'integer' },
                        compensation_type: { type: 'string', enum: ['cupon', 'reembolso'] },
                        amount:          { type: 'number', example: 25.0 },
                        cupon_code:      { type: 'string', example: 'COMP-1-VOY2K8', nullable: true },
                        status:          { type: 'string', example: 'completado' },
                    },
                },
                Escalation: {
                    type: 'object',
                    properties: {
                        id_escalation:    { type: 'integer' },
                        id_session:       { type: 'integer' },
                        id_usuario:       { type: 'integer' },
                        user_type:        { type: 'string' },
                        problem_category: { type: 'string', example: 'cargo_no_reconocido' },
                        summary:          { type: 'string' },
                        handoff_status:   { type: 'string', enum: ['pendiente', 'recibido', 'en_atencion', 'cerrado'] },
                        chat_sac_conversation_id: { type: 'string', nullable: true },
                        conversation_history: { type: 'array', items: { type: 'object' } },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        error:   { type: 'string', example: 'Mensaje de error' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
        customSiteTitle: 'Chat Automatizado — Docs',
        customCss: '.swagger-ui .topbar { background-color: #0d0f12; }',
    }));

    app.get('/api-docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });

    console.log('📚 Swagger disponible en /api-docs');
}