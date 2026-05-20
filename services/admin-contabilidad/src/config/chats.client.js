const axios = require('axios');

const BASE_URL = () =>
    `${process.env.BROKER_URL || 'http://localhost:5000'}${process.env.CHATS_PREFIX || '/chats'}`;

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
