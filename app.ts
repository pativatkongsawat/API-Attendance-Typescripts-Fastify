import Fastify, { FastifyServerOptions } from 'fastify';
import config from './server/config'; 
import condb from './server/condb';

const buildApp = (options: FastifyServerOptions) => {
  const app = Fastify(options);


  return app;
};

const options: FastifyServerOptions = {
  logger: true
};


condb().then(() => {
  const app = buildApp(options);

  const startServer = async () => {
    try {
      await app.listen({ port: Number(config.port) });
      console.log(`Server is running on http://localhost:${config.port}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };

  startServer();
}).catch(err => {
  console.error('Failed to connect to database:', err);
  process.exit(1);
});

export default buildApp;
