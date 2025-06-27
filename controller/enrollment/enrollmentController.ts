import { FastifyRequest, FastifyReply } from 'fastify';
import {CurrentUser} from '../../types/users/user'
import {CreateEnroll} from '../../types/enrollment/enrollment'
import {createEnroll} from '../../services/enrollment/enrollmentService'



export const createEnrollment = async (req : FastifyRequest , reply : FastifyReply) =>{

    const user = (req as any).user as CurrentUser

    if(user.roles.some(r => r.id === 2 || r.id ===1)){

        return reply.status(403).send({error : "ไม่มีสิทธิเข้าถึง api นี้"})

    }

    try{

        const body = req.body as CreateEnroll

        if(!body){
            return reply.status(400).send({error : "กรอกคอร์สไอดีเพื่อลงทะเบียน"})
        }
        
        const data = await createEnroll(body , user.id)

        return reply.status(200).send({
            "Meassge": "ลงทะเบียนเสร็จสิ้น",
            data
        })


    }catch(err){

        return reply.status(500).send({error : err})

    }

}