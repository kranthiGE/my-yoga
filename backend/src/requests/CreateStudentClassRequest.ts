/**
 * Fields in a request to insert student record to a yoga class.
 */
export interface CreateStudentClassRequest {
    studentUserId: string   // student's UserId
    classId: string      // classId
    name: string
    classDescription?: string | null
    scheduleDate: string
    done: number | null
    attended: number
    attachmentUrl?: string | null
    createdAt: string
    updatedAt: string
}