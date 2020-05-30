import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { addUserRole } from "../../businessLogic/appRoles"
import { createLogger } from "../../utils/logger"
import { CreateUserRole } from '../../requests/CreateUserRole'

const logger = createLogger('createYogaUser')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const userRole: CreateUserRole = JSON.parse(event.body)
    logger.info(`create Yoga User lambda called: ${userRole.role}`)
    const item = await addUserRole(event.headers.Authorization, userRole.role)

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
    logger.info('Inserted yoga user role successfully')

    return response
}