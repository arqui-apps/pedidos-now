// Máquina de estados para cobros
// Estados permitidos: pendiente → procesando → completado/denegado/cancelado

class CobroStateMachine {
    constructor() {
        this.validStates = ['pendiente', 'procesando', 'completado', 'denegado', 'cancelado'];

        // Transiciones permitidas: estado_actual → [estados_permitidos]
        this.transitions = {
            'pendiente': ['procesando', 'cancelado'],
            'procesando': ['completado', 'denegado'],
            'completado': ['cancelado'],
            'denegado': [],
            'cancelado': []
        };
    }

    isValidState(state) {
        return this.validStates.includes(state);
    }

    canTransition(fromState, toState) {
        if (!this.isValidState(fromState) || !this.isValidState(toState)) {
            return false;
        }
        return this.transitions[fromState].includes(toState);
    }

    transition(fromState, toState) {
        if (!this.canTransition(fromState, toState)) {
            throw new Error(
                `Transición no permitida: ${fromState} → ${toState}. ` +
                `Transiciones permitidas desde ${fromState}: ${this.transitions[fromState].join(', ')}`
            );
        }
        return toState;
    }

    getValidTransitions(state) {
        if (!this.isValidState(state)) {
            throw new Error(`Estado inválido: ${state}`);
        }
        return this.transitions[state];
    }

    getStateInfo(state) {
        return {
            state,
            isValid: this.isValidState(state),
            validTransitions: this.transitions[state] || [],
            isFinal: this.transitions[state].length === 0
        };
    }
}

module.exports = CobroStateMachine;