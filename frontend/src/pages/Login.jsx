import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async () => {
    setCargando(true)
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch {
      setError('Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 16 }}>
      <div className="card">
        <h2 style={{ marginBottom: 16, color: 'var(--primario)', textAlign: 'center' }}>
          Finanzas
        </h2>

        <input type="email" placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} />

        <input type="password" placeholder="Contraseña"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} />

        {error && <p className="error">{error}</p>}

        <button className="btn" onClick={handleSubmit} disabled={cargando}>
          {cargando ? 'Entrando...' : 'Entrar'}
        </button>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '16px 0', gap: 8 }}>
          <hr style={{ flex: 1, borderColor: 'var(--borde)' }} />
          <span style={{ fontSize: 12, opacity: 0.6 }}>o continúa con</span>
          <hr style={{ flex: 1, borderColor: 'var(--borde)' }} />
        </div>

        {/* OAuth */}
        <a href="/accounts/google/login/?next=/api/oauth-redirect/" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secundario" style={{ marginBottom: 8 }}>
            🔵 Google
          </button>
        </a>
        <a href="/accounts/github/login/" style={{ textDecoration: 'none' }}>
          <button className="btn btn-secundario">
            ⚫ GitHub
          </button>
        </a>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          ¿No tienes cuenta? <Link to="/registro">Registrarse</Link>
        </p>
      </div>
    </div>
  )
}
