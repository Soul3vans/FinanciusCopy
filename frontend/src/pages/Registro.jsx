import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

export default function Registro() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: '', email: '', password: '', password2: ''
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const guardar = async () => {
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden')
      return
    }
    setCargando(true)
    try {
      await axios.post('/api/registro/', form)
      navigate('/login')
    } catch (e) {
      setError(e.response?.data?.error || 'Error al registrarse')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 16 }}>
      <div className="card">
        <h2 style={{ marginBottom: 16, color: 'var(--primario)' }}>Crear cuenta</h2>

        <input placeholder="Nombre"
          value={form.nombre}
          onChange={e => setForm({ ...form, nombre: e.target.value })} />

        <input type="email" placeholder="Email"
          value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} />

        <input type="password" placeholder="Contraseña"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} />

        <input type="password" placeholder="Repetir contraseña"
          value={form.password2}
          onChange={e => setForm({ ...form, password2: e.target.value })} />

        {error && <p className="error">{error}</p>}
        <button className="btn" onClick={guardar} disabled={cargando}>
          {cargando ? 'Creando...' : 'Registrarse'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
          ¿Ya tienes cuenta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
