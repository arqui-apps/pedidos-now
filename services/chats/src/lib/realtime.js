function getSocketServer() {
  return globalThis.__CHAT_SOCKET_IO__ || null;
}

function conversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}

function userRoom(requesterExtId) {
  return `user:${requesterExtId}`;
}

function agentRoom(agentExtId) {
  return `agent:${agentExtId}`;
}

function sanitizeRealtimeValue(value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeRealtimeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sanitizeRealtimeValue(nestedValue),
      ])
    );
  }

  return value;
}

function buildRealtimePayload(event, conversation, extra = {}) {
  return sanitizeRealtimeValue({
    event,
    conversationId: conversation?.id || null,
    data: conversation || null,
    meta: {
      emitted_at: new Date(),
      ...extra,
    },
  });
}

function getTargetRooms(conversation) {
  const rooms = new Set();

  if (!conversation?.id) {
    return [];
  }

  rooms.add(conversationRoom(conversation.id));

  if (conversation.requester_ext_id) {
    rooms.add(userRoom(conversation.requester_ext_id));
  }

  if (conversation.assigned_agent_ext_id) {
    rooms.add(agentRoom(conversation.assigned_agent_ext_id));
  }

  rooms.add('agents:lobby');

  return Array.from(rooms);
}

function emitDedupedToRooms(io, rooms, event, payload) {
  const targetSocketIds = new Set();

  for (const room of rooms) {
    const socketIds = io.sockets.adapter.rooms.get(room);
    if (!socketIds) continue;

    for (const socketId of socketIds) {
      targetSocketIds.add(socketId);
    }
  }

  for (const socketId of targetSocketIds) {
    io.to(socketId).emit(event, payload);
  }

  return targetSocketIds.size;
}

function emitToConversationTargets(event, conversation, extra = {}) {
  const io = getSocketServer();

  if (!io || !conversation?.id) {
    return false;
  }

  const payload = buildRealtimePayload(event, conversation, extra);
  const rooms = getTargetRooms(conversation);

  emitDedupedToRooms(io, rooms, event, payload);

  return true;
}

export function emitConversationCreated(conversation) {
  return emitToConversationTargets('conversation.created', conversation, {
    kind: 'conversation_created',
  });
}

export function emitConversationUpdated(conversation) {
  return emitToConversationTargets('conversation.updated', conversation, {
    kind: 'conversation_updated',
  });
}

export function emitConversationAssigned(conversation) {
  return emitToConversationTargets('conversation.assigned', conversation, {
    kind: 'agent_assigned',
  });
}

export function emitConversationStatusChanged(conversation, change = {}) {
  return emitToConversationTargets('conversation.status_changed', conversation, {
    kind: 'status_changed',
    ...change,
  });
}

export function emitMessageCreated({ conversation, message }) {
  const io = getSocketServer();

  if (!io || !conversation?.id || !message) {
    return false;
  }

  const payload = sanitizeRealtimeValue({
    event: 'message.created',
    conversationId: conversation.id,
    data: message,
    meta: {
      emitted_at: new Date(),
    },
  });

  const rooms = getTargetRooms(conversation);
  emitDedupedToRooms(io, rooms, 'message.created', payload);

  return true;
}