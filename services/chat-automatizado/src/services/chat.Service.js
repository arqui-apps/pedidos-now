import { createActor } from "xstate";
import { chatMachine } from "../machines/chatMachine.js";
import * as ext from "./externalServices.js";
import {
    ChatSession,
    Mensaje,
    Menu,
    Compensation,
    SupportRequest,
} from "../models/index.js";

const HUMAN_SENDER_BY_USER_TYPE = {
    cliente: "cliente",
    repartidor: "repartidor",
    negocio: "negocio",
};

const STATIC_MESSAGES = {
    PROBLEMA_PEDIDO:
        "¿Qué problema tuviste con tu pedido?\n" +
        "1. Pedido no llegó o llegó incompleto\n" +
        "2. Pedido llegó en mal estado\n" +
        "3. Otro problema\n" +
        "0. Volver al menú",

    PROBLEMA_COBRO:
        "¿Qué problema tienes con el cobro?\n" +
        "1. Cobro duplicado\n" +
        "2. No reconozco el cargo\n" +
        "0. Volver al menú",

    CONSULTA_PEDIDO:
        "Ingresa el código de tu pedido.\n" + "0. Volver al menú",

    FAQ_CLIENTE:
        "Preguntas frecuentes para clientes.\n" +
        "Por ahora esta vista se integrará con tu módulo FAQ.\n" +
        "0. Volver al menú",

    PROBLEMA_ENTREGA:
        "¿Qué problema tienes con la entrega?\n" +
        "1. Cliente no responde\n" +
        "2. Dirección incorrecta\n" +
        "3. Necesito apoyo en carretera\n" +
        "0. Volver al menú",

    PROBLEMA_PAGO_REPARTIDOR:
        "¿Qué problema tienes con tu pago?\n" +
        "1. No recibí el pago\n" +
        "2. Monto incorrecto\n" +
        "0. Volver al menú",

    SOPORTE_CARRETERA:
        "Tu solicitud de apoyo en carretera fue registrada.\n" +
        "Un agente dará seguimiento.",

    FAQ_REPARTIDOR:
        "Preguntas frecuentes para repartidores.\n" +
        "0. Volver al menú",

    PROBLEMA_PEDIDO_NEGOCIO:
        "¿Qué problema tienes con el pedido?\n" +
        "1. Cliente no recogió / canceló tarde\n" +
        "2. Pedido con datos incorrectos\n" +
        "0. Volver al menú",

    CANCELAR_PEDIDO_NEGOCIO:
        "Ingresa el código del pedido que deseas cancelar.\n" +
        "0. Volver al menú",

    PROBLEMA_COBRO_NEGOCIO:
        "¿Qué problema tienes con el cobro?\n" +
        "1. Hablar con agente\n" +
        "0. Volver al menú",

    FAQ_NEGOCIO:
        "Preguntas frecuentes para negocios.\n" + "0. Volver al menú",

    ESCALAR_AGENTE:
        "Tu caso será escalado a un agente de servicio al cliente.",

    RESUELTO: "Tu caso fue resuelto correctamente. Gracias por contactarnos.",
};

function getPersistedSnapshot(actor) {
    if (typeof actor.getPersistedSnapshot === "function") {
        return actor.getPersistedSnapshot();
    }

    return actor.getSnapshot();
}

function normalizePersistedSnapshot(rawSnapshot) {
    if (!rawSnapshot) return null;

    let snapshot = rawSnapshot;

    if (typeof snapshot === "string") {
        try {
            snapshot = JSON.parse(snapshot);
        } catch (error) {
            console.warn("No se pudo parsear chat_context:", error);
            return null;
        }
    }

    if (!snapshot || typeof snapshot !== "object") {
        return null;
    }

    if (!snapshot.children || typeof snapshot.children !== "object") {
        snapshot.children = {};
    }

    return snapshot;
}

function isFinalState(state) {
    return state === "RESUELTO" || state === "ESCALAR_AGENTE";
}

function normalizeInput(input) {
    if (input === undefined || input === null) return "";
    return String(input).trim();
}

function resolveEventType(currentState, inputType) {
    if (inputType) return inputType;

    if (
        currentState === "CONSULTA_PEDIDO" ||
        currentState === "CANCELAR_PEDIDO_NEGOCIO"
    ) {
        return "INPUT_CODE";
    }

    return "OPTION";
}

async function saveMessage(id_session, sender, content) {
    return Mensaje.create({
        id_session,
        message_sender: sender,
        message_content: content,
    });
}

async function getMenuMessage(state, userType) {
    const menu = await Menu.findOne({
        where: {
            actual_state: state,
            is_active: 1,
        },
    });

    if (!menu) {
        return STATIC_MESSAGES[state] || `Estado actual: ${state}`;
    }

    if (
        menu.audience_type === "todos" ||
        menu.audience_type === userType ||
        menu.audience_type === null
    ) {
        return menu.menu_content;
    }

    return STATIC_MESSAGES[state] || `Estado actual: ${state}`;
}

async function buildBotMessage(state, context, userType, extra = {}) {
    if (state === "CONSULTA_PEDIDO_RESULTADO") {
        if (extra.orderFound) {
            return (
                "Pedido encontrado:\n" +
                `Código: ${extra.order?.order_code || context.order_code}\n` +
                `Estado: ${extra.order?.status || "desconocido"}\n` +
                `Origen: ${extra.order?.source || "N/A"}\n\n` +
                "1. Reportar problema con pedido\n" +
                "0. Volver al menú"
            );
        }

        return (
            "No se encontró información para el pedido ingresado.\n" +
            "0. Volver al menú"
        );
    }

    if (state === "COMPENSACION_CUPON") {
        return (
            "Se generó un cupón de compensación.\n" +
            `Código: ${extra.cupon_code}\n` +
            `Monto: Q${extra.amount}\n`
        );
    }

    if (state === "COMPENSACION_REEMBOLSO") {
        return extra.processed
            ? `Reembolso procesado por Q${extra.amount}.`
            : `Tu reembolso por Q${extra.amount} quedó pendiente de procesamiento.`;
    }

    if (state === "SOPORTE_CARRETERA") {
        return (
            "Tu solicitud de apoyo en carretera fue creada exitosamente.\n" +
            `No. solicitud: ${extra.id_support_request || "N/A"}`
        );
    }

    if (state === "CANCELAR_PEDIDO_NEGOCIO_CONFIRMAR") {
        return (
            "Confirma la cancelación del pedido:\n" +
            `${context.order_code}\n` +
            "1. Confirmar cancelación\n" +
            "2. No cancelar"
        );
    }

    return getMenuMessage(state, userType);
}

export async function startSession({ id_usuario, user_type }) {
    if (!id_usuario || !user_type) {
        throw new Error("id_usuario y user_type son obligatorios");
    }

    const user = await ext.getUserById(id_usuario);

    if (!user) {
        throw new Error("No se pudo validar el usuario");
    }

    const existingSession = await ChatSession.findOne({
        where: {
            id_usuario,
            user_type,
            session_status: "active",
            is_active: 1,
        },
        order: [["id_session", "DESC"]],
    });

    if (existingSession) {
        const persistedSnapshot = normalizePersistedSnapshot(
            existingSession.chat_context
        );
        const persistedContext = persistedSnapshot?.context || {};
        const botMessage = await buildBotMessage(
            existingSession.current_state,
            persistedContext,
            user_type
        );

        return {
            resumed: true,
            id_session: existingSession.id_session,
            state: existingSession.current_state,
            message: botMessage,
        };
    }

    const actor = createActor(chatMachine, {
        input: {
            id_usuario,
            user_type,
        },
    });

    actor.start();

    const snapshot = actor.getSnapshot();
    const persistedSnapshot = getPersistedSnapshot(actor);
    const currentState = String(snapshot.value);

    const session = await ChatSession.create({
        id_usuario,
        user_type,
        current_state: currentState,
        previous_state: null,
        chat_context: persistedSnapshot,
        session_status: "active",
        start_time: new Date(),
        is_active: 1,
    });

    const botMessage = await buildBotMessage(
        currentState,
        persistedSnapshot.context || {},
        user_type
    );

    await saveMessage(session.id_session, "bot", botMessage);

    return {
        resumed: false,
        id_session: session.id_session,
        state: currentState,
        message: botMessage,
    };
}

export async function sendMessage({ id_session, input, input_type = null }) {
    const session = await ChatSession.findByPk(id_session);

    if (!session) {
        throw new Error("Sesión no encontrada");
    }

    if (session.session_status !== "active") {
        throw new Error("La sesión ya no está activa");
    }

    const normalizedInput = normalizeInput(input);
    const restoredSnapshot = normalizePersistedSnapshot(session.chat_context);
    const actorInput = {
        id_usuario: session.id_usuario,
        user_type: session.user_type,
    };

    console.log("typeof session.chat_context:", typeof session.chat_context);
    console.log("session.chat_context:", session.chat_context);
    console.log("session.current_state:", session.current_state);
    console.log("session.user_type:", session.user_type);
    console.log("session.id_usuario:", session.id_usuario);

    let actor;

    try {
        actor = restoredSnapshot
            ? createActor(chatMachine, {
                snapshot: restoredSnapshot,
            })
            : createActor(chatMachine, {
                input: actorInput,
            });

        actor.start();
    } catch (error) {
        console.warn(
            `Snapshot inválido para la sesión ${id_session}, iniciando actor desde cero`,
            error
        );

        actor = createActor(chatMachine, {
            input: actorInput,
        });
        actor.start();
    }


    const beforeState = String(actor.getSnapshot().value);
    const humanSender =
        HUMAN_SENDER_BY_USER_TYPE[session.user_type] || "cliente";

    await saveMessage(id_session, humanSender, normalizedInput);

    const eventType = resolveEventType(beforeState, input_type);

    actor.send({
        type: eventType,
        input: normalizedInput,
    });

    let currentState = String(actor.getSnapshot().value);
    let resolution = null;
    let extra = {};
    let botMessage = null;

    if (currentState === "CONSULTA_PEDIDO_RESULTADO") {
        const order = await ext.getOrderByCode(
            actor.getSnapshot().context.order_code
        );

        extra = {
            orderFound: !!order,
            order,
        };

        botMessage = await buildBotMessage(
            currentState,
            actor.getSnapshot().context,
            session.user_type,
            extra
        );
    } else if (currentState === "COMPENSACION_CUPON") {
        const coupon = await ext.createCompensationCoupon(
            session.id_usuario,
            25.0,
            "Compensación por problema con pedido"
        );

        await Compensation.create({
            id_usuario: session.id_usuario,
            id_session,
            amount: 25.0,
            cupon_code: coupon.cupon_code,
            expiration_date: coupon.expiration_date,
            reason: "Compensación por problema con pedido",
            compensation_type: "cupon",
            compensation_status: "pendiente",
            is_active: 1,
        });

        extra = {
            cupon_code: coupon.cupon_code,
            amount: 25.0,
        };

        botMessage = await buildBotMessage(
            currentState,
            actor.getSnapshot().context,
            session.user_type,
            extra
        );

        actor.send({ type: "RESOLVED" });
        currentState = String(actor.getSnapshot().value);
        resolution = "resuelto_con_cupon";
    } else if (currentState === "COMPENSACION_REEMBOLSO") {
        const refund = await ext.requestRefund(
            session.id_usuario,
            50.0,
            "Reembolso por problema reportado en chat automatizado",
            id_session
        );

        await Compensation.create({
            id_usuario: session.id_usuario,
            id_session,
            amount: 50.0,
            cupon_code: null,
            expiration_date: null,
            reason: "Reembolso por problema reportado en chat automatizado",
            compensation_type: "reembolso",
            compensation_status: refund.processed
                ? "procesado"
                : "pendiente",
            is_active: 1,
        });

        extra = {
            processed: refund.processed,
            amount: 50.0,
        };

        botMessage = await buildBotMessage(
            currentState,
            actor.getSnapshot().context,
            session.user_type,
            extra
        );

        actor.send({ type: "RESOLVED" });
        currentState = String(actor.getSnapshot().value);
        resolution = refund.processed
            ? "resuelto_con_reembolso"
            : "resuelto_con_reembolso";
    } else if (currentState === "SOPORTE_CARRETERA") {
        const support = await SupportRequest.create({
            id_delivery: session.id_usuario,
            id_pedido: null,
            id_session,
            id_problem: null,
            request_status: "pendiente",
            problem_details: "Solicitud generada desde chat automatizado",
            is_active: 1,
        });

        extra = {
            id_support_request: support.id_support_request,
        };

        botMessage = await buildBotMessage(
            currentState,
            actor.getSnapshot().context,
            session.user_type,
            extra
        );

        actor.send({ type: "RESOLVED" });
        currentState = String(actor.getSnapshot().value);
        resolution = "resuelto";
    } else {
        botMessage = await buildBotMessage(
            currentState,
            actor.getSnapshot().context,
            session.user_type
        );

        if (currentState === "ESCALAR_AGENTE") {
            resolution = "escalado_a_agente";
        }

        if (currentState === "RESUELTO") {
            resolution = "resuelto";
        }
    }

    const persistedSnapshot = getPersistedSnapshot(actor);
    const finalState = String(actor.getSnapshot().value);
    const final = isFinalState(finalState);

    await session.update({
        previous_state: beforeState,
        current_state: finalState,
        chat_context: persistedSnapshot,
        session_status: final ? "inactive" : "active",
        end_time: final ? new Date() : null,
        resolution,
    });

    await saveMessage(id_session, "bot", botMessage);

    return {
        id_session,
        previous_state: beforeState,
        state: finalState,
        message: botMessage,
        is_final: final,
    };
}

export async function getHistory(id_session) {
    return Mensaje.findAll({
        where: { id_session, is_active: 1 },
        order: [["id_mensaje", "ASC"]],
    });
}