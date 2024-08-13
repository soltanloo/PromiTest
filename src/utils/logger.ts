import { createLogger, format, transports } from 'winston';
const logger = createLogger({
  level: process.env.LOG_LEVEL,
  format: format.combine(
    format.timestamp(),
    format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
  ),
  transports: [
    new transports.Console({
      level: 'info', // will log errors, warnings and info
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
      ),
    }),
    new transports.File({
      filename: 'logs.log',
      level: 'debug', // will log errors, warnings, info and debug (if LOG_LEVEL is set to debug or lower)
      format: format.combine(
        format.timestamp(),
        format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
      ),
    }),
  ],
});

export default logger;