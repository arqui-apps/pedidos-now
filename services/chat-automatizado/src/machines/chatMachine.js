import { createMachine } from "xstate";
import { clienteStates } from "./states/clienteStates.js";
import { repartidorStates } from "./states/repartidorStates.js";
import { negocioStates } from "./states/negocioStates.js";

export const chatMachine = createMachine({
    id: "chatbot",
    initial: "INICIO",
    context: ({ input }) => ({
        id_usuario: input?.id_usuario ?? null,
        user_type: input?.user_type ?? null,
        order_code: input?.order_code ?? null,
        order_data: input?.order_data ?? null,
        compensation: input?.compensation ?? null,
        error: input?.error ?? null,
    }),
    states: {
        INICIO: {
            always: [
                {
                    guard: ({ context }) => context.user_type === "cliente",
                    target: "MENU_PRINCIPAL_CLIENTE",
                },
                {
                    guard: ({ context }) =>
                        context.user_type === "repartidor",
                    target: "MENU_PRINCIPAL_REPARTIDOR",
                },
                {
                    guard: ({ context }) => context.user_type === "negocio",
                    target: "MENU_PRINCIPAL_NEGOCIO",
                },
            ],
        },

        ESCALAR_AGENTE: {
            type: "final",
        },

        RESUELTO: {
            type: "final",
        },

        ...clienteStates,
        ...repartidorStates,
        ...negocioStates,
    },
});