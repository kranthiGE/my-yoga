import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { UpdateYogaClassRequest } from '../../requests/UpdateYogaClassRequest'
import { yogaClassIdExist, updateYogaClass } from '../../businessLogic/yogaClasses'

const logger = createLogger('updateYogaClass')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const updateYogaClassRequest: UpdateYogaClassRequest = JSON.parse(event.body)
    logger.info(`input object ${updateYogaClassRequest}`)

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
            error: 'Todo item does not exist'
            })
        }
    }

    try{
        updateYogaClass(updateYogaClassRequest, classId, userId)
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