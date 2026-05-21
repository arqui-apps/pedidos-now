const { EstadoPedido, Pedido } = require('../../models');

exports.getAll = async (req, res, next) => {
  try {
    const estados = await EstadoPedido.findAll({ order: [['id', 'ASC']] });
    res.json({ success: true, data: estados, count: estados.length });
  } catch (error) {
    next(error);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const estado = await EstadoPedido.findByPk(req.params.id);
    if (!estado)
      return res.status(404).json({ success: false, message: 'Estado no encontrado' });
    res.json({ success: true, data: estado });
  } catch (error) {
    next(error);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    if (!nombre)
      return res.status(400).json({ success: false, message: 'El nombre es requerido ' });

    const estado = await EstadoPedido.create({ nombre, descripcion: descripcion || null });
    res.status(201).json({ success: true, message: 'Estado creado exitosamente', data: estado });
  } catch (error) {
    next(error);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { nombre, descripcion } = req.body;
    const estado = await EstadoPedido.findByPk(req.params.id);
    if (!estado)
      return res.status(404).json({ success: false, message: 'Estado no encontrado ' });

    await estado.update({
      nombre:      nombre      || estado.nombre,
      descripcion: descripcion !== undefined ? descripcion : estado.descripcion
    });
    res.json({ success: true, message: 'Estado actualizado exitosamente ', data: estado });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const estado = await EstadoPedido.findByPk(req.params.id);
    if (!estado)
      return res.status(404).json({ success: false, message: 'Estado no encontrado' });

    const enUso = await Pedido.findOne({ where: { estado_id: req.params.id } });
    if (enUso)
      return res.status(400).json({ success: false, message: 'No se puede eliminar: estado en uso por pedidos ' });

    await estado.destroy();
    res.json({ success: true, message: 'Estado eliminado exitosamente ' });
  } catch (error) {
    next(error);
  }
};
