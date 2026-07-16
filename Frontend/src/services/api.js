import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

export function setAuthToken(token){
  if(token){
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    localStorage.setItem('pdi_token', token)
  }else{
    delete api.defaults.headers.common['Authorization']
    localStorage.removeItem('pdi_token')
  }
}

export function setCurrentUser(user){
  if (user) {
    localStorage.setItem('pdi_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('pdi_user')
  }
}

export function getCurrentUser(){
  try {
    return JSON.parse(localStorage.getItem('pdi_user') || 'null')
  } catch {
    setCurrentUser(null)
    return null
  }
}

export function isAuthenticated(){
  return Boolean(localStorage.getItem('pdi_token'))
}

export function clearSession(){
  setAuthToken(null)
  setCurrentUser(null)
}

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) clearSession()
    return Promise.reject(error)
  }
)

// restore token if exists
const existing = localStorage.getItem('pdi_token')
if(existing) setAuthToken(existing)

export default api
