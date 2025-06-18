import { FastifyInstance } from 'fastify';
import { getAllUser } from '../controller/userController';
import { createUser } from '../controller/userController';
import { createUsersArray } from '../controller/userController';

export default async function userRoutes(app: FastifyInstance) {
  app.get('/', getAllUser)
  app.post('/' ,createUser)
  app.post('/array',createUsersArray)
 
}
