import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

export default function Monedas() {
  const [monedas, setMonedas] = useState([])
  const [principal, setPrincipal] = useState('')
  const [tasas, setTasas] = useState({})
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [todasMonedas, setTodasMonedas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [mostrarBuscador, setMostrarBuscador] = useState(false)

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

  useEffect(() => {
    cargar()
    axios.get('/api/monedas-mundo/').then(r => setTodasMonedas(r.data))
  }, [])

  const actualizar = async () => {
    setCargando(true)
    setMensaje('')
    try {
      const res = await axios.post('/api/tasas/actualizar/')
      cargar()
      setMensaje(`✓ ${res.data.actualizadas.length} tasas actualizadas`)
    } catch {
      setMensaje('Error al conectar con la API')
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
      setMensaje('✓ Guardado')
      cargar()
    } catch {
      setMensaje('Error al guardar')
    } finally {
      setCargando(false)
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const agregarMoneda = async (simbolo) => {
    try {
      await axios.post('/api/monedas/', {
        simbolo,
        es_principal: false,
        separador_millares: ',',
        separador_decimal: '.',
        decimales: 2,
        formato: 'S0',
        tasa_cambio: 1.0
      })
      cargar()
      setMostrarBuscador(false)
      setBusqueda('')
      setMensaje(`✓ ${simbolo} agregado`)
    } catch {
      setMensaje('Error al agregar moneda')
    }
  }

  const eliminarMoneda = async (id) => {
    if (!confirm('¿Eliminar moneda?')) return
    await axios.delete(`/api/monedas/${id}/`)
    cargar()
  }

  const simbolosActuales = monedas.map(m => m.simbolo)
  const monedasFiltradas = todasMonedas.filter(m =>
    m.simbolo.toLowerCase().includes(busqueda.toLowerCase()) &&
    !simbolosActuales.includes(m.simbolo)
  )

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
              <option key={m.id} value={m.id}>{m.simbolo}</option>
            ))}
          </select>

          <button className="btn btn-secundario" onClick={actualizar}
            disabled={cargando} style={{ marginBottom: 8 }}>
            🔄 {cargando ? 'Actualizando...' : 'Actualizar tasas desde internet'}
          </button>

          <button className="btn btn-secundario"
            onClick={() => setMostrarBuscador(!mostrarBuscador)}
            style={{ marginBottom: 16 }}>
            + Agregar moneda
          </button>

          {mostrarBuscador && (
            <div style={{ marginBottom: 16 }}>
              <input placeholder="Buscar moneda (ej: EUR, CUP...)"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                autoFocus />
              <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--borde)', borderRadius: 8 }}>
                {monedasFiltradas.slice(0, 20).map(m => (
                  <div key={m.simbolo}
                    onClick={() => agregarMoneda(m.simbolo)}
                    style={{ padding: '10px 12px', cursor: 'pointer', borderBottom: '1px solid var(--borde)' }}>
                    {m.simbolo}
                  </div>
                ))}
                {monedasFiltradas.length === 0 && (
                  <p style={{ padding: 12, opacity: 0.6 }}>Sin resultados</p>
                )}
              </div>
            </div>
          )}

          {monedas.filter(m => String(m.id) !== principal).length > 0 && (
            <>
              <h4 style={{ marginBottom: 8 }}>
                Tasas respecto a {monedaPrincipal?.simbolo}
              </h4>
              {monedas.filter(m => String(m.id) !== principal).map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ minWidth: 50, fontWeight: 'bold' }}>{m.simbolo}</span>
                  <input type="number" step="0.0001"
                    value={tasas[m.id] || 1}
                    onChange={e => setTasas({ ...tasas, [m.id]: e.target.value })}
                    style={{ flex: 1 }} />
                  <button onClick={() => eliminarMoneda(m.id)}
                    style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer' }}>
                    🗑
                  </button>
                </div>
              ))}
            </>
          )}

          {mensaje && <p style={{ color: 'var(--primario)', margin: '8px 0', fontSize: 13 }}>{mensaje}</p>}
          <button className="btn" onClick={guardar} disabled={cargando}>
            Guardar cambios
          </button>
        </div>
      </div>
    </>
  )
}
