const { User } = require('../models');

const userController = {
  async getAll(req, res) {
    try {
      const users = await User.findAll({
        where: { status: true },
        order: [['idUser', 'DESC']]
      });

      res.json(users);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener usuarios',
        error: error.message
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user || user.status === false) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener usuario',
        error: error.message
      });
    }
  },

  async create(req, res) {
    try {
      const { name, status = true } = req.body;

      if (!name) {
        return res.status(400).json({ message: 'El nombre es obligatorio' });
      }

      const newUser = await User.create({
        name,
        status
      });

      res.status(201).json({
        message: 'Usuario creado correctamente',
        data: newUser
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear usuario',
        error: error.message
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { name, status } = req.body;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await user.update({
        name: name ?? user.name,
        status: status ?? user.status
      });

      res.json({
        message: 'Usuario actualizado correctamente',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar usuario',
        error: error.message
      });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      await user.update({ status: false });

      res.json({ message: 'Usuario eliminado lógicamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar usuario',
        error: error.message
      });
    }
  }
};

module.exports = userController;