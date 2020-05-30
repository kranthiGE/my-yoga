/**
 * Fields in a request to schedule a yoga class.
 */
export interface StudentYogaClass {
    createdBy?: string | null   // student's UserId
    classId: string             // student's UserId
    studentClassId: string      // classId
    name: string
    classDescription?: string | null
    scheduleDate: string
    done: number | null
    attended: number
    attachmentUrl?: string | null
    createdAt: string
    updatedAt: string
}