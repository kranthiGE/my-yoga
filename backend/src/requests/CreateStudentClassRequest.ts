/**
 * Fields in a request to insert student record to a yoga class.
 */
export interface CreateStudentClassRequest {
    classId: string
    name: string
    classDescription?: string | null
    scheduleDate: string
    done: number | null
    attended: number
    attachmentUrl?: string | null
    createdAt: string
    updatedAt: string
}