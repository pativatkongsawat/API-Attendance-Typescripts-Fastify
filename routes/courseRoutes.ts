import { FastifyInstance } from 'fastify';
import { verifyToken } from '../middleware/authenMiddleware';
import {getCourseAll ,
        getCourseById,
        createCourseHandler,
        deleteCourseHandler, 
        softDeleteCourseHandler 
} from '../controller/courses/courseController'

export default async function courseRoutes(app : FastifyInstance){

    app.get('/' , {preHandler : verifyToken} , getCourseAll )
    app.get('/by' , {preHandler : verifyToken} , getCourseById)
    app.post('/' , {preHandler : verifyToken} , createCourseHandler)
    app.put('/s' , {preHandler : verifyToken} , softDeleteCourseHandler)
    app.delete('/' , {preHandler : verifyToken} , deleteCourseHandler)
    
}