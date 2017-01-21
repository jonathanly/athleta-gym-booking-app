import { postAPI } from '../../../api/fetchAPI'

export function validateTrainingSession(values) {
  // Invalid title
  if (values.title.length === 0) {
    return Promise.reject(new Error('Enter valid title'))
  }

  return postAPI('/trainingSessions', values)
}
