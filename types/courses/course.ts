import { CourseAttendanceStatus } from './course-attendance-status'

export interface CreateCourseInput {
  course_code: string;
  course_name: string;
  instructor_id: number;
  seat_limit: number;
  current_enrollments?: number;
  attendance_status?: CourseAttendanceStatus;
}