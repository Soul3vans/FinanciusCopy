import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useTema } from '../context/ThemeContext'
import axios from 'axios'

const nombresTema = {
  light: '☀️ Claro',
  dark: '🌙 Oscuro',
  moderno: '✨ Moderno',
}

const MONEDAS_INFO = {
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  CLP: 'Peso chileno',
  CUP: 'Peso cubano',
  MXN: 'Peso mexicano',
  GBP: 'Libra esterlina',
}

export default function Ajustes() {
  const { tema, setTema, temas } = useTema()
  const [monedas, setMonedas] = useState([])
  const [principal, setPrincipal] = useState(null)
  const [tasas, setTasas] = useState({})
  const [guardando, setGuardando] = useState(false)
  const [ok, setOk] = useState('')

  useEffect(() => {
    axios.get('/api/monedas/').then(r => {
      setMonedas(r.data)
      const p = r.data.find(m => m.es_principal)
      if (p) setPrincipal(p.id)
      const t = {}
      r.data.forEach(m => t[m.id] = m.tasa_cambio)
      setTasas(t)
    })
  }, [])

  const guardarMonedas = async () => {
    setGuardando(true)
    try {
      for (const m of monedas) {
        await axios.patch(`/api/monedas/${m.id}/`, {
          es_principal: m.id === parseInt(principal),
          tasa_cambio: parseFloat(tasas[m.id]) || 1.0
        })
      }
      setOk('Guardado correctamente')
      setTimeout(() => setOk(''), 3000)
    } catch {
      setOk('Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Ajustes</h2>

        {/* Tema */}
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

        {/* Monedas */}
        <div className="card" style={{ marginTop: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Monedas</h3>

          <label>Moneda principal</label>
          <select value={principal || ''}
            onChange={e => setPrincipal(e.target.value)}
            style={{ marginBottom: 16 }}>
            {monedas.map(m => (
              <option key={m.id} value={m.id}>
                {m.simbolo} — {MONEDAS_INFO[m.simbolo] || m.simbolo}
              </option>
            ))}
          </select>

          <h4 style={{ marginBottom: 8 }}>Tasas de cambio</h4>
          {monedas.filter(m => m.id !== parseInt(principal)).map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ minWidth: 50, fontWeight: 'bold' }}>{m.simbolo}</span>
              <input
                type="number"
                step="0.0001"
                value={tasas[m.id] || 1}
                onChange={e => setTasas({ ...tasas, [m.id]: e.target.value })}
                style={{ flex: 1 }}
              />
            </div>
          ))}

          {ok && <p style={{ color: 'var(--primario)', margin: '8px 0' }}>{ok}</p>}
          <button className="btn" onClick={guardarMonedas} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>

      </div>
    </>
  )
}
