// src/machines/states/negocioStates.js

export const negocioStates = {
    MENU_PRINCIPAL_NEGOCIO: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "1",
                    target: "PROBLEMA_PEDIDO_NEGOCIO",
                },
                {
                    guard: ({ event }) => event.input === "2",
                    target: "CANCELAR_PEDIDO_NEGOCIO",
                },
                {
                    guard: ({ event }) => event.input === "3",
                    target: "PROBLEMA_COBRO_NEGOCIO",
                },
                {
                    guard: ({ event }) => event.input === "4",
                    target: "FAQ_NEGOCIO",
                },
                { target: "MENU_PRINCIPAL_NEGOCIO" },
            ],
        },
    },

    PROBLEMA_PEDIDO_NEGOCIO: {
        on: {
            OPTION: [
                {
                    // Cliente no recogió / canceló tarde
                    guard: ({ event }) => event.input === "1",
                    target: "ESCALAR_AGENTE",
                },
                {
                    // Pedido con datos incorrectos
                    guard: ({ event }) => event.input === "2",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_NEGOCIO",
                },
                { target: "PROBLEMA_PEDIDO_NEGOCIO" },
            ],
        },
    },

    CANCELAR_PEDIDO_NEGOCIO: {
        on: {
            // El negocio ingresa el código del pedido a cancelar
            INPUT_CODE: {
                actions: ({ context, event }) => {
                    context.order_code = event.input;
                },
                target: "CANCELAR_PEDIDO_NEGOCIO_CONFIRMAR",
            },
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_NEGOCIO",
                },
                { target: "CANCELAR_PEDIDO_NEGOCIO" },
            ],
        },
    },

    CANCELAR_PEDIDO_NEGOCIO_CONFIRMAR: {
        on: {
            OPTION: [
                {
                    // Confirma cancelación
                    guard: ({ event }) => event.input === "1",
                    target: "RESUELTO",
                },
                {
                    // Cancela la cancelación
                    guard: ({ event }) => event.input === "2",
                    target: "MENU_PRINCIPAL_NEGOCIO",
                },
                { target: "CANCELAR_PEDIDO_NEGOCIO_CONFIRMAR" },
            ],
        },
    },

    PROBLEMA_COBRO_NEGOCIO: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "1",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_NEGOCIO",
                },
                { target: "PROBLEMA_COBRO_NEGOCIO" },
            ],
        },
    },

    FAQ_NEGOCIO: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_NEGOCIO",
                },
                { target: "FAQ_NEGOCIO" },
            ],
        },
    },
};