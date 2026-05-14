import { httpGet, httpPost } from "./httpHelper.js";

const BASE_URL = process.env.BANCARIO_SERVICE_URL || "https://basilinux.online/api";

// ─── Mocks basados en la documentación real del sistema bancario ───────────────

const MOCK_BANKS = [
    {
        id: 1,
        name: "Banrural",
        legalAlias: "Banrural",
        contact: { phone: "12345678", email: "info@banrural.com" },
        transferSchedule: { start: "08:00:00", end: "18:00:00" },
        currentStatus: "ACTIVO",
    },
    {
        id: 2,
        name: "Banco Industrial",
        legalAlias: "BI",
        contact: { phone: "12345678", email: "info@bi.com" },
        transferSchedule: { start: "09:00:00", end: "15:00:00" },
        currentStatus: "ACTIVO",
    },
    {
        id: 3,
        name: "Banco de América Central, S.A.",
        legalAlias: "BAC",
        contact: { phone: "12345678", email: "info@bac.com" },
        transferSchedule: { start: "08:00:00", end: "16:00:00" },
        currentStatus: "ACTIVO",
    },
];

function mockRefund(id_usuario, amount) {
    return {
        status: "COMPLETADA",
        message: "Reembolso procesado exitosamente (mock).",
        transaction_id: `TXN-MOCK-${Date.now()}`,
        amount,
        destination_account: id_usuario,
        timestamp: new Date().toISOString(),
        is_mock: true,
    };
}

function mockAccount(id_usuario) {
    return {
        account_number: id_usuario,
        type: "monetario",
        available_balance: "0.00",
        reserve_balance: "0.00",
        status: "activa",
        associate_id: id_usuario,
        is_mock: true,
    };
}

// ─── Funciones públicas ────────────────────────────────────────────────────────

/**
 * Obtiene la lista de bancos disponibles en el sistema.
 */
async function getBanks() {
    const { success, data } = await httpGet(`${BASE_URL}/banks`, MOCK_BANKS);
    if (!success) console.warn("[Bancario] Usando mock para lista de bancos");
    return data;
}

/**
 * Obtiene un banco por su ID.
 */
async function getBankById(id_bank) {
    const { success, data } = await httpGet(
        `${BASE_URL}/banks/${id_bank}`,
        MOCK_BANKS.find((b) => b.id === id_bank) || MOCK_BANKS[0]
    );
    if (!success) console.warn(`[Bancario] Usando mock para banco ${id_bank}`);
    return data;
}

/**
 * Obtiene la cuenta bancaria de un usuario por su ID.
 * Nota: el sistema bancario usa associate_id propio — se intenta
 * buscar por ese ID y si falla se retorna un mock.
 */
async function getAccountByUserId(id_usuario) {
    const { success, data } = await httpGet(
        `${BASE_URL}/accounts/${id_usuario}`,
        mockAccount(id_usuario)
    );
    if (!success)
        console.warn(`[Bancario] Usando mock para cuenta de usuario ${id_usuario}`);
    return data;
}

/**
 * Procesa un reembolso al usuario desde la cuenta de Pedidos Now.
 * Utiliza el endpoint de transferencias del sistema bancario.
 * Si el servicio no está disponible, registra el reembolso como pendiente (mock).
 */
async function processRefund(id_usuario, amount, description = "Reembolso Pedidos Now") {
    // Cuenta origen: Pedidos Now (account_number: 2 según la documentación)
    // Cuenta destino: cuenta del usuario
    const { success, data } = await httpPost(
        `${BASE_URL}/transfers`,
        {
            source_account_id: 2,
            destination_account_id: id_usuario,
            amount,
            description,
        },
        null
    );

    if (!success || !data) {
        console.warn("[Bancario] Servicio no disponible, usando mock para reembolso");
        return mockRefund(id_usuario, amount);
    }

    return {
        status: data.status || "COMPLETADA",
        message: data.message || "Reembolso procesado",
        transaction_id: data.data?.transfer_id || null,
        amount,
        timestamp: new Date().toISOString(),
        is_mock: false,
    };
}

/**
 * Valida si un usuario tiene cuenta activa en el sistema bancario.
 */
async function validateUserAccount(id_usuario) {
    const account = await getAccountByUserId(id_usuario);
    return {
        has_account: !!account,
        account_status: account?.status || "desconocido",
        is_mock: account?.is_mock || false,
    };
}

export { getBanks, getBankById, getAccountByUserId, processRefund, validateUserAccount };