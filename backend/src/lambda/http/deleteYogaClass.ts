import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { createLogger } from '../../utils/logger'
import { yogaClassIdExist, deleteAClass } from '../../businessLogic/yogaClasses'

const logger = createLogger('deleteYogaClass')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // read the query param for classId
    const classId = event.pathParameters.classId
    logger.info('Delete lambda called', {
        classId: classId
    })

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(event.headers.Authorization))
    logger.debug('Delete lambda called', {
        classId: classId
    })
    // check if an object exists matching to the name
    const validClassId = await yogaClassIdExist(classId, userId)

    if(!validClassId){
        return {
            statusCode: 404,
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
              error: 'Yoga Class does not exist'
            })
          }
    }

    // if exists then delete
    try{
        deleteAClass(classId, userId)
    }
    catch(err){
        return {
            statusCode: 500,
            headers: {
            'Access-Control-Allow-Origin': '*'
            },
            body: "delete failed: " + JSON.stringify(err)
        }
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: "Delete succeeded"
        })
    }
}