const monitoringService = require('../services/monitoring.service');

const responseTimeMiddleware = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const time = diff[0] * 1e3 + diff[1] * 1e-6;
    monitoringService.addResponseTime(time);
  });

  next();
};

module.exports = responseTimeMiddleware;
