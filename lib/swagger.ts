import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Prevalentware API Documentation',
      version: '1.0.0',
      description: 'API documentation for the Prevalentware technical test project.',
    },
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session-token',
        },
      },
    },
  },
  apis: ['./pages/api/**/*.ts'], // Path to the API docs
};

export const spec = swaggerJsdoc(options);
