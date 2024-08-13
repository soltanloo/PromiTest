import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'debug', // Global level, processes all logs down to debug
  format: format.combine(
    format.timestamp(),
    format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'info', // Console will log 'info' and higher (info, warn, error)
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
      ),
    }),
    new transports.File({
      filename: 'logs.log',
      level: 'debug', // File will log all levels including 'debug'
      format: format.combine(
        format.timestamp(),
        format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
      ),
    }),
  ],
});

export default logger;