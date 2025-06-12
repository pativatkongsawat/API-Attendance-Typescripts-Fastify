import Fastify, { FastifyServerOptions } from 'fastify';
import config from './server/config';
import connectToDB from './server/condb';
import userRoutes from './routes/userRoutes';

const buildApp = (options: FastifyServerOptions) => {
  const app = Fastify(options);

  app.register(userRoutes, { prefix: '/users' });

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
      console.log(`🚀 Server running at http://localhost:${config.port}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  startServer();
}).catch(err => {
  console.error('❌ Failed to connect to database:', err);
  process.exit(1);
});

export default buildApp;
