import Fastify, { FastifyServerOptions } from 'fastify';
import config from './server/config';
import connectToDB from './server/condb';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import courseRoutes from './routes/courseRoutes';

import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

const buildApp = (options: FastifyServerOptions) => {
  const app = Fastify(options);


  app.register(swagger, {
    swagger: {
      info: {
        title: 'Shopping API',
        description: 'API documentation for Shopping App',
        version: '1.0.0',
      },
      host: `localhost:${config.port}`,
      schemes: ['http'],
      consumes: ['application/json'],
      produces: ['application/json'],
    }
  });

 
  app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

 
  app.register(userRoutes, { prefix: '/api/users' });
  app.register(authRoutes, { prefix: '/api/auth' });
  app.register(courseRoutes, { prefix: '/api/course' });

  return app;
};

const options: FastifyServerOptions = {
  logger: true
};

connectToDB().then(() => {
  const app = buildApp(options);

  const startServer = async () => {
    try {
      await app.listen({ port: Number(config.port) });
      console.log(`✅ Server running at http://localhost:${config.port}`);
      console.log(`📄 Swagger docs at http://localhost:${config.port}/docs`);
    } catch (err) {
      console.error('❌ Failed to start server:', err);
      process.exit(1);
    }
  };

  startServer();
}).catch(err => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});

export default buildApp;
