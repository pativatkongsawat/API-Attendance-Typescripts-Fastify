import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export async function verifyToken(req: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Token ไม่ถูกต้อง' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    
    
    req.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
}
