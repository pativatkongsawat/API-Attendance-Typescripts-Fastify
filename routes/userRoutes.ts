import { FastifyInstance } from 'fastify';
import { getUsers } from '../controller/userController';

export default async function userRoutes(app: FastifyInstance) {
  app.get('/', getUsers)
 
}
