import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../server/condb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const login = async (req: FastifyRequest, reply: FastifyReply) => {
  try {
    const { email, password } = req.body as {
      email: string;
      password: string;
    };

    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        user_roles: {
          include: {
            roles: true,
          },
        },
      },
    });

    if (!user || !user.password) {
      return reply.status(401).send({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(401).send({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

   
    const token = jwt.sign(
      {
        id: user.id,
        user_id : user.user_id,
        email: user.email,
        roles: user.user_roles?.map((r) => r.roles.role_name) || [],
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '1d' }
    );

    reply.send({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        user_id:user.user_id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        roles: user.user_roles?.map((r) => r.roles.role_name) || [],
      },
    });
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: 'เกิดข้อผิดพลาดในระบบ' });
  }
};

export const login2 = async(req: FastifyRequest , reply:FastifyReply)=> {
    
    try{
        const {email , password} = req.body as {
            email:string,
            password:string
        }

        const user = await prisma.users.findUnique({
            where:{email},
            include:{
                user_roles:{
                    include:{
                        roles:true,
                    }
                }
                
            }
        })

        if(!user || user.password){

            return reply.status(401).send({
                Error: "email หรือ password ไม่ถูกต้อง"
            })

        }

        const isPasswordValid = await bcrypt.compare(password , user.password)

        if(!isPasswordValid){
            return reply.status(401).send({
                "Error": "password ไม่ถูกต้อง"
            })
        }

        const token = jwt.sign({
            id:user.id,
            user_id:user.user_id,
            email:user.email,
            department:user.department,
            role:user.user_roles?.map((r) => r.roles.role_name)|| [],
            },
            process.env.JWT_SECRET as string,
            { expiresIn: '1d' }
        );

        return reply.status(200).send({
            token,
            Message:"เข้าสู่ระบบสำเร็จ",
            UserId:user.user_id,
            Email:user.email,
            Depaetment:user.department,
            role:user.user_roles?.map((r)=> r.roles.role_name)
        })

    }catch(error){

        return reply.status(500).send({

            Error:error

        })

    }

}