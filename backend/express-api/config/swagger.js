const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'WalletApp API',
      version: '1.0.0',
      description: 'Documentación Swagger de la WalletApp API',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Servidor local' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js','./controllers/*.js'], 
};

module.exports = swaggerJSDoc(options);
