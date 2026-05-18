import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    base: { service: 'chat-automatizado' },
    timestamp: pino.stdTimeFunctions.isoTime,

    // En desarrollo usa pino-pretty para logs legibles
    // En producción usa JSON puro para Railway/logs externos
    ...(isDev && {
        transport: {
            target: 'pino-pretty',
            options: {
                colorize:        true,
                translateTime:   'SYS:HH:MM:ss',
                ignore:          'pid,hostname,service',
                messageFormat:   '{msg}',
                levelFirst:      true,
            },
        },
    }),
});

export default logger;