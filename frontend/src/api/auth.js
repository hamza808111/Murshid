import client from './client'

export const register = (email, password) =>
  client.post('/api/auth/register', { email, password }).then(r => r.data)

export const login = (email, password) =>
  client.post('/api/auth/login', { email, password }).then(r => r.data)
