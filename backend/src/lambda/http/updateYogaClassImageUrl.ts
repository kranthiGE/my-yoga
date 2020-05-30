import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { yogaClassIdExist, updateYogaAttachmentUrl } from '../../businessLogic/yogaClasses'

const logger = createLogger('updateYogaClassImage')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    // read the query param for classId
    const classId = event.pathParameters.classId
    logger.debug(`classId ${classId}`)

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(event.headers.Authorization))
    logger.debug(`user id: ${userId}`)
 
     // check if an object exists matching to the name
     const validClassId = await yogaClassIdExist(classId, userId)
 
    if(!validClassId){
        return {
            statusCode: 404,
            headers: {
            'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({
            error: 'Yoga class does not exist'
            })
        }
    }

    try{
        updateYogaAttachmentUrl(classId, userId)
    }
    catch(error){
        return {
            statusCode: 500,
            headers: {
              'Access-Control-Allow-Origin': '*'
            },
            body: "Update failed: " + JSON.stringify(error)
          }
    }

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            message: "Update succeeded"
        })
    }
}