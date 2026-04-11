const guards = {
    /**
     * Verifica si el input del usuario es una opción válida.
     * params.options es el arreglo de opciones aceptadas.
     *
     * Ejemplo de uso:
     * guard: { type: "isOption", params: { options: ["1","2","3"] } }
     */
    isOption: ({ event }, params) => {
        if (!event.input) return false;
        return params.options.includes(event.input.trim());
    },

    /**
     * Verifica que el input no esté vacío y tenga una longitud razonable.
     * Se usa cuando el usuario ingresa un código de pedido.
     */
    isValidCode: ({ event }) => {
        if (!event.input) return false;
        const trimmed = event.input.trim();
        // Mínimo 3 caracteres, máximo 50
        return trimmed.length >= 3 && trimmed.length <= 50;
    },

    /**
     * Verifica el tipo de usuario en el contexto.
     * Se usa en el estado INICIO para saber qué menú mostrar.
     */
    isCliente: ({ context }) => context.user_type === "cliente",
    isRepartidor: ({ context }) => context.user_type === "repartidor",
    isNegocio: ({ context }) => context.user_type === "negocio",
};

module.exports = { guards };