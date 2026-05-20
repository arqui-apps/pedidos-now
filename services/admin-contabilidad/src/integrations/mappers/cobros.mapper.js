const generarPaymentMethod = (tipo_pago) => {
    switch (tipo_pago) {
        case 'tarjeta':
            return 'CARD_CREDIT';

        case 'efectivo':
            return 'CASH';

        case 'cupon':
            return 'COUPON';

        default:
            return 'CASH';
    }
};

const toCobrosAPI = (data) => {

    const timestamp = Date.now();

    return {
        customer_id:
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',

        courier_id:
            'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',

        business_id:
            'cccccccc-cccc-cccc-cccc-cccccccccccc',

        delivery_address_id:
            'dddddddd-dddd-dddd-dddd-dddddddddddd',

        reservation_id:
            `RES-${timestamp}`,

        order_id:
            `ORD-${data.pedido_id}`,

        currency_code: 'GTQ',

        payment_method_code:
            generarPaymentMethod(data.tipo_pago),

        card_type:
            data.tipo_pago === 'tarjeta'
                ? 'CREDIT'
                : null,

        product_discounts: 0,

        coupon_discount: 0,

        service_fee:
            data.tarifa_servicio || 5,

        courier_earned_fee: 15,

        approved_extra_fee: 0,

        tip_amount:
            data.propina || 0,

        weight_lbs: 0,

        insurance_value: 0,

        items: [
            {
                product_id:
                    '11111111-1111-1111-1111-111111111111',

                external_product_id:
                    `PROD-${data.pedido_id}`,

                product_name:
                    `Pedido ${data.pedido_id}`,

                quantity: 1,

                unit_price:
                    data.monto_total,

                item_discount: 0,

                is_combo: false
            }
        ],

        idempotency_key:
            data.idempotency_key
    };
};

module.exports = {
    toCobrosAPI
};