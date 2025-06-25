import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/authenMiddleware';
import {getCourseAll ,
        getCourseById,
        createCourse,
        deleteCourse,
        softDeleteCourse   
} from '../controller/courses/courseController'

export default async function courseRoutes(app : FastifyInstance){

    app.get('/' , {preHandler : verifyToken} , getCourseAll )
    app.get('/by' , {preHandler : verifyToken} , getCourseById)
    app.post('/' , {preHandler : verifyToken} , createCourse)
    app.put('/s' , {preHandler : verifyToken} , softDeleteCourse)
    app.delete('/' , {preHandler : verifyToken} , deleteCourse)
    
}