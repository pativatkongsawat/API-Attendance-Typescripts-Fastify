import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../server/condb';

export const getCourseAll = async (req: FastifyRequest, reply: FastifyReply) => {
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

export const getCourseById = async (req: FastifyRequest, reply: FastifyReply) => {
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

export const createCourse = async  (req : FastifyRequest , reply :FastifyReply) => {

    const user = (req as any).user as {
        id:number,
        user_id:string,
        email:string,
        roles: { id: number; name: string }[];
    }

    if (!user || !user.roles.some(r => r.id === 1 || r.id === 2)) {
        return reply.status(403).send({ error: 'คุณไม่มีสิทธิ์เข้าถึง API นี้' });
    }

    try{
        
    }catch(err){

    }

}

