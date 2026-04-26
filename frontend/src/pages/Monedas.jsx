import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const MONEDAS_DISPONIBLES = [
  { simbolo: 'USD', nombre: 'Dólar estadounidense' },
  { simbolo: 'EUR', nombre: 'Euro' },
  { simbolo: 'CLP', nombre: 'Peso chileno' },
  { simbolo: 'CUP', nombre: 'Peso cubano' },
  { simbolo: 'MXN', nombre: 'Peso mexicano' },
  { simbolo: 'GBP', nombre: 'Libra esterlina' },
  { simbolo: 'CAD', nombre: 'Dólar canadiense' },
  { simbolo: 'ARS', nombre: 'Peso argentino' },
  { simbolo: 'BRL', nombre: 'Real brasileño' },
  { simbolo: 'JPY', nombre: 'Yen japonés' },
  { simbolo: 'CNY', nombre: 'Yuan chino' },
]

const NOMBRES = Object.fromEntries(MONEDAS_DISPONIBLES.map(m => [m.simbolo, m.nombre]))

export default function Monedas() {
  const [monedas, setMonedas] = useState([])
  const [principal, setPrincipal] = useState('')
  const [actualizando, setActualizando] = useState({})
  const [mensaje, setMensaje] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [nuevaSimbolo, setNuevaSimbolo] = useState('')
  const [mostrarForm, setMostrarForm] = useState(false)

  const cargar = () => {
    axios.get('/api/monedas/').then(r => {
      setMonedas(r.data)
      const p = r.data.find(m => m.es_principal)
      if (p) setPrincipal(String(p.id))
    })
  }

  useEffect(() => { cargar() }, [])

  const monedaPrincipal = monedas.find(m => String(m.id) === principal)

  const actualizarUna = async (moneda) => {
    if (!monedaPrincipal) return
    setActualizando(a => ({ ...a, [moneda.id]: true }))
    try {
      const res = await axios.get('/api/tasa/', {
        params: { origen: monedaPrincipal.simbolo, destino: moneda.simbolo }
      })
      await axios.patch(`/api/monedas/${moneda.id}/`, { tasa_cambio: res.data.tasa })
      setMensaje(`✓ ${moneda.simbolo} actualizado: ${res.data.tasa}`)
      cargar()
    } catch {
      setMensaje(`Error actualizando ${moneda.simbolo}`)
    } finally {
      setActualizando(a => ({ ...a, [moneda.id]: false }))
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const actualizarTodas = async () => {
    setGuardando(true)
    try {
      const res = await axios.post('/api/tasas/actualizar/')
      setMensaje(`✓ ${res.data.actualizadas.length} tasas actualizadas`)
      cargar()
    } catch {
      setMensaje('Error al actualizar')
    } finally {
      setGuardando(false)
      setTimeout(() => setMensaje(''), 3000)
    }
  }

  const cambiarPrincipal = async (id) => {
    setPrincipal(String(id))
    await axios.patch(`/api/monedas/${id}/`, { es_principal: true })
    cargar()
  }

  const editarTasa = async (moneda, valor) => {
    setMonedas(ms => ms.map(m => m.id === moneda.id ? { ...m, tasa_cambio: valor } : m))
  }

  const guardarTasa = async (moneda) => {
    await axios.patch(`/api/monedas/${moneda.id}/`, { tasa_cambio: parseFloat(moneda.tasa_cambio) })
    setMensaje(`✓ ${moneda.simbolo} guardado`)
    setTimeout(() => setMensaje(''), 2000)
  }

  const agregar = async () => {
    if (!nuevaSimbolo) return
    try {
      await axios.post('/api/monedas/', {
        simbolo: nuevaSimbolo,
        es_principal: false,
        separador_millares: ',',
        separador_decimal: '.',
        decimales: 2,
        formato: 'S0',
        tasa_cambio: 1.0
      })
      setNuevaSimbolo('')
      setMostrarForm(false)
      cargar()
    } catch {
      setMensaje('Error al agregar moneda')
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar moneda?')) return
    await axios.delete(`/api/monedas/${id}/`)
    cargar()
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Monedas</h2>

        <div className="card">
          {/* Moneda principal */}
          <h3 style={{ marginBottom: 8 }}>Moneda principal</h3>
          <select value={principal}
            onChange={e => cambiarPrincipal(e.target.value)}
            style={{ marginBottom: 12 }}>
            {monedas.map(m => (
              <option key={m.id} value={m.id}>
                {m.simbolo} — {NOMBRES[m.simbolo] || m.simbolo}
              </option>
            ))}
          </select>

          {/* Actualizar todas */}
          <button className="btn btn-secundario" onClick={actualizarTodas}
            disabled={guardando} style={{ marginBottom: 16 }}>
            🔄 {guardando ? 'Actualizando...' : 'Actualizar todas las tasas'}
          </button>

          {/* Lista de monedas */}
          <h4 style={{ marginBottom: 8 }}>
            Tasas respecto a {monedaPrincipal?.simbolo}
          </h4>

          {monedas.filter(m => String(m.id) !== principal).map(m => (
            <div key={m.id} className="card" style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontWeight: 'bold' }}>{m.simbolo}</span>
                <span style={{ fontSize: 12, opacity: 0.6 }}>{NOMBRES[m.simbolo] || ''}</span>
                <button onClick={() => eliminar(m.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', fontSize: 16 }}>
                  🗑
                </button>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="number" step="0.0001"
                  value={m.tasa_cambio}
                  onChange={e => editarTasa(m, e.target.value)}
                  onBlur={() => guardarTasa(m)}
                  style={{ flex: 1 }} />
                <button className="btn btn-secundario"
                  style={{ width: 'auto', padding: '0 12px' }}
                  onClick={() => actualizarUna(m)}
                  disabled={actualizando[m.id]}>
                  {actualizando[m.id] ? '...' : '🔄'}
                </button>
              </div>
            </div>
          ))}

          {mensaje && (
            <p style={{ color: 'var(--primario)', fontSize: 13, margin: '8px 0' }}>
              {mensaje}
            </p>
          )}

          {/* Agregar moneda */}
          {mostrarForm ? (
            <div style={{ marginTop: 12 }}>
              <select value={nuevaSimbolo}
                onChange={e => setNuevaSimbolo(e.target.value)}>
                <option value="">-- Seleccionar moneda --</option>
                {MONEDAS_DISPONIBLES
                  .filter(d => !monedas.find(m => m.simbolo === d.simbolo))
                  .map(d => (
                    <option key={d.simbolo} value={d.simbolo}>
                      {d.simbolo} — {d.nombre}
                    </option>
                  ))}
              </select>
              <button className="btn" onClick={agregar} style={{ marginTop: 8 }}>
                Agregar
              </button>
              <button className="btn btn-secundario"
                onClick={() => setMostrarForm(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button className="btn btn-secundario" style={{ marginTop: 12 }}
              onClick={() => setMostrarForm(true)}>
              + Agregar moneda
            </button>
          )}
        </div>
      </div>
    </>
  )
}
