import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'debug', 
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf((info) => `${info.timestamp} [${info.level}]: ${info.message}`)
  ),
  transports: [
    new transports.Console(), // Log to the console
    new transports.File({ filename: 'logs.log' }), // Log to a file
  ],
});

export default logger;