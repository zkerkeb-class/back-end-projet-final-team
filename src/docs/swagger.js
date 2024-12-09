const generateSwagger = require('swagger-autogen')();

const swaggerDocument = {
  info: {
    version: '1.0.0',
    title: 'Zakharmony API',
    description: 'API for Managing Zakharmony',
    contact: {
      name: 'API Support',
      email: 'support@zakharmony.com',
    },
  },
  host: 'localhost:8080/api/v1',
  basePath: '/',
  schemes: ['http'],
  consumes: ['application/json'],
  produces: ['application/json'],
};
const swaggerFile = './swagger.json';
const apiRouteFile = ['../routes/index.js'];
generateSwagger(swaggerFile, apiRouteFile, swaggerDocument);
