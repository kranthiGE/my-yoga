import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { fetchJwtTokenFromHeader, getUserId } from '../../utils/common'
import { createLogger } from '../../utils/logger'
import { yogaClassIdExist } from '../../businessLogic/yogaClasses'
import { getUploadUrl } from '../../businessLogic/s3Operations'

const logger = createLogger('generateUploadUrl')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('generating upload URL')
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
    
    // fetch upload url and return
    const url = getUploadUrl(classId)

    return {
        statusCode: 201,
        headers: {
        'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
        uploadUrl: url
        })
    }
}