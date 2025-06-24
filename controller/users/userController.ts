import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../server/condb';
import bcrypt from 'bcrypt';
import { CreateUserInput, UpdateUserInput, CurrentUser } from '../../types/users/user';
import { hashPassword } from '../../utils/hash';
import { getNow } from '../../utils/date';

export const createUser = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const body = req.body as CreateUserInput;
  const user = (req as any).user as CurrentUser;

  const roleIds = user.roles.map(r => r.id).join(', ');
  console.log(`[createUser] by ${user.email}, roles=[${roleIds}]`);

  if (user.roles.some(r => r.id === 3)) {
    return reply.status(403).send({ error: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
  }

  try {
    const { user_id, email, password, first_name, last_name, department } = body;

    if (!user_id || !email || !password || !first_name || !last_name || !department) {
      return reply.status(400).send({ error: 'กรุณาใส่ข้อมูลให้ครบ' });
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'มีผู้ใช้งานนี้อยู่แล้ว' });
    }

    const hashedPassword = await hashPassword(password);
    const now = getNow();

    const newuser = await prisma.users.create({
      data: {
        user_id,
        email,
        password: hashedPassword,
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

export const getAllUser = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const user = await prisma.users.findMany();
    return reply.status(200).send(user);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'ไม่สามารถแสดงผู้ใช้งานได้' });
  }
};

export const createUsersArray = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const user = (req as any).user as CurrentUser;

  if (!user.roles.some(r => [1, 2].includes(r.id))) {
    return reply.status(403).send({ error: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
  }

  try {
    const users = req.body as CreateUserInput[];

    if (!Array.isArray(users) || users.length === 0) {
      return reply.status(400).send({ error: 'ต้องระบุข้อมูลผู้ใช้อย่างน้อยหนึ่งรายการ' });
    }

    const now = getNow();

    const usersToCreate = await Promise.all(
      users.map(async (u) => {
        const { user_id, email, password, first_name, last_name, department } = u;
        if (!user_id || !email || !password || !first_name || !last_name) {
          throw new Error('ข้อมูลไม่ครบถ้วน');
        }

        return {
          user_id,
          email,
          password: await hashPassword(password),
          first_name,
          last_name,
          department,
          is_active: true,
          created_at: now,
          updated_at: now,
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
    return reply.status(500).send({ error: 'ไม่สามารถเพิ่มผู้ใช้งานได้', detail: error });
  }
};

export const updateUsers = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { user_id } = req.query as { user_id: string };
    const { email, password, first_name, last_name, department, is_active } = req.body as UpdateUserInput;

    if (!user_id) {
      return reply.status(400).send({ error: 'ต้องระบุ user_id' });
    }

    const data: any = {};
    if (email) data.email = email;
    if (first_name) data.first_name = first_name;
    if (last_name) data.last_name = last_name;
    if (department !== undefined) data.department = department;
    if (is_active !== undefined) data.is_active = is_active;
    if (password) data.password = await bcrypt.hash(password, 10);

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
      },
    });

    return reply.status(200).send({
      message: 'อัปเดตผู้ใช้งานสำเร็จ',
      user: updated,
    });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ error: 'ไม่สามารถอัปเดตผู้ใช้งานได้', detail: err.message });
  }
};

export const softDeleteUsers = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
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
        is_active: false,
      },
    });

    return reply.status(200).send({
      message: 'ลบผู้ใช้งาน (soft delete) สำเร็จ',
      deleted_at: now,
    });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ error: 'ไม่สามารถลบผู้ใช้งานได้', detail: err.message });
  }
};
