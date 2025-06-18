import { FastifyInstance } from 'fastify';
import { getAllUser } from '../controller/userController';

export default async function userRoutes(app: FastifyInstance) {
  app.get('/', getAllUser)
 
}
