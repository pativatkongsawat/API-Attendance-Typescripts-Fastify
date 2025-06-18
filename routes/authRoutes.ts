import { FastifyInstance } from 'fastify';
import { login } from '../controller/authController';
import {  verifyToken } from '../middleware/authenMiddleware';

export default async function authRoutes(app: FastifyInstance) {
 
  app.post('/auth/login', login);

  
  app.get('/auth/me', { preHandler: verifyToken }, async (req, reply) => {
    
    return reply.send({ user: req.user });
  });
}
