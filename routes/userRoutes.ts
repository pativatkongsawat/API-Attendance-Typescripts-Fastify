import { FastifyInstance } from 'fastify';
import { getAllUser } from '../controller/userController';
import { createUser } from '../controller/userController';
import { createUsersArray } from '../controller/userController';
import { softDeleteUsers} from '../controller/userController';
import { updateUsers } from '../controller/userController';
import { verifyToken } from '../middleware/authenMiddleware';

export default async function userRoutes(app: FastifyInstance) {
  // app.get('/', getAllUser)
  // app.post('/' ,createUser)
  // app.post('/array',createUsersArray)
  app.get('/', { preHandler: verifyToken }, getAllUser);
  app.post('/', { preHandler: verifyToken }, createUser);
  app.post('/array', { preHandler: verifyToken }, createUsersArray);
  app.delete('/soft' ,{preHandler :verifyToken} , softDeleteUsers);
  app.put('/',{preHandler: verifyToken} , updateUsers );
  
}
