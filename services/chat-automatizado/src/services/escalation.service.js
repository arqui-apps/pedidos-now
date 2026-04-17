import { Mensaje, EscalationPayload } from "../models/index.js";

// ─── Mapeo: estado anterior → categoría del problema ─────────────────────────
const STATE_TO_CATEGORY = {
    PROBLEMA_PEDIDO:              "problema_pedido_desconocido",
    PROBLEMA_COBRO:               "cargo_no_reconocido",
    PROBLEMA_ENTREGA:             "cliente_no_responde",      // default entrega
    PROBLEMA_PAGO_REPARTIDOR:     "pago_repartidor",
    PROBLEMA_PEDIDO_NEGOCIO:      "problema_pedido_negocio",
    PROBLEMA_COBRO_NEGOCIO:       "problema_cobro_negocio",
    COMPENSACION_CUPON:           "compensacion_fallida",
    COMPENSACION_REEMBOLSO:       "compensacion_fallida",
};

// Ajuste fino por estado + opción elegida
const OPTION_CATEGORY_OVERRIDE = {
    PROBLEMA_PEDIDO:   { "3": "problema_pedido_desconocido" },
    PROBLEMA_COBRO:    { "2": "cargo_no_reconocido" },
    PROBLEMA_ENTREGA:  {
        "1": "cliente_no_responde",
        "2": "direccion_incorrecta",
    },
};

// ─── Resúmenes en lenguaje natural para el agente ─────────────────────────────
const SUMMARY_TEMPLATES = {
    problema_pedido_desconocido: (u, ctx) =>
        `${u.name} (${u.user_type}) reportó un problema con su pedido que el chatbot no pudo resolver automáticamente. ` +
        (ctx.order_code ? `Código de pedido consultado: ${ctx.order_code}. ` : "") +
        "El cliente seleccionó 'Otro problema'. Se requiere revisión manual.",

    cargo_no_reconocido: (u) =>
        `${u.name} (${u.user_type}) reportó un cargo que no reconoce en su cuenta. ` +
        "El chatbot no puede validar transacciones bancarias directamente. Se requiere verificación por parte del agente.",

    cliente_no_responde: (u) =>
        `${u.name} (repartidor) reportó que el cliente no responde en la dirección de entrega. ` +
        "El chatbot no puede contactar al cliente directamente. Se necesita intervención del agente.",

    direccion_incorrecta: (u) =>
        `${u.name} (repartidor) reportó que la dirección de entrega es incorrecta o no existe. ` +
        "Se requiere que el agente coordine con el cliente y el repartidor para resolver la entrega.",

    problema_cobro_negocio: (u) =>
        `${u.name} (negocio) reportó un problema con sus cobros o liquidaciones. ` +
        "Requiere revisión del área financiera y atención directa de un agente.",

    problema_pedido_negocio: (u) =>
        `${u.name} (negocio) reportó un problema con un pedido de cliente. ` +
        "El chatbot no pudo resolver el caso automáticamente. Se requiere revisión.",

    pago_repartidor: (u) =>
        `${u.name} (repartidor) reportó un problema con su pago o liquidación. ` +
        "El chatbot no tiene acceso a modificar pagos de repartidores. Requiere atención de agente.",

    compensacion_fallida: (u, ctx) =>
        `El intento de compensación automática para ${u.name} (${u.user_type}) falló. ` +
        (ctx.order_code ? `Pedido relacionado: ${ctx.order_code}. ` : "") +
        "Se requiere que el agente procese la compensación manualmente.",

    otro: (u) =>
        `${u.name} (${u.user_type}) necesita asistencia que el chatbot no pudo proveer. ` +
        "Ver historial de conversación para más detalles.",
};

// ─── Nombres amigables para los usuarios ─────────────────────────────────────
const USER_TYPE_LABEL = { cliente: "cliente", repartidor: "repartidor", negocio: "negocio" };

function detectCategory(previousState, lastUserInput) {
    // Primero intenta override por opción específica
    if (previousState && lastUserInput && OPTION_CATEGORY_OVERRIDE[previousState]) {
        const override = OPTION_CATEGORY_OVERRIDE[previousState][String(lastUserInput)];
        if (override) return override;
    }
    return STATE_TO_CATEGORY[previousState] || "otro";
}

function buildSummary(category, userInfo, contextData) {
    const fn = SUMMARY_TEMPLATES[category] || SUMMARY_TEMPLATES.otro;
    return fn(userInfo, contextData || {});
}

// ─── Función principal: construir y guardar el escalation payload ─────────────
export async function buildEscalationPayload({
    session,
    previousState,
    lastUserInput,
    machineContext,
}) {
    // 1. Obtener historial completo de mensajes
    const messages = await Mensaje.findAll({
        where: { id_session: session.id_session, is_active: 1 },
        order: [["id_mensaje", "ASC"]],
    });

    const conversationHistory = messages.map((m) => ({
        id_mensaje: m.id_mensaje,
        sender: m.message_sender,
        content: m.message_content,
        sent_time: m.sent_time,
    }));

    // 2. Detectar categoría del problema
    const category = detectCategory(previousState, lastUserInput);

    // 3. Info básica del usuario (lo que tenemos sin llamar a Auth)
    const userInfo = {
        id_usuario: session.id_usuario,
        user_type: session.user_type,
        name: `Usuario #${session.id_usuario}`,  // Auth lo enriquecerá si está disponible
    };

    // 4. Datos de contexto de la máquina XState
    const contextData = {
        order_code: machineContext?.order_code || null,
        order_data: machineContext?.order_data || null,
        compensation: machineContext?.compensation || null,
        session_start: session.start_time,
        total_messages: conversationHistory.length,
    };

    // 5. Generar resumen para el agente
    const summary = buildSummary(category, userInfo, contextData);

    // 6. Guardar en BD
    const payload = await EscalationPayload.create({
        id_session: session.id_session,
        id_usuario: session.id_usuario,
        user_type: session.user_type,
        problem_category: category,
        escalation_state: "ESCALAR_AGENTE",
        previous_state: previousState || null,
        summary,
        conversation_history: conversationHistory,
        context_data: contextData,
        handoff_status: "pendiente",
        is_active: 1,
    });

    return {
        id_escalation: payload.id_escalation,
        id_session: session.id_session,
        id_usuario: session.id_usuario,
        user_type: session.user_type,
        problem_category: category,
        previous_state: previousState,
        summary,
        context_data: contextData,
        conversation_history: conversationHistory,
        handoff_status: "pendiente",
        created_at: payload.created_date,
    };
}