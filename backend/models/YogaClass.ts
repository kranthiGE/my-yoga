/**
 * Fields in a request to schedule a yoga class.
 */
export interface YogaClass {
    createdBy?: string | null
    classId: string
    studentClassId?: string | null
    name: string
    classDescription?: string | null
    scheduleDate: string
    done: number
    attended?: number | null
    attachmentUrl?: string | null
    createdAt: string
    updatedAt: string
}