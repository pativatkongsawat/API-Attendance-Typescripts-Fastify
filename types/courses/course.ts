import { CourseAttendanceStatus } from './course-attendance-status'

export interface TimeSlotInput {
  day: string;         
  start_time: string;  
  end_time: string;    
}

export interface CreateCourseInput {
  course_code: string;
  course_name: string;
  instructor_id: number;
  seat_limit: number;
  attendance_status?: CourseAttendanceStatus;
  time_slots?: TimeSlotInput[];  
}
