require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./src/config/db');

// Color codes para output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gray: '\x1b[90m'
};

const log = {
    title: (msg) => console.log(`\n${colors.bright}${colors.cyan}=== ${msg} ===${colors.reset}`),
    success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
    error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
    warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
    info: (msg) => console.log(`${colors.gray}→ ${msg}${colors.reset}`),
    result: (msg) => console.log(`${colors.bright}${msg}${colors.reset}`)
};

// ========== CIRCUIT BREAKER TESTS ==========

class CircuitBreakerTester {
    constructor() {
        this.failureCount = 0;
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    async testBasicFunctionality() {
        log.title('Circuit Breaker - Funcionalidad Básica');
        
        try {
            const CircuitBreaker = require('./src/utils/circuit-breaker');
            const cb = new CircuitBreaker({
                failureThreshold: 3,
                resetTimeout: 5000
            });

            // Test 1: Estado inicial debe ser CLOSED
            const state = cb.getState();
            if (state.state === 'CLOSED') {
                log.success('Estado inicial es CLOSED');
                this.testsPassed++;
            } else {
                log.error(`Estado inicial debería ser CLOSED, es ${state.state}`);
                this.testsFailed++;
            }

            // Test 2: Ejecutar función exitosa
            const result = await cb.execute(() => Promise.resolve('éxito'));
            if (result === 'éxito') {
                log.success('Función exitosa ejecutada correctamente');
                this.testsPassed++;
            } else {
                log.error('Función exitosa retornó valor inesperado');
                this.testsFailed++;
            }

            // Test 3: Simular fallos hasta abrir circuito
            for (let i = 0; i < 3; i++) {
                try {
                    await cb.execute(() => Promise.reject(new Error('Fallo simulado')));
                } catch (e) {
                    // Esperado
                }
            }

            const stateAfterFailures = cb.getState();
            if (stateAfterFailures.state === 'OPEN') {
                log.success('Circuit breaker abierto después de 3 fallos');
                this.testsPassed++;
            } else {
                log.error(`Circuit breaker debería estar OPEN, está ${stateAfterFailures.state}`);
                this.testsFailed++;
            }

            // Test 4: Intentar ejecutar con circuito abierto debe lanzar error
            try {
                await cb.execute(() => Promise.resolve('no debería ejecutar'));
                log.error('Debería haber lanzado error con circuito OPEN');
                this.testsFailed++;
            } catch (e) {
                if (e.message.includes('Circuit breaker OPEN')) {
                    log.success('Circuito rechaza peticiones cuando está OPEN');
                    this.testsPassed++;
                } else {
                    log.error(`Error inesperado: ${e.message}`);
                    this.testsFailed++;
                }
            }

        } catch (error) {
            log.error(`Error en tests del circuit breaker: ${error.message}`);
            this.testsFailed++;
        }
    }

    printResults() {
        log.result(`\nCircuit Breaker: ${this.testsPassed}/${this.testsPassed + this.testsFailed} tests pasaron`);
        return this.testsFailed === 0;
    }
}

// ========== STATE MACHINE TESTS ==========

class StateMachineTester {
    constructor() {
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    async testBasicTransitions() {
        log.title('Máquina de Estados - Transiciones Válidas');

        try {
            const CobroStateMachine = require('./src/utils/cobro-state-machine');
            const sm = new CobroStateMachine();

            // Test 1: Transición válida pendiente → procesando
            if (sm.canTransition('pendiente', 'procesando')) {
                log.success('Transición pendiente → procesando es válida');
                this.testsPassed++;
            } else {
                log.error('Transición pendiente → procesando debería ser válida');
                this.testsFailed++;
            }

            // Test 2: Transición válida procesando → completado
            if (sm.canTransition('procesando', 'completado')) {
                log.success('Transición procesando → completado es válida');
                this.testsPassed++;
            } else {
                log.error('Transición procesando → completado debería ser válida');
                this.testsFailed++;
            }

            // Test 3: Transición válida completado → cancelado
            if (sm.canTransition('completado', 'cancelado')) {
                log.success('Transición completado → cancelado es válida');
                this.testsPassed++;
            } else {
                log.error('Transición completado → cancelado debería ser válida');
                this.testsFailed++;
            }

        } catch (error) {
            log.error(`Error en tests de máquina de estados: ${error.message}`);
            this.testsFailed++;
        }
    }

    async testInvalidTransitions() {
        log.title('Máquina de Estados - Transiciones Inválidas');

        try {
            const CobroStateMachine = require('./src/utils/cobro-state-machine');
            const sm = new CobroStateMachine();

            // Test 1: Transición inválida completado → pendiente
            if (!sm.canTransition('completado', 'pendiente')) {
                log.success('Transición completado → pendiente es correctamente rechazada');
                this.testsPassed++;
            } else {
                log.error('Transición completado → pendiente debería ser inválida');
                this.testsFailed++;
            }

            // Test 2: Transición inválida denegado → cualquiera
            if (!sm.canTransition('denegado', 'completado')) {
                log.success('Transición denegado → completado es correctamente rechazada');
                this.testsPassed++;
            } else {
                log.error('Transición denegado → completado debería ser inválida');
                this.testsFailed++;
            }

            // Test 3: Lanzar error con transition()
            try {
                sm.transition('completado', 'pendiente');
                log.error('transition() debería lanzar error para transición inválida');
                this.testsFailed++;
            } catch (e) {
                if (e.message.includes('no permitida')) {
                    log.success('transition() lanza error apropiado para transición inválida');
                    this.testsPassed++;
                } else {
                    log.error(`Error inesperado: ${e.message}`);
                    this.testsFailed++;
                }
            }

        } catch (error) {
            log.error(`Error en tests de transiciones inválidas: ${error.message}`);
            this.testsFailed++;
        }
    }

    printResults() {
        log.result(`\nMáquina de Estados: ${this.testsPassed}/${this.testsPassed + this.testsFailed} tests pasaron`);
        return this.testsFailed === 0;
    }
}

// ========== VALIDACIÓN TESTS ==========

class ValidationTester {
    constructor() {
        this.testsPassed = 0;
        this.testsFailed = 0;
    }

    async testCobroSchema() {
        log.title('Validación de Schema - Cobros');

        try {
            const Joi = require('joi');

            // Schema mejorado
            const cobroSchema = Joi.object({
                cliente_id: Joi.number().integer().positive().required(),
                pedido_id: Joi.number().integer().positive().required(),
                monto_total: Joi.number().positive().max(99999.99).required(),
                tarifa_servicio: Joi.number().min(0).max(9999.99).optional(),
                propina: Joi.number().min(0).max(9999.99).optional(),
                tipo_pago: Joi.string().valid('efectivo', 'tarjeta', 'cupon').required(),
                repartidor_id: Joi.number().integer().positive().optional(),
                cupon_id: Joi.number().integer().positive().when('tipo_pago', {
                    is: 'cupon',
                    then: Joi.required(),
                    otherwise: Joi.optional()
                })
            });

            // Test 1: Payload válido con tarjeta
            const validPayload1 = {
                cliente_id: 1,
                pedido_id: 100,
                monto_total: 50.00,
                tarifa_servicio: 4.00,
                propina: 5.00,
                tipo_pago: 'tarjeta',
                repartidor_id: 10
            };

            const { error: error1 } = cobroSchema.validate(validPayload1);
            if (!error1) {
                log.success('Payload válido con tarjeta pasó validación');
                this.testsPassed++;
            } else {
                log.error(`Payload válido rechazado: ${error1.message}`);
                this.testsFailed++;
            }

            // Test 2: Monto negativo debe rechazarse
            const invalidPayload1 = {
                cliente_id: 1,
                pedido_id: 100,
                monto_total: -50.00,
                tipo_pago: 'tarjeta'
            };

            const { error: error2 } = cobroSchema.validate(invalidPayload1);
            if (error2) {
                log.success('Monto negativo correctamente rechazado');
                this.testsPassed++;
            } else {
                log.error('Monto negativo debería ser rechazado');
                this.testsFailed++;
            }

            // Test 3: Monto superior a límite debe rechazarse
            const invalidPayload2 = {
                cliente_id: 1,
                pedido_id: 100,
                monto_total: 100000.00,
                tipo_pago: 'tarjeta'
            };

            const { error: error3 } = cobroSchema.validate(invalidPayload2);
            if (error3) {
                log.success('Monto superior a 99,999.99 correctamente rechazado');
                this.testsPassed++;
            } else {
                log.error('Monto superior a límite debería ser rechazado');
                this.testsFailed++;
            }

            // Test 4: Cupón sin ID debe rechazarse
            const invalidPayload3 = {
                cliente_id: 1,
                pedido_id: 100,
                monto_total: 50.00,
                tipo_pago: 'cupon'
            };

            const { error: error4 } = cobroSchema.validate(invalidPayload3);
            if (error4) {
                log.success('Cupón sin ID correctamente rechazado');
                this.testsPassed++;
            } else {
                log.error('Cupón sin ID debería ser rechazado');
                this.testsFailed++;
            }

            // Test 5: Tipo de pago inválido debe rechazarse
            const invalidPayload4 = {
                cliente_id: 1,
                pedido_id: 100,
                monto_total: 50.00,
                tipo_pago: 'crypto'
            };

            const { error: error5 } = cobroSchema.validate(invalidPayload4);
            if (error5) {
                log.success('Tipo de pago inválido correctamente rechazado');
                this.testsPassed++;
            } else {
                log.error('Tipo de pago inválido debería ser rechazado');
                this.testsFailed++;
            }

        } catch (error) {
            log.error(`Error en tests de validación: ${error.message}`);
            this.testsFailed++;
        }
    }

    printResults() {
        log.result(`\nValidación: ${this.testsPassed}/${this.testsPassed + this.testsFailed} tests pasaron`);
        return this.testsFailed === 0;
    }
}

// ========== MAIN TEST RUNNER ==========

async function runAllTests() {
    log.title('VALIDANDO IMPLEMENTACIÓN - COBROS');
    
    try {
        await sequelize.authenticate();
        log.success('Conexión a BD establecida');
    } catch (error) {
        log.error(`No se pudo conectar a BD: ${error.message}`);
        process.exit(1);
    }

    const results = [];

    // Circuit Breaker Tests
    const cbTester = new CircuitBreakerTester();
    await cbTester.testBasicFunctionality();
    cbTester.printResults();
    results.push({ name: 'Circuit Breaker', passed: cbTester.testsFailed === 0 });

    // State Machine Tests
    const smTester = new StateMachineTester();
    await smTester.testBasicTransitions();
    await smTester.testInvalidTransitions();
    smTester.printResults();
    results.push({ name: 'State Machine', passed: smTester.testsFailed === 0 });

    // Validation Tests
    const valTester = new ValidationTester();
    await valTester.testCobroSchema();
    valTester.printResults();
    results.push({ name: 'Validación', passed: valTester.testsFailed === 0 });

    // Summary
    log.title('RESUMEN FINAL');
    const allPassed = results.every(r => r.passed);
    
    results.forEach(r => {
        const status = r.passed ? colors.green + '✓ PASÓ' : colors.red + '✗ FALLÓ';
        console.log(`${status}${colors.reset} - ${r.name}`);
    });

    if (allPassed) {
        log.success('\n¡VALIDACIÓN EXITOSA - COMPLETA!');
        process.exit(0);
    } else {
        log.error('\nAlgunos tests fallaron. Revisar output arriba.');
        process.exit(1);
    }
}

runAllTests().catch(error => {
    log.error(`Error fatal: ${error.message}`);
    process.exit(1);
});