const axios = require('axios');

const CHATS_PREFIX = process.env.CHATS_PREFIX !== undefined ? process.env.CHATS_PREFIX : '/chats';

const BASE_URL = () =>
    `${process.env.BROKER_URL || 'http://localhost:5000'}${CHATS_PREFIX}`;

function buildClient(token) {
    return axios.create({
        baseURL: BASE_URL(),
        timeout: 8000,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });
}

async function get(endpoint, params, token) {
    const res = await buildClient(token).get(endpoint, { params });
    return res.data;
}

async function patch(endpoint, body, token) {
    const res = await buildClient(token).patch(endpoint, body);
    return res.data;
}

module.exports = { get, patch };
