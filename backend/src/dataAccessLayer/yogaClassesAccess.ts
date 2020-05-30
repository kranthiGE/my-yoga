import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { YogaClass } from "../../models/YogaClass"
import { createLogger } from '../utils/logger'
import { StudentYogaClass } from '../../models/StudentYogaClass'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('YogaClassesAccess')

export class YogaClassesAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly classesTable = process.env.CLASSES_TABLE,
        private readonly userDateIndex = process.env.USER_DATE_INDEX,
        private readonly scheduleDtIndex = process.env.SCHEDULE_DATE_INDEX,
        private readonly studentClassIndex = process.env.STUDENT_CLASS_INDEX,
        private readonly doneClassIndex = process.env.DONE_CLASS_INDEX
    ){}

    async getAllYogaClasses(userId: string): Promise<YogaClass[]> {
        logger.info('Fetching all Yoga class items')
        // Need to fetch items only based on logged-in user
        const result = await this.docClient.query({
            TableName: this.classesTable,
            IndexName: this.userDateIndex,
            KeyConditionExpression: 'createdBy = :created_by',
            ExpressionAttributeValues: { 
                ':created_by': userId
            },
            ScanIndexForward: false //desc order
        }).promise()

        logger.debug(` result = ${result} `)
        const items = result.Items
        return items as YogaClass[]
    }

    async getYogaClassesPastDate(){
        logger.info('Fetching getYogaClassesPastDate')
        // fetch classId, createdBy for all users filtered by scheduledDate < currentDate and done != true
        // calculate yesterday date
        const d = new Date()
        d.setDate(d.getDate() - 1)
        const yesterdayDate = d.toISOString().replace(/T.+/,'') // format the date to 2020-06-11, YYYY-MM-DD

        logger.info(`date val: ${yesterdayDate}`)

        const result = await this.docClient.query({
            TableName: this.classesTable,
            IndexName: this.scheduleDtIndex,
            KeyConditionExpression: 'scheduleDate = :yesterday_dt',
            ExpressionAttributeValues: { 
                ':yesterday_dt': yesterdayDate
            }
        }).promise()

        logger.debug(` result = ${result} `)
        const items = result.Items
        return items as YogaClass[]
    }

    async getAllYogaClassesByDoneFlag(userId: string, done: number): Promise<YogaClass[]>{
        logger.info('Fetching getAllYogaClassesByDoneFlag')
        const result = await this.docClient.query({
            TableName: this.classesTable,
            IndexName: this.doneClassIndex,
            KeyConditionExpression: 'createdBy = :cb and done = :d',
            ExpressionAttributeValues: { 
                ':cb': userId,
                ':d': done
            }
        }).promise()

        logger.debug(` result = ${result} `)
        const items = result.Items
        return items as YogaClass[]
    }

    //student API
    async getClassesByAttendance(userId: string, isAttended: number): Promise<StudentYogaClass[]> {
        logger.info('Fetching attended Yoga class for a student')
        // Need to fetch items only based on logged-in user
        const result = await this.docClient.query({
            TableName: this.classesTable,
            IndexName: this.studentClassIndex,
            KeyConditionExpression: 'createdBy = :created_by and attended = :at',
            ExpressionAttributeValues: { 
                ':created_by': userId,
                ':at': isAttended
            }
        }).promise()

        logger.debug(` result = ${result} `)
        const items = result.Items
        return items as StudentYogaClass[]
    }

    async addYogaClass(yogaClass: YogaClass): Promise<YogaClass>{
        logger.info('adding a Yoga class')
        await this.docClient.put({
            TableName: this.classesTable,
            Item: yogaClass
        }).promise()
        
        return yogaClass
    }

    // student API
    async addStudentToClass(studentYogaClass: StudentYogaClass): Promise<StudentYogaClass>{
        logger.info('adding a student to a Yoga class')
        await this.docClient.put({
            TableName: this.classesTable,
            Item: studentYogaClass
        }).promise()
        
        return studentYogaClass
    }

    async deleteAClass(classId: string, userId: string){
        logger.info('deleting an item for ', {
            classId: classId,
            userId: userId
        })
        const params = {
            TableName: this.classesTable,
            Key: {
                createdBy: userId,
                classId: classId
            }
        }
        await this.docClient.delete(
            params, function(err, data){
                if(err){
                    logger.error(err)
                    throw new Error(err.message)
                } else {
                    logger.debug('delete succeeded ', {
                        data: data
                    })
                }
            }
        ).promise()

        logger.info('deleted successfully ')
    }

    async isYogaClassExist(classId: string, userId: string){
        logger.info('verify if an item exists with given classId', {
            classId: classId,
            userId: userId
        })
        return await this.docClient
        .get({
            TableName: this.classesTable,
            Key: {
                createdBy: userId,
                classId: classId
            }
        })
        .promise()
    }

    async updateYogaClassAttachmentUrl(classId: string, userId: string, attachmentUrl: string){
        logger.info('in updateYogaClassAttachmentUrl')
        const updatedDate = new Date().toISOString();

        // if exists then update
        const params = {
            TableName: this.classesTable,
            Key: {
                createdBy: userId,
                classId: classId
            },
            UpdateExpression: "set updatedAt = :ud, attachmentUrl = :aurl",
            ExpressionAttributeValues: {
                ":ud": updatedDate,
                ":aurl": attachmentUrl
            },
            ReturnValues: "UPDATED_NEW"
        }
        logger.debug(`params: ${JSON.stringify(params)}`)

        await this.docClient.update(
            params, function(err, data){
                if(err){
                    logger.error(err)
                    throw new Error(err.message)
                } else {
                    logger.debug(`update succeeded: ${data}`)
                }
            }
        ).promise()
        logger.info('updated attachment URL successfully ')

    }

    async updateYogaClass(yogaClass: YogaClass, userId: string){
        logger.info('update an Yoga Class record')
        const updatedDate = new Date().toISOString();
        // if exists then update
        let params = {
            TableName: this.classesTable,
            Key: {
                createdBy: userId,
                classId: yogaClass.classId
            },
            UpdateExpression: "set #className = :n, scheduleDate = :du, done = :d, updatedAt = :ud, attachmentUrl = :aurl",
            ExpressionAttributeValues: {
                ":n": yogaClass.name,
                ":du": yogaClass.scheduleDate,
                ":d": yogaClass.done,
                ":ud": updatedDate,
                ":aurl": yogaClass.attachmentUrl
            },
            ExpressionAttributeNames: {
                "#className": "name"
            },
            ReturnValues: "UPDATED_NEW"
        }
        //check if description value exits then add to params
        if(yogaClass.classDescription){
            params.UpdateExpression.concat(", classDescription = :cd")
            params.ExpressionAttributeValues[":cd"] = yogaClass.classDescription
        }

        logger.debug(`params: ${JSON.stringify(params)}`)

        await this.docClient.update(
            params, function(err, data){
                if(err){
                    logger.error(err)
                    throw new Error(err.message)
                } else {
                    logger.debug(`update succeeded: ${data}`)
                }
            }
        ).promise()
        logger.info('updated successfully ')
    }

    async completeYogaClasses(updateYogaClasses: YogaClass[]){
        updateYogaClasses.forEach(async function(yogaClass){
            const updatedDate = new Date().toISOString();
            // if exists then update
            let params = {
                TableName: process.env.CLASSES_TABLE,
                Key: {
                    createdBy: yogaClass.createdBy,
                    classId: yogaClass.classId
                },
                UpdateExpression: "set done = :d, updatedAt = :ud",
                ExpressionAttributeValues: {
                    ":d": yogaClass.done,
                    ":ud": updatedDate
                },
                ReturnValues: "UPDATED_NEW"
            }

            logger.debug(`params: ${JSON.stringify(params)}`)

            await this.docClient.update(
                params, function(err, data){
                    if(err){
                        logger.error(err)
                        throw new Error(err.message)
                    } else {
                        logger.debug(`update succeeded: ${data}`)
                    }
                }
            ).promise()
            logger.info('updated successfully ')
        })
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