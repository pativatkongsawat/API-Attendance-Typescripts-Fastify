import { FastifyReply, FastifyRequest } from 'fastify';
import { prisma } from '../server/condb';

export const getUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await prisma.users.findMany();
    reply.send(users);
  } catch (error) {
    reply.status(500).send({ error: 'Failed to fetch users' });
  }
};

export const getUserById = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    
    const { id } = req.query as { id: string };

    if (!id) {
      return reply.status(400).send({ error: 'Missing id parameter' });
    }

    const user = await prisma.users.findUnique({
      where: {
        id: parseInt(id), 
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return reply.status(200).send(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  }
};