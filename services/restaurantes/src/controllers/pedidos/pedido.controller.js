//analisis
const { Pedido } = require('../models/pedido.model');

//crear pedido
exports.createPedido = async (req, res) => {
    try {
        const { clienteId, restauranteId, items } = req.body;
        const nuevoPedido = await Pedido.create({ clienteId, restauranteId, items });
        res.status(201).json(nuevoPedido);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el pedido' });
    }      
};

//obtener pedidos por cliente
exports.getPedidosByCliente = async (req, res) => {
    try {
        const { clienteId } = req.params;
        const pedidos = await Pedido.findAll({ where: { clienteId } });
        res.status(200).json(pedidos);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los pedidos' });
    }
};