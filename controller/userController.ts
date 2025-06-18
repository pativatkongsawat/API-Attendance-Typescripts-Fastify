import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../server/condb';
import bcrypt from 'bcrypt'

export const createUser = async (req: FastifyRequest, reply: FastifyReply) => {

  const user = (req as any).user as {
    id: number;
    email: string;
    roles: { id: number; name: string }[];
  };
  const roleIds = user.roles.map(r => r.id).join(', ');
  console.log(`[createUser] Request by user ${user.email} (id=${user.id}), roles=[${roleIds}]`);

  if (user.roles.some(r => r.id == 3)) {
    return reply.status(403).send({ error: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
  }
  try {
    const { user_id, email, password, first_name, last_name, department } = req.body as {
      user_id: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      department: string;
    };

    if (!user_id || !email || !password || !first_name || !last_name || !department){

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


export const createUsersArray = async (req: FastifyRequest, reply: FastifyReply) => {

  const user = (req as any).user as {
    id: number;
    email: string;
    roles: { id: number; name: string }[];
  };

  if (!user || !user.roles.some(r => r.id === 1 || r.id === 2)) {
    return reply.status(403).send({ error: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
  }

  try {
    const users = req.body as {
      user_id: string;
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      department?: string;
    }[];

    if (!Array.isArray(users) || users.length === 0) {
      return reply.status(400).send({
        error: 'ต้องระบุข้อมูลผู้ใช้อย่างน้อยหนึ่งรายการ',
      });
    }

    const usersToCreate = await Promise.all(
      users.map(async (user) => {
        const { user_id, email, password, first_name, last_name, department } = user;

        if (!user_id || !email || !password || !first_name || !last_name) {
          return reply.status(400).send({
            error:"กรอกข้อมูลให้ครบถ้วน"
          })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        return {
          user_id,
          email,
          password: hashedPassword,
          first_name,
          last_name,
          department,
          is_active: true,
        };
      })
    );

    const createdUsers = await prisma.users.createMany({
      data: usersToCreate,
      skipDuplicates: true,
    });

    return reply.status(200).send({
      message: 'สร้างผู้ใช้สำเร็จ',
      count: createdUsers.count,
    });

  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'ไม่สามารถเพิ่มผู้ใช้งานได้', detail: error});
  }
};


export const updateUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    
    const { user_id } = req.query as { user_id: string };
    if (!user_id) {
      return reply.status(400).send({ error: 'ต้องระบุ user_id' });
    }

    
    const {email,password,first_name,last_name,department,is_active} = req.body as {
      email?: string;
      password?: string;
      first_name?: string;
      last_name?: string;
      department?: string;
      is_active?: boolean;
    };

    const data: any = {};
    if (email)       data.email = email;
    if (first_name)  data.first_name = first_name;
    if (last_name)   data.last_name = last_name;
    if (department !== undefined) data.department = department;
    if (is_active !== undefined)  data.is_active = is_active;
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    
    const updated = await prisma.users.update({
      where: { user_id },
      data,
      select: {
        user_id: true,
        email: true,
        first_name: true,
        last_name: true,
        department: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      }
    });

    return reply.status(200).send({
      message: 'อัปเดตผู้ใช้งานสำเร็จ',
      user: updated
    });
  } catch (err: any) {
    console.error(err);
    return reply
      .status(500)
      .send({ error: 'ไม่สามารถอัปเดตผู้ใช้งานได้', detail: err.message });
  }
};


export const softDeleteUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { user_id } = req.query as { user_id: string };
    if (!user_id) {
      return reply.status(400).send({ error: 'ต้องระบุ user_id' });
    }

    const now = new Date();
    await prisma.users.update({
      where: { user_id },
      data: {
        deleted_at: now,
        is_active: false
      }
    });

    return reply.status(200).send({
      message: 'ลบผู้ใช้งาน (soft delete) สำเร็จ',
      deleted_at: now
    });
  } catch (err: any) {
    console.error(err);
    return reply
      .status(500)
      .send({ error: 'ไม่สามารถลบผู้ใช้งานได้', detail: err.message });
  }
};


export const deleteUsers = async(req :FastifyRequest , reply : FastifyReply) => {
  
}