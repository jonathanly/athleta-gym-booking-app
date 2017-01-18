import decodeJWT from 'jwt-decode'
import fetchAPI, { postAPI } from './fetchAPI'
import { writeToken } from './jwt'

export function signIn({ email, password }) {
  return postAPI('/auth/signin', {
    email,
    password
  })
  .then(json => {
    writeToken(json.token)
    return decodeJWT(json.token)
  })
}

export function signUp({ email, password, firstName, lastName, contactNumber }) {
  return postAPI('/auth/register', {
    email,
    password,
    firstName,
    lastName,
    contactNumber
  })
  .then(json => {
    writeToken(json.token)
    return decodeJWT(json.token)
  })
}

export function fetchCurrentUser() {
  return fetchAPI('/auth')
}

export function signOut() {
  writeToken(null)
  return Promise.resolve(true)
}
