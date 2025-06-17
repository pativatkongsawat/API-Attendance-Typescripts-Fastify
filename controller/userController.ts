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

