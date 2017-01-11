import fetchAPI, { postAPI } from './fetchAPI'

export function signIn({ email, password }) {
    return postAPI('/auth/signin', {
        email,
        password
    })
}

export function signUp({ email, password }) {
    return postAPI('/auth/register', {
        email,
        password
    })
}

export function fetchCurrentUser() {
    return fetchAPI('/auth')
}

export function signOut() {
    return postAPI('/auth/signout')
}
