import { FastifyInstance } from 'fastify';
import { login } from '../controller/auth/authController';
import { verifyToken } from '../middleware/authenMiddleware';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/', login);
  app.get('/me', { preHandler: verifyToken }, async (req, reply) => {
    const user = (req as any).user;
    return reply.send({ user });
  });
}