import { FastifyInstance } from 'fastify';
import { login } from '../controller/auth/authController';
import { verifyToken } from '../middleware/authenMiddleware';

export default async function authRoutes(app: FastifyInstance) {
  app.post('/', {
    schema: {
      tags: ['Auth'],
      summary: 'Login with email and password',
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                user_id: { type: 'string' },
                email: { type: 'string' },
                first_name: { type: 'string' },
                last_name: { type: 'string' },
                roles: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, login);

  app.get('/me', {
    preHandler: verifyToken,
    schema: {
      tags: ['Auth'],
      summary: 'Get current user from token',
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                user_id: { type: 'string' },
                email: { type: 'string' },
                roles: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const user = (req as any).user;
    return reply.send({ user });
  });
}
