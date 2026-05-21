const logger = (req, res, next) => {
  const date = new Date().toISOString();
  const requestedPath = req.body && req.body.path ? req.body.path : req.originalUrl;
  const requestedMethod = req.body && req.body.method ? req.body.method.toUpperCase() : req.method;

  console.log(`[${date}] ${requestedMethod} ${requestedPath}`);
  next();
};

module.exports = logger;
