import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateUserInput, UpdateUserInput, CurrentUser } from '../../types/users/user';
import {
  createUserService,
  getAllUserService,
  createUsersArrayService,
  updateUsersService,
  softDeleteUsersService,
} from '../../services/users/userService';

export const createUser = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const body = req.body as CreateUserInput;
    const user = (req as any).user as CurrentUser;

    const newuser = await createUserService(body, user);
    return reply.status(200).send(newuser);
  } catch (error: any) {
    console.error(error);
    return reply.status(error.status || 500).send({ error: error.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้' });
  }
};

export const getAllUser = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = await getAllUserService();
    return reply.status(200).send(users);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ error: 'ไม่สามารถแสดงผู้ใช้งานได้' });
  }
};

export const createUsersArray = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const users = req.body as CreateUserInput[];
    const user = (req as any).user as CurrentUser;

    const createdUsers = await createUsersArrayService(users, user);
    return reply.status(200).send({ message: 'สร้างผู้ใช้สำเร็จ', user: createdUsers });
  } catch (error: any) {
    console.error(error);
    return reply.status(error.status || 500).send({ error: error.message || 'ไม่สามารถเพิ่มผู้ใช้งานได้', detail: error.detail });
  }
};

export const updateUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { user_id } = req.query as { user_id: string };
    const data = req.body as UpdateUserInput;

    const updated = await updateUsersService(user_id, data);
    return reply.status(200).send({ message: 'อัปเดตผู้ใช้งานสำเร็จ', user: updated });
  } catch (error: any) {
    console.error(error);
    return reply.status(error.status || 500).send({ error: error.message || 'ไม่สามารถอัปเดตผู้ใช้งานได้', detail: error.detail });
  }
};

export const softDeleteUsers = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { user_id } = req.query as { user_id: string };

    const deletedAt = await softDeleteUsersService(user_id);
    return reply.status(200).send({ message: 'ลบผู้ใช้งาน (soft delete) สำเร็จ', deleted_at: deletedAt });
  } catch (error: any) {
    console.error(error);
    return reply.status(error.status || 500).send({ error: error.message || 'ไม่สามารถลบผู้ใช้งานได้', detail: error.detail });
  }
};
