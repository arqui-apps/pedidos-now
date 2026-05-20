require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./src/config/db');

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

class IntegracionBancariaTest {
    constructor() {
        this.testsPassed = 0;
        this.testsFailed = 0;
        this.token = null;
        this.apiUrl = process.env.API_URL || 'http://localhost:3000';
        this.bancoUrl = process.env.SISTEMA_BANCARIO_URL || 'https://basilinux.online';
    }

    async generarToken() {
        try {
            this.token = jwt.sign(
                { id: 1, email: 'test@test.com', rol: 'admin' },
                process.env.JWT_SECRET || 'test-secret',
                { expiresIn: '24h' }
            );
            log.success('Token JWT generado');
            return this.token;
        } catch (error) {
            log.error(`Error generando token: ${error.message}`);
            throw error;
        }
    }

    async verificarDisponibilidadBanco() {
        log.title('Verificar Disponibilidad del Sistema Bancario');
        console.log("URL BANCO:", this.bancoUrl);
        try {
            const response = await axios.post(`${this.bancoUrl}/api/associates/login`, {
                user: process.env.BANK_USER,
                password: process.env.BANK_PASSWORD
            }, {
                timeout: 3000
            });

            if (response.data?.token?.token) {
                log.success('Sistema bancario disponible');
                this.testsPassed++;
                return true;
            } else {
                log.error('Sistema bancario respondió pero con estado inesperado');
                this.testsFailed++;
                return false;
            }
        } catch (error) {
            log.error(`Sistema bancario NO disponible: ${error.message}`);
            log.warn('Nota: Los tests continuarán pero las transferencias fallarán');
            this.testsFailed++;
            return false;
        }
    }

    async testConsultarSaldo() {
        const bancoClient = require('./src/integrations/banco-client');

        await bancoClient.loginBanco();

        const saldo = await bancoClient.consultarSaldo(1);

        if (saldo && saldo.account_number && saldo.saldo_total !== undefined) {
            log.success(`Saldo consultado: Cuenta ${saldo.account_number}, Disponible: ${saldo.available_balance}`);
            this.testsPassed++;
            return saldo;
        } else {
            log.error('Respuesta de saldo no contiene estructura esperada');
            this.testsFailed++;
            return null;
        }
    }

    async testObtenerCuentas() {
        log.title('Test: Obtener Cuentas del Cliente');

        try {
            const bancoClient = require('./src/integrations/banco-client');

            await bancoClient.loginBanco();

            const cuentas = await bancoClient.obtenerCuentasPorAsociado(1);

            if (Array.isArray(cuentas) && cuentas.length > 0) {
                log.success(`Cuentas obtenidas: ${cuentas.length} cuenta(s)`);
                log.info(`Primera cuenta: Account Number ${cuentas[0].account_number}`);
                this.testsPassed++;
                return cuentas;
            } else {
                log.warn('No hay cuentas registradas');
                this.testsPassed++;
                return [];
            }

        } catch (error) {
            log.error(`Error obteniendo cuentas: ${error.message}`);
            this.testsFailed++;
            return null;
        }
    }

    async testRealizarTransferencia() {
        log.title('Test: Realizar Transferencia Bancaria');

        try {
            const bancoClient = require('./src/integrations/banco-client');

            await bancoClient.loginBanco();

            const cuentas = await bancoClient.obtenerCuentasPorAsociado(1);

            if (!cuentas || cuentas.length === 0) {
                log.warn('No hay cuentas disponibles');
                return null;
            }

            const cuentaOrigen = cuentas[0];

            const transferencia = await bancoClient.realizarTransferencia({
                source_account_id: cuentaOrigen.account_number,
                destination_account_id: 1,
                amount: 50
            });

            if (transferencia && transferencia.id) {
                log.success(`Transferencia iniciada: ${transferencia.id}`);
                this.testsPassed++;
                return transferencia;
            } else {
                log.error('Transferencia inválida');
                this.testsFailed++;
                return null;
            }

        } catch (error) {
            log.error(`Error en transferencia: ${error.message}`);
            this.testsFailed++;
            return null;
        }
    }

    async testCobroReal() {
        log.title('Test: Cobro REAL con tarjeta');

        try {
            const bancoClient = require('./src/integrations/banco-client');

            await bancoClient.loginBanco();

            // Validar tarjeta
            await bancoClient.validarTarjeta({
                card_number: "4000020000000034",
                cvv: 992
            });

            // Tokenizar
            const tokenData = await bancoClient.tokenizarTarjeta({
                card_number: "4000020000000034",
                cvv: 992
            });

            // Cobrar
            const resultado = await bancoClient.realizarCobro({
                token: tokenData.token,
                destination_account_id: 2,
                amount: 50
            });

            log.success(`Cobro exitoso: ${resultado.id}`);
            this.testsPassed++;
            return resultado;

        } catch (error) {
            log.error(`Error en cobro: ${error.message}`);
            this.testsFailed++;
            return null;
        }
    }

    async testProcessarCobroPorAPI() {
        log.title('Test: Procesar Cobro por API (POST /api/payments)');

        try {
            const payload = {
                cliente_id: 1,
                pedido_id: 999,
                monto_total: 25.50,
                tarifa_servicio: 2.04,
                propina: 5.00,
                tipo_pago: 'tarjeta',
                repartidor_id: 10
            };

            const response = await axios.post(
                `${this.apiUrl}/api/payments`,
                payload,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                }
            );

            if (response.status === 201 && response.data.ok && response.data.cobro_id) {
                log.success(`Cobro procesado: ID ${response.data.cobro_id}`);
                log.info(`Estado: ${response.data.estado}`);
                log.info(`Número de transacción: ${response.data.numero_transaccion || 'N/A'}`);
                this.testsPassed++;
                return response.data;
            } else {
                log.error('Respuesta no contiene estructura esperada');
                this.testsFailed++;
                return null;
            }
        } catch (error) {
            if (error.response?.status === 400) {
                log.error(`Error en solicitud: ${error.response.data?.error || 'error desconocido'}`);
            } else {
                log.error(`Error procesando cobro: ${error.message}`);
            }
            this.testsFailed++;
            return null;
        }
    }

    async testObtenerCobroPorId() {
        log.title('Test: Obtener Cobro por ID (GET /api/payments/:id)');

        try {
            // Primero crear un cobro
            const cobroCreado = await this.testProcessarCobroPorAPI();
            
            if (!cobroCreado || !cobroCreado.cobro_id) {
                log.warn('No se pudo crear cobro para testear obtención');
                return null;
            }

            const cobroId = cobroCreado.cobro_id;

            const response = await axios.get(
                `${this.apiUrl}/api/payments/${cobroId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    timeout: 5000
                }
            );

            if (response.status === 200 && response.data.ok && response.data.cobro) {
                log.success(`Cobro obtenido: ID ${response.data.cobro.id}`);
                log.info(`Estado: ${response.data.cobro.estado}`);
                this.testsPassed++;
                return response.data.cobro;
            } else {
                log.error('Respuesta no contiene estructura esperada');
                this.testsFailed++;
                return null;
            }
        } catch (error) {
            log.error(`Error obteniendo cobro: ${error.message}`);
            this.testsFailed++;
            return null;
        }
    }

    async testEstadoBancario() {
        log.title('Test: Obtener Estado del Sistema Bancario (GET /api/payments/estado/banco)');

        try {
            const response = await axios.get(
                `${this.apiUrl}/api/payments/estado/banco`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`
                    },
                    timeout: 5000
                }
            );

            if (response.status === 200 && response.data.ok && response.data.estado) {
                const estado = response.data.estado;
                log.success('Estado del sistema bancario obtenido');
                log.info(`Banco disponible: ${estado.banco_disponible}`);
                log.info(`Circuit breaker: ${estado.circuit_breaker_estado}`);
                log.info(`Fallos registrados: ${estado.circuit_breaker_fallos}`);
                this.testsPassed++;
                return estado;
            } else {
                log.error('Respuesta no contiene estructura esperada');
                this.testsFailed++;
                return null;
            }
        } catch (error) {
            log.error(`Error obteniendo estado: ${error.message}`);
            this.testsFailed++;
            return null;
        }
    }

    async testValidacionSchema() {
        log.title('Test: Validación de Schema de Cobro');

        try {
            // Intentar procesar cobro con datos inválidos
            const payloadInvalido = {
                cliente_id: -1,  // Negativo
                pedido_id: 1,
                monto_total: 25.50,
                tipo_pago: 'invalid_type'  // Tipo inválido
            };

            const response = await axios.post(
                `${this.apiUrl}/api/payments`,
                payloadInvalido,
                {
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000
                }
            );

            log.error('Debería haber rechazado payload inválido');
            this.testsFailed++;

        } catch (error) {
            if (error.response?.status === 400) {
                log.success('Payload inválido correctamente rechazado');
                log.info(`Razón: ${error.response.data?.error || 'error desconocido'}`);
                this.testsPassed++;
            } else {
                log.error(`Error inesperado: ${error.message}`);
                this.testsFailed++;
            }
        }
    }

    printResults() {
        log.title('RESUMEN DE TESTS');
        const total = this.testsPassed + this.testsFailed;
        const porcentaje = total > 0 ? Math.round((this.testsPassed / total) * 100) : 0;

        console.log(`\n${colors.bright}Tests Pasados: ${colors.green}${this.testsPassed}${colors.reset}`);
        console.log(`${colors.bright}Tests Fallidos: ${colors.red}${this.testsFailed}${colors.reset}`);
        console.log(`${colors.bright}Total: ${total}${colors.reset}`);
        console.log(`${colors.bright}Porcentaje: ${porcentaje}%${colors.reset}\n`);

        if (this.testsFailed === 0) {
            log.success('¡TODOS LOS TESTS PASARON!');
            return 0;
        } else {
            log.error(`${this.testsFailed} test(s) fallaron. Revisar output arriba.`);
            return 1;
        }
    }
}

async function runAllTests() {
    log.title('INICIANDO TESTS DE INTEGRACIÓN BANCARIA');

    try {
        await sequelize.authenticate();
        log.success('Conexión a BD establecida');
    } catch (error) {
        log.error(`No se pudo conectar a BD: ${error.message}`);
        process.exit(1);
    }

    const tester = new IntegracionBancariaTest();

    try {
        await tester.generarToken();
        await tester.verificarDisponibilidadBanco();
        await tester.testConsultarSaldo();
        await tester.testObtenerCuentas();
        await tester.testRealizarTransferencia();
        await tester.testProcessarCobroPorAPI();
        await tester.testObtenerCobroPorId();
        await tester.testEstadoBancario();
        await tester.testValidacionSchema();
        await tester.testCobroReal();

        const exitCode = tester.printResults();
        process.exit(exitCode);

    } catch (error) {
        log.error(`Error fatal: ${error.message}`);
        process.exit(1);
    }
}

runAllTests().catch(error => {
    log.error(`Error no capturado: ${error.message}`);
    process.exit(1);
});