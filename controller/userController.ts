import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server/condb';
import {bcrypt} from 'bcrypt'

export const createUser = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { user_id, email, password, first_name, last_name, department } = req.body as {
      user_id: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      department: string;
    };

    if (user_id || email || password || first_name || last_name || department == null){

      return reply.status(400).send({

        "Error":"กรุณาใส่ข้อมูลให้ครบ",

      })

    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const now = new Date();

    const newuser = await prisma.users.create({
      data: {
        user_id,
        email,
        password : hashedPassword,
        first_name,
        last_name,
        department,
        is_active: true,
        deleted_at: null,
        created_at: now,
        updated_at: now,
      },
    });

    return reply.status(200).send(newuser);

  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'ไม่สามารถเพิ่มผู้ใช้งานได้' });
  }
};


export const getAllUser = async (req : FastifyRequest , reply : FastifyReply) => {

  try{

    const user = await prisma.users.findMany()
    return reply.status(200).send(user);

  }catch(error){
    console.error(error);
    return reply.status(500).send({ error: 'ไม่สามารถเเสดงผู้ใช้งานได้' });

  }

}