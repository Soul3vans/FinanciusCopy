import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const MONEDAS_INFO = {
  USD: 'Dólar estadounidense',
  EUR: 'Euro',
  CLP: 'Peso chileno',
  CUP: 'Peso cubano',
  MXN: 'Peso mexicano',
  GBP: 'Libra esterlina',
}

export default function Monedas() {
  const [monedas, setMonedas] = useState([])
  const [principal, setPrincipal] = useState('')
  const [tasas, setTasas] = useState({})
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  const cargar = () => {
    axios.get('/api/monedas/').then(r => {
      setMonedas(r.data)
      const p = r.data.find(m => m.es_principal)
      if (p) setPrincipal(String(p.id))
      const t = {}
      r.data.forEach(m => t[m.id] = m.tasa_cambio)
      setTasas(t)
    })
  }

  useEffect(() => { cargar() }, [])

  const actualizar = async () => {
    setCargando(true)
    setMensaje('')
    try {
      const res = await axios.post('/api/tasas/actualizar/')
      cargar()
      setMensaje(`✓ ${res.data.actualizadas.length} tasas actualizadas desde internet`)
    } catch {
      setMensaje('Error al conectar con la API de tasas')
    } finally {
      setCargando(false)
    }
  }

  const guardar = async () => {
    setCargando(true)
    try {
      for (const m of monedas) {
        await axios.patch(`/api/monedas/${m.id}/`, {
          es_principal: String(m.id) === principal,
          tasa_cambio: parseFloat(tasas[m.id]) || 1.0
        })
      }
      setMensaje('✓ Guardado correctamente')
      cargar()
    } catch {
      setMensaje('Error al guardar')
    } finally {
      setCargando(false)
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const monedaPrincipal = monedas.find(m => String(m.id) === principal)

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Monedas</h2>

        <div className="card">
          <label>Moneda principal</label>
          <select value={principal}
            onChange={e => setPrincipal(e.target.value)}
            style={{ marginBottom: 12 }}>
            {monedas.map(m => (
              <option key={m.id} value={m.id}>
                {m.simbolo} — {MONEDAS_INFO[m.simbolo] || m.simbolo}
              </option>
            ))}
          </select>

          <button className="btn btn-secundario" onClick={actualizar} disabled={cargando}
            style={{ marginBottom: 16 }}>
            🔄 {cargando ? 'Actualizando...' : 'Actualizar tasas desde internet'}
          </button>

          {monedas.filter(m => String(m.id) !== principal).length > 0 && (
            <>
              <h4 style={{ marginBottom: 8 }}>
                Tasas respecto a {monedaPrincipal?.simbolo}
              </h4>
              {monedas.filter(m => String(m.id) !== principal).map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ minWidth: 50, fontWeight: 'bold' }}>{m.simbolo}</span>
                  <input
                    type="number" step="0.0001"
                    value={tasas[m.id] || 1}
                    onChange={e => setTasas({ ...tasas, [m.id]: e.target.value })}
                    style={{ flex: 1 }}
                  />
                </div>
              ))}
            </>
          )}

          {mensaje && (
            <p style={{ color: 'var(--primario)', margin: '8px 0', fontSize: 13 }}>
              {mensaje}
            </p>
          )}
          <button className="btn" onClick={guardar} disabled={cargando}>
            Guardar cambios
          </button>
        </div>
      </div>
    </>
  )
}
