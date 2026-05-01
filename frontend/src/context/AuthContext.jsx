import { createContext, useContext, useState } from 'react'
import axios from 'axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))

  // Siempre sincronizar el header con el token actual
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete axios.defaults.headers.common['Authorization']
  }

  const login = async (email, password) => {
    const res = await axios.post('/api/token/', { email, password })
    const accessToken = res.data.access
    setToken(accessToken)
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh', res.data.refresh)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    return res.data
  }

  const logout = async (password) => {
    await axios.post('/api/logout/', { password }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ token, setToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
