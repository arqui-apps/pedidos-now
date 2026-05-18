import { httpGet, httpPost } from "./httpHelper.js";
import logger from "../../config/logger.js";

const BASE_URL = process.env.BANCARIO_SERVICE_URL || "https://basilinux.online/api";

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
        status:              "COMPLETADA",
        message:             "Reembolso procesado exitosamente (mock).",
        transaction_id:      `TXN-MOCK-${Date.now()}`,
        amount,
        destination_account: id_usuario,
        timestamp:           new Date().toISOString(),
        is_mock:             true,
    };
}

function mockAccount(id_usuario) {
    return {
        account_number:    id_usuario,
        type:              "monetario",
        available_balance: "0.00",
        reserve_balance:   "0.00",
        status:            "activa",
        associate_id:      id_usuario,
        is_mock:           true,
    };
}

async function getBanks() {
    const { success, data } = await httpGet(`${BASE_URL}/banks`, MOCK_BANKS);
    if (!success) logger.warn("[Bancario] Usando mock para lista de bancos");
    return data;
}

async function getBankById(id_bank) {
    const { success, data } = await httpGet(
        `${BASE_URL}/banks/${id_bank}`,
        MOCK_BANKS.find((b) => b.id === id_bank) || MOCK_BANKS[0]
    );
    if (!success) logger.warn({ id_bank }, "[Bancario] Usando mock para banco");
    return data;
}

async function getAccountByUserId(id_usuario) {
    const { success, data } = await httpGet(
        `${BASE_URL}/accounts/${id_usuario}`,
        mockAccount(id_usuario)
    );
    if (!success) logger.warn({ id_usuario }, "[Bancario] Usando mock para cuenta de usuario");
    return data;
}

async function processRefund(id_usuario, amount, description = "Reembolso Pedidos Now") {
    const { success, data } = await httpPost(
        `${BASE_URL}/transfers`,
        {
            source_account_id:      2,
            destination_account_id: id_usuario,
            amount,
            description,
        },
        null
    );

    if (!success || !data) {
        logger.warn({ id_usuario, amount }, "[Bancario] Servicio no disponible, usando mock para reembolso");
        return mockRefund(id_usuario, amount);
    }

    logger.info({ id_usuario, amount }, "[Bancario] Reembolso procesado exitosamente");
    return {
        status:         data.status || "COMPLETADA",
        message:        data.message || "Reembolso procesado",
        transaction_id: data.data?.transfer_id || null,
        amount,
        timestamp:      new Date().toISOString(),
        is_mock:        false,
    };
}

async function validateUserAccount(id_usuario) {
    const account = await getAccountByUserId(id_usuario);
    return {
        has_account:    !!account,
        account_status: account?.status || "desconocido",
        is_mock:        account?.is_mock || false,
    };
}

export { getBanks, getBankById, getAccountByUserId, processRefund, validateUserAccount };