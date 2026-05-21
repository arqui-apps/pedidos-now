const { CategoriaOrden } = require('../../models');

exports.listarCategorias = async (req, res) => {
    try {
        const { activa } = req.query;
        const where = {};
        if (activa !== undefined) where.activa = activa === 'true';
        const categorias = await CategoriaOrden.findAll({ where, order: [['orden_display', 'ASC']] });
        res.json(categorias);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al listar categorías' });
    }
};

exports.obtenerCategoria = async (req, res) => {
    try {
        const categoria = await CategoriaOrden.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        res.json(categoria);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al obtener categoría' });
    }
};

exports.crearCategoria = async (req, res) => {
    try {
        const { codigo, nombre, descripcion, icono, color_hex, orden_display } = req.body;
        if (!codigo || !nombre) return res.status(400).json({ error: 'Código y nombre requeridos' });
        
        const categoria = await CategoriaOrden.create({ codigo: codigo.toUpperCase(), nombre, descripcion, icono, color_hex, orden_display: orden_display || 0, activa: true });
        res.status(201).json({ message: 'Categoría creada', categoria });
    } catch (error) {
        console.error('Error:', error);
        if (error.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ error: 'Código ya existe' });
        res.status(500).json({ error: 'Error al crear categoría' });
    }
};

exports.actualizarCategoria = async (req, res) => {
    try {
        const { nombre, descripcion, icono, color_hex, orden_display, activa } = req.body;
        const categoria = await CategoriaOrden.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        
        await categoria.update({ nombre: nombre || categoria.nombre, descripcion: descripcion !== undefined ? descripcion : categoria.descripcion, icono: icono || categoria.icono, color_hex: color_hex || categoria.color_hex, orden_display: orden_display !== undefined ? orden_display : categoria.orden_display, activa: activa !== undefined ? activa : categoria.activa });
        res.json({ message: 'Categoría actualizada', categoria });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al actualizar categoría' });
    }
};

exports.toggleCategoria = async (req, res) => {
    try {
        const categoria = await CategoriaOrden.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ error: 'Categoría no encontrada' });
        await categoria.update({ activa: !categoria.activa });
        res.json({ message: `Categoría ${categoria.activa ? 'activada' : 'desactivada'}`, categoria });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al toggle categoría' });
    }
};

module.exports = exports;
