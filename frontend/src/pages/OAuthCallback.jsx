import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'

export default function OAuthCallback() {
  const navigate = useNavigate()
  const { setToken } = useAuth()

  useEffect(() => {
    axios.get('/api/oauth-token/', { withCredentials: true })
      .then(r => {
        localStorage.setItem('token', r.data.access)
        localStorage.setItem('refresh', r.data.refresh)
        axios.defaults.headers.common['Authorization'] = `Bearer ${r.data.access}`
        navigate('/')
      })
      .catch(() => navigate('/login'))
  }, [])

  return <p style={{ padding: 32 }}>Iniciando sesión...</p>
}
