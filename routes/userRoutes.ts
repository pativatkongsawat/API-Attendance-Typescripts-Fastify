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
  app.get('/', {
    preHandler: verifyToken,
    schema: {
      tags: ['Users'],
      summary: 'Get all users',
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              user_id: { type: 'string' },
              email: { type: 'string' },
              first_name: { type: 'string' },
              last_name: { type: 'string' },
              department: { type: 'string' },
              is_active: { type: 'boolean' },
              created_at: { type: 'string', format: 'date-time' },
              updated_at: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  }, getAllUser);

  app.post('/', {
    preHandler: verifyToken,
    schema: {
      tags: ['Users'],
      summary: 'Create a user',
      body: {
        type: 'object',
        required: ['user_id', 'email', 'password', 'first_name', 'last_name', 'department'],
        properties: {
          user_id: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          department: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            user_id: { type: 'string' },
            email: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            department: { type: 'string' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, createUser);

  app.post('/array', {
    preHandler: verifyToken,
    schema: {
      tags: ['Users'],
      summary: 'Create multiple users',
      body: {
        type: 'array',
        items: {
          type: 'object',
          required: ['user_id', 'email', 'password', 'first_name', 'last_name', 'department'],
          properties: {
            user_id: { type: 'string' },
            email: { type: 'string' },
            password: { type: 'string' },
            first_name: { type: 'string' },
            last_name: { type: 'string' },
            department: { type: 'string' }
          }
        }
      }
    }
  }, createUsersArray);

  app.put('/', {
    preHandler: verifyToken,
    schema: {
      tags: ['Users'],
      summary: 'Update user',
      querystring: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          email: { type: 'string' },
          password: { type: 'string' },
          first_name: { type: 'string' },
          last_name: { type: 'string' },
          department: { type: 'string' },
          is_active: { type: 'boolean' }
        }
      }
    }
  }, updateUsers);

  app.delete('/soft', {
    preHandler: verifyToken,
    schema: {
      tags: ['Users'],
      summary: 'Soft delete user',
      querystring: {
        type: 'object',
        required: ['user_id'],
        properties: {
          user_id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            deleted_at: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  }, softDeleteUsers);
}
