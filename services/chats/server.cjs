const http = require('http');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function conversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}

function userRoom(requesterExtId) {
  return `user:${requesterExtId}`;
}

function agentRoom(agentExtId) {
  return `agent:${agentExtId}`;
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  globalThis.__CHAT_SOCKET_IO__ = io;

  io.on('connection', (socket) => {
    console.log('🔌 Socket conectado:', socket.id);

    socket.emit('socket:connected', {
      socketId: socket.id,
      connectedAt: new Date().toISOString(),
    });

    socket.on('conversation:join', (payload = {}) => {
      const conversationId = payload.conversationId;
      if (!conversationId) return;

      socket.join(conversationRoom(conversationId));

      socket.emit('conversation:joined', {
        conversationId,
        room: conversationRoom(conversationId),
      });
    });

    socket.on('conversation:leave', (payload = {}) => {
      const conversationId = payload.conversationId;
      if (!conversationId) return;

      socket.leave(conversationRoom(conversationId));

      socket.emit('conversation:left', {
        conversationId,
        room: conversationRoom(conversationId),
      });
    });

    socket.on('user:subscribe', (payload = {}) => {
      const requesterExtId = payload.requester_ext_id;
      if (!requesterExtId) return;

      socket.join(userRoom(requesterExtId));

      socket.emit('user:subscribed', {
        requester_ext_id: requesterExtId,
        room: userRoom(requesterExtId),
      });
    });

    socket.on('agent:subscribe', (payload = {}) => {
      const agentExtId = payload.agent_ext_id;
      if (!agentExtId) return;

      socket.join(agentRoom(agentExtId));
      socket.join('agents:lobby');

      socket.emit('agent:subscribed', {
        agent_ext_id: agentExtId,
        room: agentRoom(agentExtId),
      });
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', socket.id, reason);
    });
  });

  server.listen(port, hostname, () => {
    console.log(`🚀 Server listo en http://${hostname}:${port}`);
    console.log(`📡 Socket.IO activo en ws://localhost:${port}`);
  });
});