import {prisma} from '../../server/condb';
import {getNow} from '../../utils/date'
import {CreateEnroll} from '../../types/enrollment/enrollment'



export const createEnroll = async ( body : CreateEnroll , userId : number)=> {

    const {course_id} = body
    const now = getNow()

    const savedata = await prisma.enrollments.create({
        data :{
            course_id : course_id,
            student_id : userId,
            created_at : now,
            updated_at : now,
            deleted_at : null,
        }
    })

    return savedata
}