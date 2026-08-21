const swaggerJsDoc = require('swagger-jsdoc');
const config = require('config');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Multi-Vendor E-commerce Marketplace API',
      version: '1.0.0',
      description: `
Production-style multi-vendor marketplace REST API.

## Getting started in Swagger
1. Use **POST /auth/register** then **POST /auth/login**
2. Copy the JWT from the login response
3. Click **Authorize** and enter: Bearer your_token_here
4. Try protected seller/customer/admin flows

## Stack
Node.js · Express · PostgreSQL · Redis · JWT RBAC · Docker
      `,
      contact: {
        name: 'Amna Afzal',
        url: 'https://github.com/amna5475/Multi-Vendor-Ecommerce-API'
      }
    },
    servers: [
      {
        url: `http://localhost:${config.get('app.port')}/api`,
        description: 'Local development API'
      }
    ],
    tags: [
      { name: 'Auth', description: 'Register and login' },
      { name: 'Products', description: 'Catalog and seller product management' },
      { name: 'Orders', description: 'Checkout and order lifecycle' },
      { name: 'Sellers', description: 'Seller onboarding and shop operations' },
      { name: 'Payments', description: 'Payment initialization and status' },
      { name: 'Inventory', description: 'Stock adjustments and history' }
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
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
