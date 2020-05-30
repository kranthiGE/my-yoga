/**
 * Fields in a request to schedule a yoga class.
 */
export interface CreateYogaClassRequest {
    classId: string
    name: string
    classDescription: string
    scheduleDate: string
    done: number
    attachmentUrl: string | null
    createdAt: string
    updatedAt: string
}