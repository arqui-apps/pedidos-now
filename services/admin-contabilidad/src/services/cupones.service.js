//Admin-conta Jeff. Daniel Ramosd
const Cupon = require('../models/Cupon');

const cancelarCupon = async (id) => {

    const cupon = await Cupon.findByPk(id);

    if (!cupon) {
        const error = new Error('CUPON_NO_ENCONTRADO');
        error.status = 404;
        throw error;
    }

    if (cupon.estado === 'USADO') {
        const error = new Error('CUPON_YA_USADO');
        error.status = 422;
        throw error;
    }

    if (cupon.estado === 'CANCELADO') {
        const error = new Error('CUPON_YA_CANCELADO');
        error.status = 422;
        throw error;
    }

    cupon.estado = 'CANCELADO';

    await cupon.save();

    return cupon;
};

module.exports = {
    // otros métodos...
    cancelarCupon
};