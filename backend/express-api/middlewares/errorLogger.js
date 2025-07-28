// backend/express-api/middlewares/errorLogger.js
const expressWinston = require('express-winston');
const { transports, format } = require('winston');

module.exports = expressWinston.errorLogger({
  transports: [
    new transports.Console(),
  ],
  format: format.combine(
    format.colorize(),
    format.json(),
    format.timestamp()
  ),
});
