const getServiceUrl = (serviceName) => {
  const urls = {
    BUSINESS: process.env.BUSINESS_URL,
  };

  return urls[serviceName] || null;
};

module.exports = { getServiceUrl };
