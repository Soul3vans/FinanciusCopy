import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [mostrarLogout, setMostrarLogout] = useState(false)
  const [error, setError] = useState('')

  const handleLogout = async () => {
    try {
      await logout(password)
      navigate('/login')
    } catch {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <>
      <nav>
        <span style={{ color: 'var(--primario)', fontWeight: 'bold' }}>💰 Finanzas</span>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secundario" style={{ width: 'auto' }}
            onClick={() => navigate('/ajustes')}>⚙️</button>
          <button className="btn btn-secundario" style={{ width: 'auto' }}
            onClick={() => setMostrarLogout(true)}>Salir</button>
        </div>
      </nav>

      {mostrarLogout && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 999
        }}>
          <div className="card" style={{ width: 320 }}>
            <h3 style={{ marginBottom: 12 }}>Confirmar cierre</h3>
            <p style={{ fontSize: 13, marginBottom: 12 }}>
              Ingresa tu contraseña para cifrar y cerrar tu base de datos.
            </p>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <p className="error">{error}</p>}
            <button className="btn" onClick={handleLogout}>Cerrar sesión</button>
            <button className="btn btn-secundario"
              onClick={() => setMostrarLogout(false)}>Cancelar</button>
          </div>
        </div>
      )}
    </>
  )
}
