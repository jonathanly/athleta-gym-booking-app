export default function fetchAPI(path, options) {
    return fetch(process.env.REACT_APP_API_URL + path, options)
      .then(response => {
        // Successful
        if (response.ok) {
          // Decode JSON
          return response.json()
        }
        // Error
        else {
          // Client error
          if (response.status >= 400 && response.status < 500) {
            return response.json()
            .then(json => {
              return Promise.reject(json)
            })
          }
          // Server error or redirect
          else {
            // Reject with entire response
            return Promise.reject(response)
          }
        }
      })
}

export function postAPI(path, bodyJSON) {
  return fetchAPI(path, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyJSON)
  })
}

export function patchAPI(path, bodyJSON) {
  return fetchAPI(path, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyJSON)
  })
}
