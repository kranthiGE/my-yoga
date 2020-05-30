import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { getAvailableYogaClassesForStudents } from '../../businessLogic/yogaClasses'

const logger = createLogger('getYogaClasses')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('getYogaClasses lambda event started', event)

    const items = await getAvailableYogaClassesForStudents(event.headers.Authorization)

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            items
        })
    }
}