import { YogaClassesAccess } from "../dataAccessLayer/yogaClassesAccess";
import { YogaClass } from "../../models/YogaClass";
import { createLogger } from "../utils/logger";
import { getUserId, fetchJwtTokenFromHeader } from "../utils/common";
import { CreateYogaClassRequest } from "../requests/CreateYogaClassRequest";
import { UpdateYogaClassRequest } from "../requests/UpdateYogaClassRequest";
import { getImageUrlAsStoredInS3 } from "./s3Operations";
import * as uuid from 'uuid'
import { StudentYogaClass } from "../../models/StudentYogaClass";
import { CreateStudentClassRequest } from "../requests/createStudentClassRequest";


const classAccess = new YogaClassesAccess()
const logger = createLogger('yogaClasses')

export async function getYogaClasses(authHeader: string): Promise<YogaClass[]> {
    logger.info('getYogaClasses business logic called: ', authHeader)

    // calling a common function to read the header and fetch the token
    // And then the token is decoded and user id is fetched from decoded JWT token
    const userId = getUserId(fetchJwtTokenFromHeader(authHeader))
    
    logger.info('retrieving yoga classes for : ', userId)
    return await classAccess.getAllYogaClasses(userId)
}

export async function getAvailableYogaClassesForStudents(authHeader: string){
    // get all yoga classes: all[]
    // get booked yoga classes: booked[]
    // all[] - booked[] = available[]
    const userId = getUserId(fetchJwtTokenFromHeader(authHeader))

    let yogaClasses: YogaClass[] = await classAccess.getAllYogaClassesByDoneFlag(userId, 0)
    const bookedClasses: StudentYogaClass[] = await classAccess.getClassesByAttendance(userId, 0)

    if(bookedClasses && bookedClasses.length > 0){
        yogaClasses = yogaClasses.filter( (yogaClass) => !(bookedClasses.includes(bookedClasses.find(b => b.classId = yogaClass.classId))))
    }

    return yogaClasses
}

export async function addYogaClass(
    createYogaClassRequest: CreateYogaClassRequest,
    authHeader: string
): Promise<YogaClass> {

    logger.info('addYogaClass lambda called', {
        createYogaClass: createYogaClassRequest
    })

    const classId = uuid.v4()

    // read the optional value and add the attribute only if input is present
    const attachUrl = createYogaClassRequest.attachmentUrl
    logger.info('attachUrl value', {
        attachUrl: attachUrl
    })

    const currentDate = new Date().toISOString();

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(authHeader))
    logger.info('userId', {
        userId: userId
    })

    // format the scheduled date before saving
    // 2019-05-23T12:51:06.006Z to 2019-05-23
    const sdFormatValue = new Date(createYogaClassRequest.scheduleDate)
                            .toISOString()
                            .replace(/T.+/,'')

    const item = {
        createdBy: userId,
        classId: classId,
        name: createYogaClassRequest.name,
        classDescription: createYogaClassRequest.classDescription,
        createdAt: currentDate,
        updatedAt: currentDate,
        scheduleDate: sdFormatValue,
        done: 0,
        attachmentUrl: attachUrl
    }

    logger.debug('Performing put operation', {
        item: JSON.stringify(item)
    })

    return await classAccess.addYogaClass(item)
}

export async function bookAClass(
    createStudentClassRequest: CreateStudentClassRequest,
    authHeader: string
): Promise<StudentYogaClass> {
    logger.info('bookAClass lambda called', {
        createStudentClassRequest: createStudentClassRequest
    })

    const currentDate = new Date().toISOString();

    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(authHeader))
    logger.info('userId', {
        userId: userId
    })

    const item = {
        createdBy: userId,
        classId: userId,
        studentClassId: createStudentClassRequest.classId,
        name: createStudentClassRequest.name,
        classDescription: createStudentClassRequest.classDescription,
        scheduleDate: createStudentClassRequest.scheduleDate,
        done: createStudentClassRequest.done,
        attended: 0,
        attachmentUrl: createStudentClassRequest.attachmentUrl,
        createdAt: currentDate,
        updatedAt: currentDate
    }

    logger.debug('Performing put operation', {
        item: JSON.stringify(item)
    })

    return await classAccess.addStudentToClass(item)
}

export async function deleteAClass(
    classId: string,
    userId: string    
){
    try{
        classAccess.deleteAClass(classId, userId)
    }
    catch(err){
        throw new Error(err)
    }
}

export async function updateYogaClass(
    updateYogaClassRequest: UpdateYogaClassRequest,
    classId: string,
    userId: string
    ){
    
    const item = {
        classId: classId,
        name: updateYogaClassRequest.name,
        scheduleDate: updateYogaClassRequest.scheduleDate,
        done: updateYogaClassRequest.done,
        attachmentUrl: (updateYogaClassRequest.attachmentUrl? updateYogaClassRequest.attachmentUrl : '' ),
        createdAt: updateYogaClassRequest.createdAt,
        updatedAt: updateYogaClassRequest.updatedAt
    }
    try{
        classAccess.updateYogaClass(item,userId)
    }
    catch(err){
        throw new Error(err)
    }
}

export async function updateYogaAttachmentUrl(classId: string, userId: string){
    const attachmentUrl = getImageUrlAsStoredInS3(classId)
    logger.info(`generated image url on s3: ${attachmentUrl}`)
    classAccess.updateYogaClassAttachmentUrl(classId, userId, attachmentUrl)
}

export async function yogaClassIdExist(classId: string, userId: string){
    return !!(await classAccess.isYogaClassExist(classId, userId)).Item
}

export async function completeYogaClassesPastDate(){
     const yogaClasses = await classAccess.getYogaClassesPastDate()
     logger.debug(`fetched past date classes: ${yogaClasses}`)
     classAccess.completeYogaClasses(yogaClasses)
}