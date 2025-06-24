import { FastifyInstance } from 'fastify';
import {
  getAllUser,
  createUser,
  createUsersArray,
  updateUsers,
  softDeleteUsers,
} from '../controller/users/userController';
import { verifyToken } from '../middleware/authenMiddleware';

export default async function userRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: verifyToken }, getAllUser);
  app.post('/', { preHandler: verifyToken }, createUser);
  app.post('/array', { preHandler: verifyToken }, createUsersArray);
  app.put('/', { preHandler: verifyToken }, updateUsers);
  app.delete('/soft', { preHandler: verifyToken }, softDeleteUsers);
}