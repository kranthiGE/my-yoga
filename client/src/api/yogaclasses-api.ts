import { apiEndpoint } from '../config'
import { YogaClass } from '../types/YogaClass';
import { CreateYogaClassRequest } from '../types/CreateYogaClassRequest';
import Axios from 'axios'
import { UpdateYogaClassRequest } from '../types/UpdateYogaClassRequest';

export async function getYogaClasses(idToken: string): Promise<YogaClass[]> {
  console.log('Fetching Yoga classes added by you')

  const response = await Axios.get(`${apiEndpoint}/yogaclass`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('yogaclasses:', response.data)
  return response.data.items
}

export async function createYogaClass(
  idToken: string,
  newYogaClass: CreateYogaClassRequest
): Promise<YogaClass> {
  const response = await Axios.post(`${apiEndpoint}/yogaclass`,  JSON.stringify(newYogaClass), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchYogaClass(
  idToken: string,
  classId: string,
  updatedYogaClassRequest: UpdateYogaClassRequest
): Promise<void> {
  await Axios.put(`${apiEndpoint}/yogaclass/${classId}`, JSON.stringify(updatedYogaClassRequest), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function putYogaClassImage(
  idToken: string,
  classId: string
): Promise<void> {
  await Axios.post(`${apiEndpoint}/yogaclass/image/${classId}`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteYogaClass(
  idToken: string,
  classId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/yogaclass/${classId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  classId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/yogaclass/${classId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}
