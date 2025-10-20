import React, { useState } from 'react'
import { register, login } from '../api/auth'

export default function AuthForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const doRegister = async () => {
    try {
      const data = await register(email, password)
      setMessage(`Registered ${data.email} (id=${data.id})`)
    } catch (e) {
      setMessage(e.response?.data || e.message)
    }
  }

  const doLogin = async () => {
    try {
      const data = await login(email, password)
      setMessage(`Logged in ${data.email} (id=${data.id})`)
    } catch (e) {
      setMessage(e.response?.data || e.message)
    }
  }

  return (
    <div className="auth">
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <div className="buttons">
        <button onClick={doRegister}>Register</button>
        <button onClick={doLogin}>Login</button>
      </div>
      <div className="message">{message}</div>
    </div>
  )
}
