// Máquina de estados para cobros
// Estados permitidos: pendiente → procesando → completado/denegado/cancelado

class CobroStateMachine {
    constructor() {
        this.validStates = [
            'pendiente',
            'procesando',

            // estados distribuidos
            'banco_aprobado',
            'cobros_confirmado',

            // finales correctos
            'completado',
            'denegado',
            'cancelado',

            // resiliencia
            'inconsistente',
            'reversion_pendiente',
            'reconciliacion_manual'
        ];
        // Transiciones permitidas: estado_actual → [estados_permitidos]
        this.transitions = {
            pendiente: [
                'procesando',
                'cancelado'
            ],

            procesando: [
                'banco_aprobado',
                'denegado',
                'inconsistente'
            ],

            banco_aprobado: [
                'cobros_confirmado',
                'reversion_pendiente',
                'inconsistente'
            ],

            cobros_confirmado: [
                'completado',
                'reconciliacion_manual'
            ],

            completado: [
                'cancelado'
            ],

            denegado: [],

            cancelado: [],

            inconsistente: [
                'reconciliacion_manual',
                'reversion_pendiente'
            ],

            reversion_pendiente: [
                'cancelado',
                'reconciliacion_manual'
            ],

            reconciliacion_manual: [
                'completado',
                'cancelado'
            ]
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