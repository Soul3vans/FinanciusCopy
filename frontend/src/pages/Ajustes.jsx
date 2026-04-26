import Navbar from '../components/Navbar'
import { useTema } from '../context/ThemeContext'
import { useNavigate } from 'react-router-dom'

const nombresTema = {
  light: '☀️ Claro',
  dark: '🌙 Oscuro',
  moderno: '✨ Moderno',
}

export default function Ajustes() {
  const { tema, setTema, temas } = useTema()
  const navigate = useNavigate()

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Ajustes</h2>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Tema</h3>
          {temas.map(t => (
            <button key={t}
              className={`btn ${tema !== t ? 'btn-secundario' : ''}`}
              style={{ marginBottom: 8 }}
              onClick={() => setTema(t)}>
              {nombresTema[t]}{tema === t && ' ✓'}
            </button>
          ))}
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Finanzas</h3>
          <button className="btn" onClick={() => navigate('/monedas')}>
            💱 Gestionar Monedas
          </button>
        </div>
      </div>
    </>
  )
}
