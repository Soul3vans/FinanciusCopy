import Navbar from '../components/Navbar'
import { useTema } from '../context/ThemeContext'

const nombresTema = {
  light: '☀️ Claro',
  dark: '🌙 Oscuro',
  moderno: '✨ Moderno',
}

export default function Ajustes() {
  const { tema, setTema, temas } = useTema()

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Ajustes</h2>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>Tema</h3>
          {temas.map(t => (
            <button
              key={t}
              className={`btn ${tema !== t ? 'btn-secundario' : ''}`}
              style={{ marginBottom: 8 }}
              onClick={() => setTema(t)}
            >
              {nombresTema[t]}
              {tema === t && ' ✓'}
            </button>
          ))}
        </div>

      </div>
    </>
  )
}
