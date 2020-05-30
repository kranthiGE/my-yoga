import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { createLogger } from '../../utils/logger'
import { CreateStudentClassRequest } from '../../requests/createStudentClassRequest'
import { bookAClass } from '../../businessLogic/yogaClasses'

const logger = createLogger('addYogaClass')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const studentRecord: CreateStudentClassRequest = JSON.parse(event.body)
    const item = await bookAClass(studentRecord, event.headers.Authorization)

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
    logger.info('Booked a yoga class successfully')

    return response
}