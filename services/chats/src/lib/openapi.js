const serverUrl = process.env.BACKEND_PUBLIC_URL || 'http://localhost:3000';

export const openApiSpec = {
  openapi: '3.1.0',
  info: {
    title: 'Chat Service API',
    version: '1.0.0',
  },
  servers: [
    {
      url: serverUrl,
      description: 'Servidor actual',
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
          message: {
            type: 'string',
            example: 'Operación realizada correctamente.',
          },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'Bad Request' },
          message: { type: 'string', example: 'Datos inválidos.' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              service: { type: 'string', example: 'chat-service' },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
          message: {
            type: 'string',
            example: 'Servicio funcionando correctamente.',
          },
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
          requester_ext_id: { type: 'string', example: 'user3' },
          assigned_agent_ext_id: { type: ['string', 'null'], example: 'agent3' },
          case_type: {
            type: 'string',
            enum: ['ORDER', 'PAYMENT', 'DELIVERY', 'ACCOUNT', 'OTHER'],
          },
          case_reference: { type: ['string', 'null'], example: 'ORD-12345' },
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
          subject: { type: 'string', example: 'Problema con mi pedido' },
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
          is_live: { type: 'boolean', example: true },
          out_of_hours: { type: 'boolean', example: false },
          deleted_at: { type: ['string', 'null'], format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Participant: {
        type: 'object',
        properties: {
          conversation_id: { type: 'string', format: 'uuid' },
          participant_ext_id: { type: 'string', example: 'user3' },
          role: { type: 'string', enum: ['USER', 'AGENT', 'SYSTEM'] },
          display_name: { type: ['string', 'null'], example: 'Juliansito' },
          joined_at: { type: 'string', format: 'date-time' },
          left_at: { type: ['string', 'null'], format: 'date-time' },
          deleted_at: { type: ['string', 'null'], format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Metrics: {
        type: 'object',
        properties: {
          conversation_id: { type: 'string', format: 'uuid' },
          total_messages: { type: 'integer', example: 5 },
          total_user_messages: { type: 'integer', example: 2 },
          total_agent_messages: { type: 'integer', example: 2 },
          first_agent_response_ms: { type: ['integer', 'null'], example: 41582 },
          total_agent_response_ms: { type: ['integer', 'null'], example: 41582 },
          agent_response_count: { type: 'integer', example: 1 },
          resolved_at: { type: ['string', 'null'], format: 'date-time' },
          time_to_close_ms: { type: ['integer', 'null'] },
          deleted_at: { type: ['string', 'null'], format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
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
          deleted_at: { type: ['string', 'null'], format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          conversation_id: { type: 'string', format: 'uuid' },
          sender_role: { type: 'string', enum: ['USER', 'AGENT', 'SYSTEM'] },
          sender_ext_id: { type: ['string', 'null'], example: 'agent3' },
          message_type: { type: 'string', enum: ['TEXT', 'SYSTEM'] },
          content: { type: 'string', example: 'Hola, ¿en qué puedo ayudarte?' },
          client_message_id: { type: ['string', 'null'], example: 'msg-001' },
          sent_at: { type: 'string', format: 'date-time' },
          deleted_at: { type: ['string', 'null'], format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      MessageListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/Message' },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 20 },
                  total: { type: 'integer', example: 5 },
                  total_pages: { type: 'integer', example: 1 },
                },
              },
            },
          },
          message: {
            type: 'string',
            example: 'Mensajes obtenidos correctamente.',
          },
        },
      },
      Availability: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          day_of_week: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
          start_time: { type: 'string', example: '08:00:00' },
          end_time: { type: 'string', example: '17:00:00' },
          enabled: { type: 'boolean', example: true },
          deleted_at: { type: ['string', 'null'], format: 'date-time' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
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
          initial_message: { type: 'string', example: 'Mi pedido no ha llegado.' },
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
          changed_by_ext_id: { type: ['string', 'null'], example: 'agent3' },
          reason: {
            type: ['string', 'null'],
            example: 'Se brindó orientación al usuario y se cerró el caso.',
          },
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
          content: { type: 'string', example: 'Hola, sigo esperando una respuesta.' },
          client_message_id: { type: ['string', 'null'], example: 'msg-001' },
        },
      },
      CreateAvailabilityBody: {
        type: 'object',
        required: ['day_of_week', 'start_time', 'end_time'],
        properties: {
          day_of_week: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
          start_time: { type: 'string', example: '08:00:00' },
          end_time: { type: 'string', example: '17:00:00' },
          enabled: { type: 'boolean', default: true, example: true },
        },
      },
      UpdateAvailabilityBody: {
        type: 'object',
        properties: {
          day_of_week: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
          start_time: { type: 'string', example: '09:00:00' },
          end_time: { type: 'string', example: '18:00:00' },
          enabled: { type: 'boolean', example: true },
        },
      },
      ConversationDetailResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              requester_type: {
                type: 'string',
                enum: ['CUSTOMER', 'COURIER', 'BUSINESS'],
              },
              requester_ext_id: { type: 'string', example: 'user3' },
              assigned_agent_ext_id: {
                type: ['string', 'null'],
                example: 'agent3',
              },
              case_type: { type: 'string', example: 'ORDER' },
              case_reference: { type: ['string', 'null'], example: 'ORD-12345' },
              status: { type: 'string', example: 'OPEN' },
              subject: { type: 'string', example: 'Problema con mi pedido' },
              opened_at: { type: 'string', format: 'date-time' },
              last_activity_at: {
                type: ['string', 'null'],
                format: 'date-time',
              },
              last_user_message_at: {
                type: ['string', 'null'],
                format: 'date-time',
              },
              last_agent_message_at: {
                type: ['string', 'null'],
                format: 'date-time',
              },
              closed_at: { type: ['string', 'null'], format: 'date-time' },
              close_reason: { type: ['string', 'null'], example: null },
              inactivity_minutes: { type: 'integer', example: 5 },
              inactivity_deadline_at: {
                type: ['string', 'null'],
                format: 'date-time',
              },
              is_live: { type: 'boolean', example: true },
              out_of_hours: { type: 'boolean', example: false },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' },
              participants: {
                type: 'array',
                items: { $ref: '#/components/schemas/Participant' },
              },
              metrics: { $ref: '#/components/schemas/Metrics' },
              status_history: {
                type: 'array',
                items: { $ref: '#/components/schemas/StatusHistory' },
              },
            },
          },
          message: {
            type: 'string',
            example: 'Conversación obtenida correctamente.',
          },
        },
      },
      ConversationListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              items: {
                type: 'array',
                items: { $ref: '#/components/schemas/Conversation' },
              },
              pagination: {
                type: 'object',
                properties: {
                  page: { type: 'integer', example: 1 },
                  limit: { type: 'integer', example: 10 },
                  total: { type: 'integer', example: 1 },
                  total_pages: { type: 'integer', example: 1 },
                },
              },
            },
          },
          message: {
            type: 'string',
            example: 'Conversaciones obtenidas correctamente.',
          },
        },
      },
      CreateConversationResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Conversation' },
          message: {
            type: 'string',
            example: 'Conversación creada correctamente.',
          },
        },
      },
      CreateMessageResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Message' },
          message: {
            type: 'string',
            example: 'Mensaje creado correctamente.',
          },
        },
      },
      AvailabilityResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { $ref: '#/components/schemas/Availability' },
          message: {
            type: 'string',
            example: 'Horario obtenido correctamente.',
          },
        },
      },
      AvailabilityListResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Availability' },
          },
          message: {
            type: 'string',
            example: 'Horarios obtenidos correctamente.',
          },
        },
      },
      InternalCloseTimeoutsResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              total_closed: { type: 'integer', example: 2 },
              conversations: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string', format: 'uuid' },
                    previous_status: { type: 'string', example: 'OPEN' },
                    new_status: {
                      type: 'string',
                      example: 'CLOSED_TIMEOUT',
                    },
                    close_reason: { type: 'string', example: 'TIMEOUT' },
                  },
                },
              },
            },
          },
          message: {
            type: 'string',
            example: 'Cierre automático ejecutado correctamente.',
          },
        },
      },
      RealtimeConversationEvent: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'conversation.updated' },
          data: { $ref: '#/components/schemas/Conversation' },
        },
      },
      RealtimeMessageEvent: {
        type: 'object',
        properties: {
          type: { type: 'string', example: 'message.created' },
          data: { $ref: '#/components/schemas/Message' },
        },
      },
      RealtimeStatusChangedEvent: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            example: 'conversation.status_changed',
          },
          data: {
            type: 'object',
            properties: {
              conversation: { $ref: '#/components/schemas/Conversation' },
              status_history: {
                $ref: '#/components/schemas/StatusHistory',
              },
            },
          },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check del servicio',
        description: 'Permite verificar que el servicio se encuentra funcionando correctamente.',
        responses: {
          200: {
            description: 'Servicio funcionando correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/HealthResponse' },
                example: {
                  success: true,
                  data: {
                    status: 'ok',
                    service: 'chat-service',
                    timestamp: '2026-04-16T12:00:00.000Z',
                  },
                  message: 'Servicio funcionando correctamente.',
                },
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
        description:
          'Lista conversaciones con paginación y filtros por estado, solicitante, agente, tipo de caso y rango de fechas.',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          {
            name: 'status',
            in: 'query',
            schema: {
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
          },
          { name: 'requester_ext_id', in: 'query', schema: { type: 'string' } },
          { name: 'assigned_agent_ext_id', in: 'query', schema: { type: 'string' } },
          {
            name: 'case_type',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['ORDER', 'PAYMENT', 'DELIVERY', 'ACCOUNT', 'OTHER'],
            },
          },
          { name: 'date_from', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'date_to', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: {
            description: 'Listado de conversaciones',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConversationListResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Conversations'],
        summary: 'Crear conversación',
        description:
          'Crea una nueva conversación. Si el horario actual está dentro de atención, la conversación inicia en IN_QUEUE. Si está fuera de horario, inicia cerrada como CLOSED_OUT_OF_HOURS.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateConversationBody' },
              example: {
                requester_type: 'CUSTOMER',
                requester_ext_id: 'user3',
                requester_display_name: 'Juliansito',
                case_type: 'ORDER',
                case_reference: 'ORD-12345',
                subject: 'Problema con mi pedido',
                initial_message: 'Mi pedido no ha llegado.',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Conversación creada correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateConversationResponse' },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Bad Request',
                  message: 'El requester_type enviado no es válido.',
                },
              },
            },
          },
        },
      },
    },
    '/api/conversations/{conversationId}': {
      get: {
        tags: ['Conversations'],
        summary: 'Obtener conversación por id',
        description:
          'Devuelve el detalle completo de una conversación, incluyendo participantes, métricas e historial de estados.',
        parameters: [
          {
            name: 'conversationId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Detalle de la conversación',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ConversationDetailResponse',
                },
              },
            },
          },
          404: {
            description: 'Conversación no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Not Found',
                  message: 'No se encontró la conversación solicitada.',
                },
              },
            },
          },
        },
      },
    },
    '/api/conversations/{conversationId}/assign-agent': {
      patch: {
        tags: ['Conversations'],
        summary: 'Asignar agente a una conversación',
        description:
          'Asigna un agente a una conversación en cola. Solo se permite si la conversación está en estado IN_QUEUE. Al asignar, la conversación pasa a OPEN.',
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
              example: {
                agent_ext_id: 'agent3',
                agent_display_name: 'Manolo',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Agente asignado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConversationDetailResponse' },
              },
            },
          },
          404: {
            description: 'Conversación no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'Conflicto de negocio',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Conflict',
                  message: 'La conversación ya no está disponible para asignación.',
                },
              },
            },
          },
        },
      },
    },
    '/api/conversations/{conversationId}/status': {
      patch: {
        tags: ['Conversations'],
        summary: 'Cambiar estado de la conversación',
        description:
          'Actualiza el estado de una conversación validando las transiciones permitidas. También maneja cierres, resolución y métricas de finalización.',
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
              example: {
                new_status: 'RESOLVED_NO_SOLUTION',
                changed_by_role: 'AGENT',
                changed_by_ext_id: 'agent3',
                reason: 'Se brindó orientación al usuario y se cerró el caso.',
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Estado actualizado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ConversationDetailResponse' },
              },
            },
          },
          400: {
            description: 'Transición inválida o datos incorrectos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Conversación no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/conversations/{conversationId}/messages': {
      get: {
        tags: ['Messages'],
        summary: 'Obtener historial de mensajes',
        description:
          'Lista los mensajes de una conversación con paginación, ordenados cronológicamente.',
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
          200: {
            description: 'Historial de mensajes',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageListResponse' },
              },
            },
          },
          404: {
            description: 'Conversación no encontrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Messages'],
        summary: 'Crear mensaje en una conversación',
        description:
          'Crea un mensaje dentro de una conversación activa. Valida que el usuario sea el solicitante y que el agente sea el agente asignado.',
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
              example: {
                sender_role: 'USER',
                sender_ext_id: 'user3',
                content: 'Hola, sigo esperando una respuesta.',
                client_message_id: 'msg-001',
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Mensaje creado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateMessageResponse' },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          403: {
            description: 'No autorizado por reglas de negocio',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Forbidden',
                  message: 'El agente no está asignado a esta conversación.',
                },
              },
            },
          },
          409: {
            description: 'La conversación ya está cerrada',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Conflict',
                  message: 'No se pueden enviar mensajes a una conversación finalizada.',
                },
              },
            },
          },
        },
      },
    },
    '/api/availability': {
      get: {
        tags: ['Availability'],
        summary: 'Listar horarios de atención',
        description:
          'Obtiene todos los horarios configurados para la atención del chat. Estos horarios se usan para decidir si una nueva conversación inicia en cola o fuera de horario.',
        responses: {
          200: {
            description: 'Listado de horarios',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvailabilityListResponse' },
                example: {
                  success: true,
                  data: [
                    {
                      id: '8d6a6d4e-0000-0000-0000-111111111111',
                      day_of_week: 1,
                      start_time: '08:00:00',
                      end_time: '17:00:00',
                      enabled: true,
                    },
                    {
                      id: '8d6a6d4e-0000-0000-0000-222222222222',
                      day_of_week: 2,
                      start_time: '08:00:00',
                      end_time: '17:00:00',
                      enabled: true,
                    },
                  ],
                  message: 'Horarios obtenidos correctamente.',
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Availability'],
        summary: 'Crear horario de atención',
        description:
          'Crea un nuevo horario de atención para el chat. El día de la semana usa formato 0=domingo y 6=sábado.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateAvailabilityBody' },
              example: {
                day_of_week: 1,
                start_time: '08:00:00',
                end_time: '17:00:00',
                enabled: true,
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Horario creado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvailabilityResponse' },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Bad Request',
                  message: 'La hora de inicio debe ser menor que la hora de fin.',
                },
              },
            },
          },
          409: {
            description: 'Conflicto por horario duplicado o traslapado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Conflict',
                  message: 'Ya existe un horario registrado para ese rango.',
                },
              },
            },
          },
        },
      },
    },
    '/api/availability/{availabilityId}': {
      get: {
        tags: ['Availability'],
        summary: 'Obtener horario por id',
        description: 'Obtiene el detalle de un horario específico.',
        parameters: [
          {
            name: 'availabilityId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Horario obtenido correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvailabilityResponse' },
              },
            },
          },
          404: {
            description: 'Horario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  success: false,
                  error: 'Not Found',
                  message: 'No se encontró el horario solicitado.',
                },
              },
            },
          },
        },
      },
      patch: {
        tags: ['Availability'],
        summary: 'Actualizar horario',
        description:
          'Actualiza un horario existente. Permite modificar día, rango de horas y si está habilitado.',
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
              example: {
                start_time: '09:00:00',
                end_time: '18:00:00',
                enabled: true,
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Horario actualizado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvailabilityResponse' },
              },
            },
          },
          400: {
            description: 'Datos inválidos',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          404: {
            description: 'Horario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
          409: {
            description: 'Conflicto de horario',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
      delete: {
        tags: ['Availability'],
        summary: 'Deshabilitar horario',
        description:
          'Realiza borrado lógico del horario o lo deja inactivo para que ya no sea considerado en la validación de atención.',
        parameters: [
          {
            name: 'availabilityId',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Horario deshabilitado correctamente',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AvailabilityResponse' },
                example: {
                  success: true,
                  data: {
                    id: '8d6a6d4e-0000-0000-0000-111111111111',
                    day_of_week: 1,
                    start_time: '08:00:00',
                    end_time: '17:00:00',
                    enabled: false,
                  },
                  message: 'Horario deshabilitado correctamente.',
                },
              },
            },
          },
          404: {
            description: 'Horario no encontrado',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
              },
            },
          },
        },
      },
    },
    '/api/internal/conversations/close-timeouts': {
      post: {
        tags: ['Internal'],
        summary: 'Cerrar conversaciones vencidas por inactividad',
        description:
          'Proceso interno que busca conversaciones OPEN cuyo inactivity_deadline_at ya venció y las cierra automáticamente con estado CLOSED_TIMEOUT.',
        responses: {
          200: {
            description: 'Proceso ejecutado correctamente',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/InternalCloseTimeoutsResponse',
                },
                example: {
                  success: true,
                  data: {
                    total_closed: 2,
                    conversations: [
                      {
                        id: '11111111-2222-3333-4444-555555555555',
                        previous_status: 'OPEN',
                        new_status: 'CLOSED_TIMEOUT',
                        close_reason: 'TIMEOUT',
                      },
                      {
                        id: '66666666-7777-8888-9999-000000000000',
                        previous_status: 'OPEN',
                        new_status: 'CLOSED_TIMEOUT',
                        close_reason: 'TIMEOUT',
                      },
                    ],
                  },
                  message: 'Cierre automático ejecutado correctamente.',
                },
              },
            },
          },
        },
      },
    },
  },
};
