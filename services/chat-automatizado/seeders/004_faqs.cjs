'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('faq_design', [

      // ─── CLIENTE ────────────────────────────────────────────────────────────
      {
        category_type: 'cliente',
        question: '¿Cómo rastreo mi pedido?',
        answer: 'Puedes rastrear tu pedido seleccionando la opción "Consultar pedido" en el menú principal e ingresando tu código de pedido (ej: PED-7).',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Cómo cancelo mi pedido?',
        answer: 'Puedes cancelar tu pedido en los primeros minutos desde el chat seleccionando "Consultar pedido", luego "Reportar problema" y siguiendo las instrucciones. Si el pedido ya está en camino no es posible cancelarlo.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Qué hago si mi pedido no llegó?',
        answer: 'Selecciona "Problema con pedido" en el menú principal y luego "Pedido no llegó o llegó incompleto". El sistema generará automáticamente un cupón de compensación para tu próximo pedido.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Cómo obtengo un reembolso?',
        answer: 'Si tu pedido llegó en mal estado, selecciona "Problema con pedido" y luego "Llegó en mal estado". Se procesará un reembolso automáticamente a tu método de pago.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Qué hago si me cobraron dos veces?',
        answer: 'Selecciona "Problema de cobro" en el menú principal y luego "Cobro duplicado". El sistema iniciará el proceso de reembolso del cargo extra.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Cuánto tiempo tarda mi pedido?',
        answer: 'El tiempo estimado de entrega depende del restaurante y tu ubicación. Normalmente oscila entre 20 y 45 minutos. Puedes consultar el estado en tiempo real ingresando tu código de pedido.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Cómo uso un cupón de descuento?',
        answer: 'Los cupones de compensación se aplican automáticamente en tu próximo pedido. Si tienes un código de cupón, ingrésalo al momento de realizar tu pedido en la sección de descuentos.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Qué hago si el pedido llegó incompleto?',
        answer: 'Selecciona "Problema con pedido" y luego "Pedido no llegó o llegó incompleto". Recibirás un cupón de compensación automáticamente por los productos faltantes.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Cómo contacto a un agente humano?',
        answer: 'Si el chatbot no puede resolver tu problema, selecciona "Otro problema" en cualquier menú y tu caso será escalado automáticamente a un agente de servicio al cliente.',
        faq_status: 'active'
      },
      {
        category_type: 'cliente',
        question: '¿Cuáles son los métodos de pago disponibles?',
        answer: 'Pedidos Now acepta pagos en efectivo, tarjeta de crédito y débito. El método de pago se selecciona al momento de realizar el pedido.',
        faq_status: 'active'
      },

      // ─── REPARTIDOR ─────────────────────────────────────────────────────────
      {
        category_type: 'repartidor',
        question: '¿Qué hago si el cliente no responde?',
        answer: 'Espera al menos 5 minutos en la dirección de entrega. Si el cliente no responde, selecciona "Problema con entrega" y luego "Cliente no responde" para escalar el caso a un agente.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué hago si la dirección es incorrecta?',
        answer: 'Selecciona "Problema con entrega" y luego "Dirección incorrecta". Un agente se comunicará contigo y con el cliente para resolver la situación.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cómo solicito apoyo en carretera?',
        answer: 'Selecciona "Problema con entrega" y luego "Necesito apoyo en carretera". Se generará una solicitud de soporte y un agente te contactará a la brevedad.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cómo veo mis pedidos pendientes?',
        answer: 'Desde el menú principal puedes consultar tus entregas activas asignadas. El sistema muestra los pedidos que tienes en curso en tiempo real.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué hago si tuve un accidente?',
        answer: 'Tu seguridad es lo primero. Llama al número de emergencias si es necesario. Luego selecciona "Necesito apoyo en carretera" para notificar a la plataforma y recibir asistencia.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cómo reporto un problema con mi pago?',
        answer: 'Selecciona "Problema con mi pago" en el menú principal. Puedes reportar pagos no recibidos o montos incorrectos y un agente revisará tu caso.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cómo cancelo una entrega asignada?',
        answer: 'No puedes cancelar una entrega directamente desde el chat. Si tienes una emergencia, selecciona "Necesito apoyo en carretera" y explica la situación a un agente.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué hago si el restaurante no tiene el pedido listo?',
        answer: 'Espera el tiempo indicado. Si el restaurante tiene un retraso significativo, puedes notificarlo seleccionando "Necesito apoyo en carretera" para que un agente coordine con el establecimiento.',
        faq_status: 'active'
      },

      // ─── NEGOCIO ────────────────────────────────────────────────────────────
      {
        category_type: 'restaurante',
        question: '¿Cómo cancelo un pedido de un cliente?',
        answer: 'Selecciona "Cancelar pedido" en el menú principal e ingresa el código del pedido. El sistema procesará la cancelación y notificará al cliente automáticamente.',
        faq_status: 'active'
      },
      {
        category_type: 'restaurante',
        question: '¿Qué hago si un cliente no recogió su pedido?',
        answer: 'Selecciona "Problema con pedido" y luego "Cliente no recogió / canceló tarde". Un agente revisará el caso y coordinará la solución.',
        faq_status: 'active'
      },
      {
        category_type: 'restaurante',
        question: '¿Cómo reporto un problema con mis cobros?',
        answer: 'Selecciona "Problema de cobro" en el menú principal. Un agente especializado revisará tu situación y te contactará para resolver el problema.',
        faq_status: 'active'
      },
      {
        category_type: 'restaurante',
        question: '¿Qué hago si los datos de un pedido son incorrectos?',
        answer: 'Selecciona "Problema con pedido" y luego "Pedido con datos incorrectos". Un agente coordinará la corrección con el cliente y el sistema.',
        faq_status: 'active'
      },
      {
        category_type: 'restaurante',
        question: '¿Cómo actualizo mi menú de productos?',
        answer: 'Los cambios en tu menú se realizan desde el panel de administración de tu negocio. Si tienes problemas para actualizar, contacta al soporte técnico a través de esta plataforma.',
        faq_status: 'active'
      },
      {
        category_type: 'restaurante',
        question: '¿Cuándo recibo mis pagos?',
        answer: 'Los pagos se procesan según el ciclo de liquidación acordado con Pedidos Now. Si tienes dudas sobre tu próximo pago, selecciona "Problema de cobro" para que un agente te informe.',
        faq_status: 'active'
      },
      {
        category_type: 'restaurante',
        question: '¿Cómo manejo las horas de atención?',
        answer: 'Tus horarios de atención se configuran desde el panel de administración de tu negocio. Puedes activar o desactivar tu disponibilidad en tiempo real.',
        faq_status: 'active'
      },

      // ─── REPARTIDOR (del Excel) ──────────────────────────────────────────────
      {
        category_type: 'repartidor',
        question: '¿Qué pasa si no pago mi deuda en efectivo a tiempo?',
        answer: 'Tienes un periodo de gracia de 24 horas. Si excedes este límite, tu cuenta pasará a estado Inactivo. Al superar los 30 días, será bloqueada permanentemente.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cómo transfiero mi saldo a favor?',
        answer: 'Ve a tu Billetera Virtual y presiona "Transferir saldo a cuenta bancaria". El dinero se enviará a la cuenta vinculada en tu Perfil.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Puedo cancelar un pedido en curso?',
        answer: 'No puedes cancelarlo unilateralmente. Debes usar la opción "Solicitar cancelación" y un agente evaluará tu caso para determinar si aplica una sanción.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué pasa si no acepto un pedido de paquetería a tiempo?',
        answer: 'Si un paquete no es aceptado, se cancelará automáticamente a los 5 minutos de inactividad.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cómo funciona mi ganancia y la tarifa de delivery?',
        answer: 'La aplicación cobra una tarifa de delivery estandarizada. Tienes la opción de recibir propina del cliente.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué puedo hacer si las condiciones del clima son adversas o hay tráfico?',
        answer: 'Puedes utilizar la opción de postular un aumento de tarifa proponiendo una cifra extra. Esta solicitud será evaluada por un agente de servicio al cliente.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Puedo seguir interactuando con pedidos si mi estado es Inactivo?',
        answer: 'No, en estado inactivo no podrás interactuar con pedidos ni visualizarlos. Solo podrás navegar en tu perfil, la billetera y el sistema de soporte.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué significa cuando un pedido está "En espera de aprobación"?',
        answer: 'Significa que has propuesto un aumento de tarifa y estás a la espera de que el equipo de soporte autorice o deniegue el incremento.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cómo puedo solicitar el desbloqueo de mi cuenta por morosidad?',
        answer: 'Si tu cuenta fue bloqueada por exceder los 30 días de morosidad, debes comunicarte con un agente. También puedes enviar una solicitud formal con una justificación para solicitar el desbloqueo al administrador.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿De qué manera recibo el pago de los pedidos cobrados con tarjeta?',
        answer: 'Para los pedidos cobrados con tarjeta, la tarifa devengada se acredita de forma automática al saldo positivo del repartidor.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿En qué momento puedo marcar una orden como recogida en el restaurante?',
        answer: 'El botón "Orden recogida" estará bloqueado. Solo estará disponible cuando el negocio marque en su sistema que la orden ha sido preparada.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Cuál es el proceso para apelar una multa o sanción en mi cuenta?',
        answer: 'Debes ingresar a Soporte Técnico y seleccionar "Disputar sanciones". Debes detallar el caso y adjuntar evidencia fotográfica.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué alternativas tengo si ocurre un problema durante la entrega?',
        answer: 'Puedes seleccionar "Reportar un problema" desde el chat. Esto te permitirá interactuar con el chatbot o hablar con un representante.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué información de mi cuenta puedo actualizar desde la aplicación?',
        answer: 'Desde el módulo de Perfil puedes actualizar tus datos personales y vehículos. Datos como el CUI, NIT y correo electrónico son inmutables.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Es posible modificar la cuenta bancaria donde recibo mis pagos?',
        answer: 'Sí, puedes gestionar tus métodos de pago y datos bancarios desde el módulo de Perfil.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué ocurre exactamente al finalizar y entregar un pedido al cliente?',
        answer: 'El estado del pedido cambia a "Finalizado". Se acredita tu tarifa de envío y esto desencadena un evento para calificar al repartidor.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Puedo visualizar los datos del cliente antes de aceptar el viaje?',
        answer: 'No, antes de aceptar verás un recorrido aproximado y el nombre del remitente. La información de contacto del cliente se revela en el Panel de Pedido Activo.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿A dónde me comunico si sufro un accidente en ruta?',
        answer: 'En el directorio de contacto de soporte existe una línea de emergencia para accidentes. Puedes comunicarte mediante una llamada directa.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Bajo qué criterio me aparecen los pedidos disponibles en el mapa?',
        answer: 'El sistema te muestra los pedidos dependiendo de cuáles son los negocios más cercanos a tu posición actual.',
        faq_status: 'active'
      },
      {
        category_type: 'repartidor',
        question: '¿Qué sucede si el agente de soporte rechaza mi propuesta de aumento de tarifa?',
        answer: 'La interfaz indicará que la tarifa fue denegada. Serás redirigido al dashboard de pedidos donde podrías ver de nuevo el pedido.',
        faq_status: 'active'
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('faq_design', null, {});
  }
};
