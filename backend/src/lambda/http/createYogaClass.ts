import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { CreateYogaClassRequest } from '../../requests/CreateYogaClassRequest'
import { addYogaClass } from '../../businessLogic/yogaClasses'

const logger = createLogger('addYogaClass')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const yogaClass: CreateYogaClassRequest = JSON.parse(event.body)
    const item = await addYogaClass(yogaClass, event.headers.Authorization)

    let response;
    response = {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item
        }),
    }
    logger.info('Inserted new item successfully')

    return response
}