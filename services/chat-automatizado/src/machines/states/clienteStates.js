// src/machines/states/clienteStates.js

export const clienteStates = {
    MENU_PRINCIPAL_CLIENTE: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "1",
                    target: "PROBLEMA_PEDIDO",
                },
                {
                    guard: ({ event }) => event.input === "2",
                    target: "PROBLEMA_COBRO",
                },
                {
                    guard: ({ event }) => event.input === "3",
                    target: "CONSULTA_PEDIDO",
                },
                {
                    guard: ({ event }) => event.input === "4",
                    target: "FAQ_CLIENTE",
                },
                // Opción inválida: repetir el menú
                { target: "MENU_PRINCIPAL_CLIENTE" },
            ],
        },
    },

    PROBLEMA_PEDIDO: {
        on: {
            OPTION: [
                {
                    // Pedido no llegó o llegó incompleto → cupón
                    guard: ({ event }) => event.input === "1",
                    target: "COMPENSACION_CUPON",
                },
                {
                    // Llegó en mal estado → reembolso
                    guard: ({ event }) => event.input === "2",
                    target: "COMPENSACION_REEMBOLSO",
                },
                {
                    // Otro problema → agente humano
                    guard: ({ event }) => event.input === "3",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
                { target: "PROBLEMA_PEDIDO" },
            ],
        },
    },

    PROBLEMA_COBRO: {
        on: {
            OPTION: [
                {
                    // Cobro duplicado → reembolso
                    guard: ({ event }) => event.input === "1",
                    target: "COMPENSACION_REEMBOLSO",
                },
                {
                    // No reconozco el cargo → agente
                    guard: ({ event }) => event.input === "2",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
                { target: "PROBLEMA_COBRO" },
            ],
        },
    },

    CONSULTA_PEDIDO: {
        on: {
            // Evento especial: el usuario ingresa un código
            INPUT_CODE: {
                // Guardamos el código en el contexto de la máquina
                actions: ({ context, event }) => {
                    context.order_code = event.input;
                },
                target: "CONSULTA_PEDIDO_RESULTADO",
            },
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
                { target: "CONSULTA_PEDIDO" },
            ],
        },
    },

    CONSULTA_PEDIDO_RESULTADO: {
        // El resultado lo genera el servicio dinámicamente
        // Este estado solo maneja el "¿qué sigue?"
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "1",
                    target: "PROBLEMA_PEDIDO",
                },
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
                { target: "CONSULTA_PEDIDO_RESULTADO" },
            ],
        },
    },

    FAQ_CLIENTE: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
                // Cualquier número de FAQ se maneja dinámicamente
                // en el servicio, aquí solo registramos que el
                // usuario sigue en FAQ o quiere salir
                { target: "FAQ_CLIENTE" },
            ],
        },
    },

    COMPENSACION_CUPON: {
        on: {
            // El servicio llama a Descuentos y si tiene éxito
            // envía RESOLVED para cerrar la sesión
            RESOLVED: { target: "RESUELTO" },
            FAILED: { target: "ESCALAR_AGENTE" },
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
            ],
        },
    },

    COMPENSACION_REEMBOLSO: {
        on: {
            RESOLVED: { target: "RESUELTO" },
            FAILED: { target: "ESCALAR_AGENTE" },
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
            ],
        },
    },
};