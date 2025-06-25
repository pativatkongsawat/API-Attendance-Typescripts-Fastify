import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../server/condb';
import { CreateCourseInput} from '../../types/courses/course'
import {CurrentUser} from '../../types/users/user'
import { count, error } from 'console';
import { getNow } from '../../utils/date';

export const getCourseAll = async (
  req: FastifyRequest, reply: FastifyReply) => {
  try {
    const courses = await prisma.courses.findMany({
      where: {
        deleted_at: null,
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            department: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    if (courses.length === 0) {
      return reply.status(404).send({
        error: "ไม่พบรายวิชาในระบบ",
      });
    }

    
    const result = courses.map((course) => ({
      course_id: course.course_id,
      course_code: course.course_code,
      course_name: course.course_name,
      attendance_status: course.attendance_status,
      seat_limit: course.seat_limit,
      current_enrollments: course.current_enrollments,
      instructor :{
            first_name: course.users.first_name,
            last_name: course.users.last_name,
            email: course.users.email,
            department: course.users.department,
            }
        })
    );

    return reply.status(200).send(result);
  } catch (err: any) {
    return reply.status(500).send({
      error: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    });
  }
};

export const getCourseById = async (
  req: FastifyRequest, reply: FastifyReply) => {
  const { course_code } = req.query as {
    course_code: string;
  };

  try {
    const course = await prisma.courses.findUnique({
      where: { course_code },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            department: true,
          },
        },
      },
    });

    if (!course) {
      return reply.status(404).send({
        error: "ไม่พบรหัสวิชานี้",
      });
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
    return reply.status(500).send({
      error: err.message || "เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์",
    });
  }
};

export const createCourse = async (
  req: FastifyRequest<{ Body: CreateCourseInput }>,
  reply: FastifyReply
) => {
  const user = (req as any).user as CurrentUser;

  if (user.roles.some((r) => r.id === 3)) {
    return reply.status(403).send({
      error: 'คุณไม่มีสิทธิเข้าถึง API นี้',
    });
  }

  try {
    const { course_code, course_name, seat_limit, time_slots } = req.body;

    if (!course_code || !course_name || !seat_limit) {
      return reply.status(400).send({
        error: 'ใส่ข้อมูลให้ครบถ้วน',
      });
    }

    if (!time_slots || time_slots.length === 0) {
      return reply.status(400).send({
        error: 'ต้องใส่เวลาเรียนอย่างน้อย 1 รายการ',
      });
    }

    const saveCourse = await prisma.courses.create({
      data: {
        course_code,
        course_name,
        instructor_id: user.id,
        seat_limit,
        current_enrollments: 0,
        attendance_status :"closed"
      },
    });

    // const slotdata = time_slots.map((slot) => ({
    //   course_id: saveCourse.course_id,
    //   day: slot.day,
    //   start_time: new Date(`1970-01-01T${slot.start_time}Z`),
    //   end_time: new Date(`1970-01-01T${slot.end_time}Z`),
    // }));

    const slotdata = time_slots.map((slot) => ({
      course_id : saveCourse.course_id,
      day : slot.day,
      start_time : new Date(`1970-01-01T${slot.start_time}Z`),
      end_time: new Date(`1970-01-01T${slot.end_time}Z`),
    }));

    await prisma.course_time_slots.createMany({
      data: slotdata,
    });

    return reply.status(201).send({
      message: 'สร้างคอร์สและเวลาเรียนสำเร็จ',
      course: saveCourse,
    });
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      error: 'เกิดข้อผิดพลาดในการสร้างคอร์ส',
    });
  }
};

export const deleteCourse = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const { course_id } = req.query as { course_id: number };

    if (!course_id) {
      return reply.status(400).send({
        error: 'กรุณาระบุ course_id',
      });
    }

    
    const foundCourse = await prisma.courses.findUnique({
      where: { course_id },
    });

    if (!foundCourse) {
      return reply.status(404).send({
        error: 'ไม่พบคอร์สที่ต้องการลบ',
      });
    }


    const result = await prisma.$transaction(async (tx) => {
      await tx.course_time_slots.deleteMany({
        where: { course_id },
      });

      const delcourse = await tx.courses.delete({
        where: { course_id },
      });

      return delcourse;
    });

    return reply.status(200).send({
      message: 'ลบคอร์สสำเร็จ',
      course: result,
    });
  } catch (err: any) {
   
    

    console.error(err);
    return reply.status(500).send({
      error: 'เกิดข้อผิดพลาดในระบบ',
    });
  }
};


export const softDeleteCourse = async (
  req: FastifyRequest,
  reply: FastifyReply
) => {
  const now = getNow();

  try {
    const { course_id } = req.query as { course_id: number };

    if (!course_id) {
      return reply.status(400).send({
        error: 'กรุณาระบุคอร์สไอดี',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const delcourse = await tx.courses.update({
        where: { course_id },
        data: {
          updated_at: now,
          deleted_at: now,
        },
      });

      await tx.course_time_slots.updateMany({
        where: { course_id },
        data: {
          deleted_at: now,
        },
      });

      return delcourse;
    });

    return reply.status(200).send({
      message: 'ลบคอร์ส (soft delete) สำเร็จ',
      course: result,
    });
  } catch (err: any) {
    console.error(err);
    return reply.status(500).send({
      error: 'เกิดข้อผิดพลาดในระบบ',
      detail: err.message,
    });
  }
};