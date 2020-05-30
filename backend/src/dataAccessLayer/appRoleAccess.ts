import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { AppRole } from "../../models/AppRole"
import { createLogger } from "../utils/logger"
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('AppRoleAccess')

export class AppRoleAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly appRoleTable = process.env.APP_USER_ROLE_TABLE
    ){}

    async getUserRole(userId: string): Promise<AppRole[]> {
        logger.info(`Fetching User role for ${userId}`)

        const result = await this.docClient.query({
            TableName: this.appRoleTable,
            KeyConditionExpression: 'userId = :uid',
            ExpressionAttributeValues: { 
                ':uid': userId
            }
        }).promise()

        logger.debug(` result = ${result} `)
        const item = result.Items
        return item as AppRole[]
    }

    async addAppRole(appRole: AppRole): Promise<AppRole>{
        logger.info('add user and role association')
        await this.docClient.put({
            TableName: this.appRoleTable,
            Item: appRole
        }).promise()
        
        return appRole
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000',
        convertEmptyValues: true
        })
    }

    return new XAWS.DynamoDB.DocumentClient({convertEmptyValues: true})
}