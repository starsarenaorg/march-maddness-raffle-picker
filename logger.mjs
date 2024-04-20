import { createLogger, format, transports } from 'winston';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create a logger instance
const logger = createLogger({
  // Set the level of logger. You can choose between 'info', 'warn', 'error', etc.
  level: 'info',

  // Define the format of the log message
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
  ),

  // Define the transports
  transports: [
    // File transport
    new transports.File({
      filename: path.join(__dirname, 'logs', 'app.log'),
      level: 'info'
    })
  ]
});

export default logger;
