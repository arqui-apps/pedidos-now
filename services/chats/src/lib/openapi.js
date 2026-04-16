export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Chat Service API',
    version: '1.0.0',
    description:
      'Microservicio de chats para agentes de servicio al cliente.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Desarrollo local',
    },
  ],
  tags: [
    { name: 'Health', description: 'Estado del servicio' },
    { name: 'Conversations', description: 'Gestión de conversaciones' },
    { name: 'Messages', description: 'Mensajes dentro de una conversación' },
    { name: 'Availability', description: 'Horarios de atención del chat' },
    { name: 'Internal', description: 'Procesos internos del sistema' },
  ],
  components: {
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {},
          message: { type: 'string', example: 'Operación realizada correctamente.' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', example: 'ok' },
          service: { type: 'string', example: 'chat-service' },
          timestamp: { type: 'string', format: 'date-time' },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          requester_type: {
            type: 'string',
            enum: ['CUSTOMER', 'COURIER', 'BUSINESS'],
          },
          requester_ext_id: { type: 'string' },
          assigned_agent_ext_id: { type: ['string', 'null'] },
          case_type: {
            type: 'string',
            enum: ['ORDER', 'PAYMENT', 'DELIVERY', 'ACCOUNT', 'OTHER'],
          },
          case_reference: { type: ['string', 'null'] },
          status: {
            type: 'string',
            enum: [
              'IN_QUEUE',
              'OPEN',
              'RESOLVED_NO_SOLUTION',
              'RESOLVED_COUPON',
              'RESOLVED_REFUND',
              'CLOSED_TIMEOUT',
              'CLOSED_MANUAL',
              'CLOSED_OUT_OF_HOURS',
            ],
          },
          subject: { type: 'string' },
          opened_at: { type: 'string', format: 'date-time' },
          last_activity_at: { type: ['string', 'null'], format: 'date-time' },
          last_user_message_at: { type: ['string', 'null'], format: 'date-time' },
          last_agent_message_at: { type: ['string', 'null'], format: 'date-time' },
          closed_at: { type: ['string', 'null'], format: 'date-time' },
          close_reason: {
            type: ['string', 'null'],
            enum: ['RESOLVED', 'TIMEOUT', 'MANUAL', 'OUT_OF_HOURS', null],
          },
          inactivity_minutes: { type: 'integer', example: 5 },
          inactivity_deadline_at: {
            type: ['string', 'null'],
            format: 'date-time',
          },
          is_live: { type: 'boolean' },
          out_of_hours: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Participant: {
        type: 'object',
        properties: {
          conversation_id: { type: 'string', format: 'uuid' },
          participant_ext_id: { type: 'string' },
          role: { type: 'string', enum: ['USER', 'AGENT', 'SYSTEM'] },
          display_name: { type: ['string', 'null'] },
          joined_at: { type: 'string', format: 'date-time' },
          left_at: { type: ['string', 'null'], format: 'date-time' },
        },
      },
      Metrics: {
        type: 'object',
        properties: {
          conversation_id: { type: 'string', format: 'uuid' },
          total_messages: { type: 'integer' },
          total_user_messages: { type: 'integer' },
          total_agent_messages: { type: 'integer' },
          first_agent_response_ms: { type: ['integer', 'null'] },
          total_agent_response_ms: { type: ['integer', 'null'] },
          agent_response_count: { type: 'integer' },
          resolved_at: { type: ['string', 'null'], format: 'date-time' },
          time_to_close_ms: { type: ['integer', 'null'] },
        },
      },
      StatusHistory: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          conversation_id: { type: 'string', format: 'uuid' },
          previous_status: { type: ['string', 'null'] },
          new_status: { type: 'string' },
          changed_by_role: { type: 'string', enum: ['USER', 'AGENT', 'SYSTEM'] },
          changed_by_ext_id: { type: ['string', 'null'] },
          reason: { type: ['string', 'null'] },
          changed_at: { type: 'string', format: 'date-time' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          conversation_id: { type: 'string', format: 'uuid' },
          sender_role: { type: 'string', enum: ['USER', 'AGENT', 'SYSTEM'] },
          sender_ext_id: { type: ['string', 'null'] },
          message_type: { type: 'string', enum: ['TEXT', 'SYSTEM'] },
          content: { type: 'string' },
          client_message_id: { type: ['string', 'null'] },
          sent_at: { type: 'string', format: 'date-time' },
        },
      },
      Availability: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          day_of_week: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
          start_time: { type: 'string', example: '08:00:00' },
          end_time: { type: 'string', example: '17:00:00' },
          enabled: { type: 'boolean' },
        },
      },
      CreateConversationBody: {
        type: 'object',
        required: ['requester_type', 'requester_ext_id', 'case_type', 'subject'],
        properties: {
          requester_type: {
            type: 'string',
            enum: ['CUSTOMER', 'COURIER', 'BUSINESS'],
          },
          requester_ext_id: { type: 'string', example: 'user3' },
          requester_display_name: { type: 'string', example: 'Juliansito' },
          case_type: {
            type: 'string',
            enum: ['ORDER', 'PAYMENT', 'DELIVERY', 'ACCOUNT', 'OTHER'],
          },
          case_reference: { type: 'string', example: 'ORD-12345' },
          subject: { type: 'string', example: 'Problema con mi pedido' },
          initial_message: { type: 'string', example: 'Necesito ayuda con mi orden.' },
        },
      },
      AssignAgentBody: {
        type: 'object',
        required: ['agent_ext_id'],
        properties: {
          agent_ext_id: { type: 'string', example: 'agent3' },
          agent_display_name: { type: 'string', example: 'Manolo' },
        },
      },
      ChangeStatusBody: {
        type: 'object',
        required: ['new_status', 'changed_by_role'],
        properties: {
          new_status: {
            type: 'string',
            enum: [
              'OPEN',
              'RESOLVED_NO_SOLUTION',
              'RESOLVED_COUPON',
              'RESOLVED_REFUND',
              'CLOSED_TIMEOUT',
              'CLOSED_MANUAL',
              'CLOSED_OUT_OF_HOURS',
            ],
          },
          changed_by_role: {
            type: 'string',
            enum: ['USER', 'AGENT', 'SYSTEM'],
          },
          changed_by_ext_id: { type: ['string', 'null'] },
          reason: { type: ['string', 'null'] },
        },
      },
      CreateMessageBody: {
        type: 'object',
        required: ['sender_role', 'content'],
        properties: {
          sender_role: {
            type: 'string',
            enum: ['USER', 'AGENT'],
          },
          sender_ext_id: { type: 'string', example: 'user3' },
          content: { type: 'string', example: 'Hola, necesito ayuda.' },
          client_message_id: { type: ['string', 'null'] },
        },
      },
      CreateAvailabilityBody: {
        type: 'object',
        required: ['day_of_week', 'start_time', 'end_time'],
        properties: {
          day_of_week: { type: 'integer', minimum: 0, maximum: 6 },
          start_time: { type: 'string', example: '08:00:00' },
          end_time: { type: 'string', example: '17:00:00' },
          enabled: { type: 'boolean', default: true },
        },
      },
      UpdateAvailabilityBody: {
        type: 'object',
        properties: {
          day_of_week: { type: 'integer', minimum: 0, maximum: 6 },
          start_time: { type: 'string', example: '08:00:00' },
          end_time: { type: 'string', example: '17:00:00' },
          enabled: { type: 'boolean' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check del servicio',
        responses: {
          200: {
            description: 'Servicio funcionando correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
              },
            },
          },
        },
      },
    },
    '/api/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'Listar conversaciones',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'requester_ext_id', in: 'query', schema: { type: 'string' } },
          { name: 'assigned_agent_ext_id', in: 'query', schema: { type: 'string' } },
          { name: 'case_type', in: 'query', schema: { type: 'string' } },
          { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Listado de conversaciones' },
        },
      },
      post: {
        tags: ['Conversations'],
        summary: 'Crear conversación',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateConversationBody' },
            },
          },
        },
        responses: {
          201: { description: 'Conversación creada correctamente' },
        },
      },
    },
    '/api/conversations/{conversationId}': {
      get: {
        tags: ['Conversations'],
        summary: 'Obtener conversación por id',
        parameters: [
          {
            name: 'conversationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Detalle de la conversación' },
        },
      },
    },
    '/api/conversations/{conversationId}/assign-agent': {
      patch: {
        tags: ['Conversations'],
        summary: 'Asignar agente a una conversación',
        parameters: [
          {
            name: 'conversationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AssignAgentBody' },
            },
          },
        },
        responses: {
          200: { description: 'Agente asignado correctamente' },
        },
      },
    },
    '/api/conversations/{conversationId}/status': {
      patch: {
        tags: ['Conversations'],
        summary: 'Cambiar estado de la conversación',
        parameters: [
          {
            name: 'conversationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChangeStatusBody' },
            },
          },
        },
        responses: {
          200: { description: 'Estado actualizado correctamente' },
        },
      },
    },
    '/api/conversations/{conversationId}/messages': {
      get: {
        tags: ['Messages'],
        summary: 'Obtener historial de mensajes',
        parameters: [
          {
            name: 'conversationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'Historial de mensajes' },
        },
      },
      post: {
        tags: ['Messages'],
        summary: 'Crear mensaje en una conversación',
        parameters: [
          {
            name: 'conversationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMessageBody' },
            },
          },
        },
        responses: {
          201: { description: 'Mensaje creado correctamente' },
        },
      },
    },
    '/api/availability': {
      get: {
        tags: ['Availability'],
        summary: 'Listar horarios de atención',
        responses: {
          200: { description: 'Listado de horarios' },
        },
      },
      post: {
        tags: ['Availability'],
        summary: 'Crear horario de atención',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAvailabilityBody' },
            },
          },
        },
        responses: {
          201: { description: 'Horario creado correctamente' },
        },
      },
    },
    '/api/availability/{availabilityId}': {
      get: {
        tags: ['Availability'],
        summary: 'Obtener horario por id',
        parameters: [
          {
            name: 'availabilityId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Horario obtenido correctamente' },
        },
      },
      patch: {
        tags: ['Availability'],
        summary: 'Actualizar horario',
        parameters: [
          {
            name: 'availabilityId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateAvailabilityBody' },
            },
          },
        },
        responses: {
          200: { description: 'Horario actualizado correctamente' },
        },
      },
      delete: {
        tags: ['Availability'],
        summary: 'Deshabilitar horario',
        parameters: [
          {
            name: 'availabilityId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'Horario deshabilitado correctamente' },
        },
      },
    },
    '/api/internal/conversations/close-timeouts': {
      post: {
        tags: ['Internal'],
        summary: 'Cerrar conversaciones vencidas por inactividad',
        responses: {
          200: { description: 'Proceso ejecutado correctamente' },
        },
      },
    },
  },
};