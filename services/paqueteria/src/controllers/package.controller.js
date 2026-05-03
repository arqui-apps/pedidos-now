const { Package, Shipment, ShipmentTracking, User, Price } = require('../models');

const packageController = {
  /**
   * Controlador de paquetes para la paquetería instantánea.
   * Gestiona cotizaciones, confirmaciones, historial y acciones de cliente.
   */
  
  /**
   * Listar todos los paquetes activos con su envío asociado.
   */
  async getAll(req, res) {
    try {
      const packages = await Package.findAll({
        where: { status: true },
        include: [
          {
            model: Shipment,
            as: 'idShipmentShipment'
          }
        ],
        order: [['idPackage', 'DESC']]
      });

      res.json(packages);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener paquetes',
        error: error.message
      });
    }
  },

  /**
   * Generar una cotización de envío basada en los datos del paquete y direcciones.
   * No crea registros de envío ni paquete; devuelve únicamente un cálculo estimado.
   */
  async quote(req, res) {
    try {
      const {
        senderId,
        receiverId,
        packageDetails,
        originAddress,
        destinationAddress
      } = req.body;

      // Validar datos requeridos
      if (!senderId || !receiverId || !packageDetails || !originAddress || !destinationAddress) {
        return res.status(400).json({
          message: 'Faltan datos requeridos: senderId, receiverId, packageDetails, originAddress, destinationAddress'
        });
      }

      // Calcular precio base (lógica simplificada)
      const basePrice = 50; // Precio base
      const weightMultiplier = packageDetails.weight ? packageDetails.weight * 2 : 1;
      const distanceMultiplier = 1.5; // Simular cálculo de distancia

      const total = basePrice * weightMultiplier * distanceMultiplier;

      // Estimar tiempo de entrega (2-4 horas)
      const estimatedDeliveryTime = new Date();
      estimatedDeliveryTime.setHours(estimatedDeliveryTime.getHours() + 3);

      const quote = {
        total: total.toFixed(2),
        currency: 'GTQ',
        estimatedDeliveryTime,
        breakdown: {
          basePrice,
          weightSurcharge: (weightMultiplier - 1) * basePrice,
          distanceSurcharge: (distanceMultiplier - 1) * basePrice
        },
        packageDetails,
        originAddress,
        destinationAddress
      };

      res.json({
        message: 'Cotización generada exitosamente',
        data: quote
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al generar cotización',
        error: error.message
      });
    }
  },

  /**
   * Obtener los detalles de un paquete por su ID, incluyendo el envío asociado.
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const packageRecord = await Package.findByPk(id, {
        include: [
          {
            model: Shipment,
            as: 'idShipmentShipment'
          }
        ]
      });

      if (!packageRecord || packageRecord.status === false) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      res.json(packageRecord);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener paquete',
        error: error.message
      });
    }
  },

  /**
   * Crea un registro de paquete asociado a un envío existente.
   * Requiere el identificador del envío y guarda los datos de descripción y peso.
   */
  async create(req, res) {
    try {
      const idShipment = req.body.idShipment ?? req.body.id_shipment;
      const { description, size, weight, subtotal, status = true } = req.body;

      if (!idShipment) {
        return res.status(400).json({ message: 'idShipment es obligatorio' });
      }

      const newPackage = await Package.create({
        idShipment,
        description,
        size,
        weight,
        subtotal,
        status
      });

      res.status(201).json({
        message: 'Paquete creado correctamente',
        data: newPackage
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al crear paquete',
        error: error.message
      });
    }
  },

  /**
   * Actualiza los campos del paquete identificados por su ID.
   * Solo modifica los campos que se proporcionan en la solicitud.
   */
  async update(req, res) {
    try {
      const { id } = req.params;

      const packageRecord = await Package.findByPk(id);

      if (!packageRecord) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      const idShipment = req.body.idShipment ?? req.body.id_shipment ?? packageRecord.idShipment;

      await packageRecord.update({
        idShipment,
        description: req.body.description ?? packageRecord.description,
        size: req.body.size ?? packageRecord.size,
        weight: req.body.weight ?? packageRecord.weight,
        subtotal: req.body.subtotal ?? packageRecord.subtotal,
        status: req.body.status ?? packageRecord.status
      });

      res.json({
        message: 'Paquete actualizado correctamente',
        data: packageRecord
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al actualizar paquete',
        error: error.message
      });
    }
  },

  /**
   * Elimina lógicamente un paquete marcando su estado como inactivo.
   * Esto preserva el historial sin borrar la fila de la base de datos.
   */
  async remove(req, res) {
    try {
      const { id } = req.params;

      const packageRecord = await Package.findByPk(id);

      if (!packageRecord) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      await packageRecord.update({ status: false });

      res.json({ message: 'Paquete eliminado lógicamente' });
    } catch (error) {
      res.status(500).json({
        message: 'Error al eliminar paquete',
        error: error.message
      });
    }
  },

  /**
   * Obtener paquetes del cliente usando el token recibido desde el broker.
   * Filtra envíos por remitente o receptor asociado.
   */
  async getCustomerPackages(req, res) {
    try {
      // En producción, el token del cliente vendría del broker
      // Por ahora asumimos que viene en el header o parámetro
      const customerToken = req.headers['x-customer-token'] || req.query.customerToken;

      if (!customerToken) {
        return res.status(400).json({
          message: 'Token de cliente requerido'
        });
      }

      // Buscar envíos donde el cliente es sender o receiver
      const shipments = await Shipment.findAll({
        where: { status: true },
        include: [
          {
            model: Package,
            as: 'packages',
            where: { status: true },
            required: true
          },
          {
            model: User,
            as: 'sender',
            attributes: ['idUser', 'name']
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['idUser', 'name']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Filtrar por token del cliente (lógica simplificada)
      const customerPackages = shipments
        .filter(shipment =>
          shipment.senderId === parseInt(customerToken) ||
          shipment.receiverId === parseInt(customerToken)
        )
        .map(shipment => ({
          idPackage: shipment.packages[0]?.idPackage,
          shipmentId: shipment.idShipment,
          description: shipment.packages[0]?.description,
          status: shipment.shipmentStatus,
          total: shipment.total,
          createdAt: shipment.createdAt,
          sender: shipment.sender,
          receiver: shipment.receiver
        }));

      res.json(customerPackages);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener paquetes del cliente',
        error: error.message
      });
    }
  },

  /**
   * Cancelar un paquete por parte del cliente cuando aún no se ha asignado el repartidor.
   * Verifica permisos con el token del cliente y crea evento de tracking de cancelación.
   */
  async cancel(req, res) {
    try {
      const { id } = req.params;
      const customerToken = req.headers['x-customer-token'];

      if (!customerToken) {
        return res.status(400).json({
          message: 'Token de cliente requerido'
        });
      }

      const packageRecord = await Package.findByPk(id, {
        include: [
          {
            model: Shipment,
            as: 'idShipmentShipment'
          }
        ]
      });

      if (!packageRecord) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      const shipment = packageRecord.idShipmentShipment;

      // Verificar que el cliente sea el sender
      if (shipment.senderId !== parseInt(customerToken)) {
        return res.status(403).json({
          message: 'No tienes permisos para cancelar este paquete'
        });
      }

      // Solo permitir cancelación si está en estado pending
      if (shipment.shipmentStatus !== 'pending') {
        return res.status(400).json({
          message: 'El paquete no puede ser cancelado en este estado'
        });
      }

      await shipment.update({ shipmentStatus: 'cancelled' });

      // Crear evento de tracking
      await ShipmentTracking.create({
        idShipment: shipment.idShipment,
        status: 'cancelled',
        description: 'Paquete cancelado por el cliente'
      });

      res.json({
        message: 'Paquete cancelado exitosamente'
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al cancelar paquete',
        error: error.message
      });
    }
  },

  /**
   * Obtener el historial de seguimiento del paquete, con eventos y ubicación opcional.
   */
  async getTracking(req, res) {
    try {
      const { id } = req.params;

      const packageRecord = await Package.findByPk(id, {
        include: [
          {
            model: Shipment,
            as: 'idShipmentShipment',
            include: [
              {
                model: ShipmentTracking,
                as: 'trackingEvents',
                order: [['createdAt', 'DESC']]
              }
            ]
          }
        ]
      });

      if (!packageRecord) {
        return res.status(404).json({ message: 'Paquete no encontrado' });
      }

      const shipment = packageRecord.idShipmentShipment;

      const tracking = {
        packageId: packageRecord.idPackage,
        shipmentId: shipment.idShipment,
        currentStatus: shipment.shipmentStatus,
        events: shipment.trackingEvents.map(event => ({
          status: event.status,
          description: event.description,
          timestamp: event.createdAt,
          location: event.locationLat && event.locationLng ? {
            lat: event.locationLat,
            lng: event.locationLng
          } : null
        }))
      };

      res.json(tracking);
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener seguimiento del paquete',
        error: error.message
      });
    }
  }
};

module.exports = packageController;