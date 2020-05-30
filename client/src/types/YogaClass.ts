/**
 * Fields in a request to schedule a yoga class.
 */
export interface YogaClass {
  classId: string
  createdAt: string
  name: string
  classDescription?: string | null
  scheduleDate: string
  done: number
  attachmentUrl?: string | null
}