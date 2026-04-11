export const repartidorStates = {
    MENU_PRINCIPAL_REPARTIDOR: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "1",
                    target: "PROBLEMA_ENTREGA",
                },
                {
                    guard: ({ event }) => event.input === "2",
                    target: "PROBLEMA_PAGO_REPARTIDOR",
                },
                {
                    guard: ({ event }) => event.input === "3",
                    target: "SOPORTE_CARRETERA",
                },
                {
                    guard: ({ event }) => event.input === "4",
                    target: "FAQ_REPARTIDOR",
                },
                { target: "MENU_PRINCIPAL_REPARTIDOR" },
            ],
        },
    },

    PROBLEMA_ENTREGA: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "1",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "2",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "3",
                    target: "SOPORTE_CARRETERA",
                },
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_REPARTIDOR",
                },
                { target: "PROBLEMA_ENTREGA" },
            ],
        },
    },

    PROBLEMA_PAGO_REPARTIDOR: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "1",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "2",
                    target: "ESCALAR_AGENTE",
                },
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_REPARTIDOR",
                },
                { target: "PROBLEMA_PAGO_REPARTIDOR" },
            ],
        },
    },

    SOPORTE_CARRETERA: {
        on: {
            RESOLVED: { target: "RESUELTO" },
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_REPARTIDOR",
                },
                { target: "SOPORTE_CARRETERA" },
            ],
        },
    },

    FAQ_REPARTIDOR: {
        on: {
            OPTION: [
                {
                    guard: ({ event }) => event.input === "0",
                    target: "MENU_PRINCIPAL_REPARTIDOR",
                },
                { target: "FAQ_REPARTIDOR" },
            ],
        },
    },
};