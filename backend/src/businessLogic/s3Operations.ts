import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'

const s3 = new AWS.S3({
    signatureVersion: 'v4'
})

const bucketName = process.env.YOGA_IMAGES_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION
const awsRegion = process.env.YOGA_APP_REGION

const logger = createLogger('S3Operations')

export function getUploadUrl(classId: string) {
    logger.debug(`bucket: ${bucketName}`)
    logger.debug(`urlExpiration: ${urlExpiration}`)

    if(!urlExpiration){
        logger.error('No urlExpiration specified')
        return undefined
    }

    const urlExpirationValue = parseInt(urlExpiration)
    return s3.getSignedUrl('putObject', {
        Bucket: bucketName,
        Key: classId,
        Expires: urlExpirationValue
    })
}

export function getImageUrlAsStoredInS3(classId: string){
    return `https://${bucketName}.s3.${awsRegion}.amazonaws.com/${classId}`
}