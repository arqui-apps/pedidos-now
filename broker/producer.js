// Admin-contabilidad Kenneth Rivera 

const enviarEvento = async (evento) => {

    console.log("Evento enviado al broker:");
    console.log(JSON.stringify(evento, null, 2));

    return true;
};

exports.enviarEvento = async (evento) => {
    console.log("Evento enviado:", evento);
};