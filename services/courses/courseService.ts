import { prisma } from '../../server/condb';
import { CreateCourseInput } from '../../types/courses/course';
import { getNow } from '../../utils/date';

export const findAllCourses = async () => {
  return prisma.courses.findMany({
    where: { deleted_at: null },
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
    orderBy: { created_at: 'desc' },
  });
};

export const findCourseByCode = async (course_code: string) => {
  return prisma.courses.findUnique({
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
};

export const createCourse = async (
  userId: number,
  data: CreateCourseInput
) => {
  const { course_code, course_name, seat_limit, time_slots } = data;

  const now = getNow();

  const savedCourse = await prisma.courses.create({
    data: {
      course_code,
      course_name,
      instructor_id: userId,
      seat_limit,
      current_enrollments: 0,
      attendance_status: "closed",
    },
  });

  const slotData = time_slots.map(slot => ({
    course_id: savedCourse.course_id,
    day: slot.day,
    start_time: new Date(`1970-01-01T${slot.start_time}Z`),
    end_time: new Date(`1970-01-01T${slot.end_time}Z`),
  }));

  await prisma.course_time_slots.createMany({ data: slotData });

  return savedCourse;
};

export const deleteCourseById = async (course_id: number) => {
  return prisma.$transaction(async (tx) => {
    await tx.course_time_slots.deleteMany({ where: { course_id } });
    const deletedCourse = await tx.courses.delete({ where: { course_id } });
    return deletedCourse;
  });
};

export const softDeleteCourseById = async (course_id: number) => {
  const now = getNow();

  return prisma.$transaction(async (tx) => {
    const updatedCourse = await tx.courses.update({
      where: { course_id },
      data: { deleted_at: now, updated_at: now },
    });

    await tx.course_time_slots.updateMany({
      where: { course_id },
      data: { deleted_at: now },
    });

    return updatedCourse;
  });
};
