import { prisma } from '../../server/condb';
import { CreateUserInput, UpdateUserInput, CurrentUser } from '../../types/users/user';
import { hashPassword } from '../../utils/hash';
import bcrypt from 'bcrypt';
import { getNow } from '../../utils/date';

export const createUserService = async (body: CreateUserInput, currentUser: CurrentUser) => {
  if (currentUser.roles.some(r => r.id === 3)) {
    throw { status: 403, message: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' };
  }

  const { user_id, email, password, first_name, last_name, department } = body;

  if (!user_id || !email || !password || !first_name || !last_name || !department) {
    throw { status: 400, message: 'กรุณาใส่ข้อมูลให้ครบ' };
  }

  const existing = await prisma.users.findUnique({ where: { email } });
  if (existing) {
    throw { status: 409, message: 'มีผู้ใช้งานนี้อยู่แล้ว' };
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

  return newuser;
};

export const getAllUserService = async () => {
  return await prisma.users.findMany();
};

export const createUsersArrayService = async (users: CreateUserInput[], currentUser: CurrentUser) => {
  if (currentUser.roles.some(r => r.id === 3)) {
    throw { status: 403, message: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' };
  }

  if (!Array.isArray(users) || users.length === 0) {
    throw { status: 400, message: 'ต้องระบุข้อมูลผู้ใช้อย่างน้อยหนึ่งรายการ' };
  }

  const now = getNow();

  const usersToCreate = await Promise.all(
    users.map(async (u) => {
      const { user_id, email, password, first_name, last_name, department } = u;
      if (!user_id || !email || !password || !first_name || !last_name) {
        throw { status: 400, message: 'ข้อมูลไม่ครบถ้วน', detail: { user_id, email, first_name, last_name } };
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

  return createdUsers;
};

export const updateUsersService = async (user_id: string, data: UpdateUserInput) => {
  if (!user_id) {
    throw { status: 400, message: 'ต้องระบุ user_id' };
  }

  const updateData: any = {};
  if (data.email) updateData.email = data.email;
  if (data.first_name) updateData.first_name = data.first_name;
  if (data.last_name) updateData.last_name = data.last_name;
  if (data.department !== undefined) updateData.department = data.department;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.password) updateData.password = await bcrypt.hash(data.password, 10);

  const updated = await prisma.users.update({
    where: { user_id },
    data: updateData,
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

  return updated;
};

export const softDeleteUsersService = async (user_id: string) => {
  if (!user_id) {
    throw { status: 400, message: 'ต้องระบุ user_id' };
  }

  const now = new Date();

  await prisma.users.update({
    where: { user_id },
    data: {
      deleted_at: now,
      is_active: false,
    },
  });

  return now;
};
