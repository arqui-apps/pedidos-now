// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // ============================
      // Alias para broker: /api/soporte
      // ============================

      {
        source: '/api/soporte/health',
        destination: '/api/health',
      },
      {
        source: '/api/soporte/health/db-test',
        destination: '/api/health/db-test',
      },
      {
        source: '/api/soporte/availability',
        destination: '/api/availability',
      },
      {
        source: '/api/soporte/availability/:availabilityId',
        destination: '/api/availability/:availabilityId',
      },

      // Conversaciones
      {
        source: '/api/soporte/conversations',
        destination: '/api/conversations',
      },
      {
        source: '/api/soporte/conversations/:conversationId',
        destination: '/api/conversations/:conversationId',
      },
      {
        source: '/api/soporte/conversations/:conversationId/assign-agent',
        destination: '/api/conversations/:conversationId/assign-agent',
      },
      {
        source: '/api/soporte/conversations/:conversationId/status',
        destination: '/api/conversations/:conversationId/status',
      },
      {
        source: '/api/soporte/conversations/:conversationId/messages',
        destination: '/api/conversations/:conversationId/messages',
      },
      {
        source: '/api/soporte/conversations/:conversationId/external-context',
        destination: '/api/conversations/:conversationId/external-context',
      },

      // Interno / jobs
      {
        source: '/api/soporte/internal/conversations/close-timeouts',
        destination: '/api/internal/conversations/close-timeouts',
      },

      // Integración chatbot
      {
        source:
          '/api/soporte/integrations/chatbot/escalations/:sessionId/accept',
        destination:
          '/api/integrations/chatbot/escalations/:sessionId/accept',
      },
    ];
  },
};

export default nextConfig;