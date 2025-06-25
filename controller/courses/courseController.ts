import { FastifyRequest, FastifyReply } from 'fastify';
import {
  findAllCourses,
  findCourseByCode,
  createCourse,
  deleteCourseById,
  softDeleteCourseById,
} from '../../services/courses/courseService';
import { CurrentUser } from '../../types/users/user';
import { CreateCourseInput } from '../../types/courses/course';

export const getCourseAll = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const courses = await findAllCourses();

    if (courses.length === 0) {
      return reply.status(404).send({ error: "ไม่พบรายวิชาในระบบ" });
    }

    const result = courses.map(course => ({
      course_id: course.course_id,
      course_code: course.course_code,
      course_name: course.course_name,
      attendance_status: course.attendance_status,
      seat_limit: course.seat_limit,
      current_enrollments: course.current_enrollments,
      instructor: {
        first_name: course.users.first_name,
        last_name: course.users.last_name,
        email: course.users.email,
        department: course.users.department,
      },
    }));

    return reply.status(200).send(result);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

export const getCourseById = async (req: FastifyRequest, reply: FastifyReply) => {
  const { course_code } = req.query as { course_code: string };

  try {
    const course = await findCourseByCode(course_code);

    if (!course) {
      return reply.status(404).send({ error: "ไม่พบรหัสวิชานี้" });
    }

    return reply.status(200).send({
      course_id: course.course_id,
      course_code: course.course_code,
      course_name: course.course_name,
      attendance_status: course.attendance_status,
      seat_limit: course.seat_limit,
      current_enrollments: course.current_enrollments,
      instructor: {
        first_name: course.users.first_name,
        last_name: course.users.last_name,
        email: course.users.email,
        department: course.users.department,
      },
    });
  } catch (err: any) {
    return reply.status(500).send({ error: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์" });
  }
};

export const createCourseHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const user = (req as any).user as CurrentUser;

  if (user.roles.some(r => r.id === 3)) {
    return reply.status(403).send({ error: 'คุณไม่มีสิทธิเข้าถึง API นี้' });
  }

  try {
    const body = req.body as CreateCourseInput;
    if (!body.course_code || !body.course_name || !body.seat_limit || !body.time_slots?.length) {
      return reply.status(400).send({ error: 'ใส่ข้อมูลให้ครบถ้วน และมีเวลาเรียนอย่างน้อย 1 รายการ' });
    }

    const newCourse = await createCourse(user.id, body);

    return reply.status(201).send({
      message: 'สร้างคอร์สและเวลาเรียนสำเร็จ',
      course: newCourse,
    });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({ error: 'เกิดข้อผิดพลาดในการสร้างคอร์ส' });
  }
};

export const deleteCourseHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { course_id } = req.query as { course_id: number };
  if (!course_id) {
    return reply.status(400).send({ error: 'กรุณาระบุ course_id' });
  }

  try {
    const deleted = await deleteCourseById(course_id);
    return reply.status(200).send({ message: 'ลบคอร์สสำเร็จ', course: deleted });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};

export const softDeleteCourseHandler = async (req: FastifyRequest, reply: FastifyReply) => {
  const { course_id } = req.query as { course_id: number };
  if (!course_id) {
    return reply.status(400).send({ error: 'กรุณาระบุคอร์สไอดี' });
  }

  try {
    const result = await softDeleteCourseById(course_id);
    return reply.status(200).send({ message: 'ลบคอร์ส (soft delete) สำเร็จ', course: result });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({ error: 'เกิดข้อผิดพลาดในระบบ', detail: err.message });
  }
};
