import { Attempt } from '@/types'
import axios from 'axios'
const baseUrl = '/api/exam-attempts'

let token: string | null = null

const setToken = (newToken: string): void => {
  token = `bearer ${newToken}`
}

const start = async (examId: string) => {
  const config = {
    headers: { Authorization: token }
  }

  const response = await axios.post(baseUrl, { examId }, config)
  return response.data
}

const getAll = async (): Promise<Attempt[]> => {
  const response = await axios.get(baseUrl)
  return response.data
}

const getByUser = async (userId: string): Promise<Attempt> => {
  const params = new URLSearchParams({ userId })
  const response = await axios.get(baseUrl, { params })
  return response.data
}

export default { start, setToken, getAll, getByUser }
