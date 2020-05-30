import { AppRole } from "../../models/AppRole";
import { AppRoleAccess } from "../dataAccessLayer/appRoleAccess";
import { createLogger } from "../utils/logger";
import { getUserId, fetchJwtTokenFromHeader } from "../utils/common";

/*
    queries:
    - fetch list of users with STUDENT role
    - fetch list of users with TEACHER role
    - what is the role (STUDENT/TEACHER) for a given user id
*/  
const appRoleAccess = new AppRoleAccess()
const logger = createLogger('appRoles')

export async function getUserRole(userId: string): Promise<AppRole[]> {
    logger.info('getUserRole business logic called: ', userId)
    return await appRoleAccess.getUserRole(userId)
}

export async function addUserRole(authHeader: string, roleNumber: number) {
    // get logged-in user id
    const userId = getUserId(fetchJwtTokenFromHeader(authHeader))
    logger.info('userId', {
        userId: userId
    })

    logger.info('adding user role, business logic called: ')
    // insert userId and roleNumber association into dynamodb table 
    const item = {
        roleNumber: roleNumber,
        userId: userId
    }

    return await appRoleAccess.addAppRole(item)
}