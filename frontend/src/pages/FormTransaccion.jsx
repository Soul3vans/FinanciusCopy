import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'

export default function FormTransaccion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cuentas, setCuentas] = useState([])
  const [categorias, setCategorias] = useState([])
  const hoy = new Date().toISOString().split('T')[0]
  const ahora = new Date().toTimeString().slice(0, 5)
  const [form, setForm] = useState({
    tipo: 'gasto', fecha: hoy, hora: ahora,
    cuenta_origen: '', cuenta_destino: '',
    categoria: '', monto: 0, tasa_cambio: 1,
    monto_destino: 0, nota: '',
    confirmada: true, incluir_en_informes: true
  })
  const [actualizando, setActualizando] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/cuentas/').then(r => setCuentas(r.data))
    axios.get('/api/categorias/').then(r => setCategorias(r.data))
    if (id) axios.get(`/api/transacciones/${id}/`).then(r => setForm(r.data))
  }, [id])

  const getCuenta = (cuentaId) =>
    cuentas.find(c => c.id === parseInt(cuentaId))

  const mismaMoneda = () => {
    const o = getCuenta(form.cuenta_origen)
    const d = getCuenta(form.cuenta_destino)
    return o && d && o.moneda.simbolo === d.moneda.simbolo
  }

  const calcularDestino = (monto, tasa) => {
    const resultado = parseFloat(monto) * parseFloat(tasa)
    return isNaN(resultado) ? 0 : parseFloat(resultado.toFixed(4))
  }

  const actualizarTasa = async () => {
    const o = getCuenta(form.cuenta_origen)
    const d = getCuenta(form.cuenta_destino)
    if (!o || !d) return
    setActualizando(true)
    try {
      const res = await axios.get('/api/tasa/', {
        params: { origen: o.moneda.simbolo, destino: d.moneda.simbolo }
      })
      const tasa = res.data.tasa
      const montoDestino = calcularDestino(form.monto, tasa)
      setForm(f => ({ ...f, tasa_cambio: tasa, monto_destino: montoDestino }))
    } catch {
      setError('No se pudo obtener la tasa')
    } finally {
      setActualizando(false)
    }
  }

  // Al cambiar cuenta origen o destino
  useEffect(() => {
    if (form.tipo !== 'transferencia') return
    if (!form.cuenta_origen || !form.cuenta_destino) return
    if (mismaMoneda()) {
      setForm(f => ({ ...f, tasa_cambio: 1, monto_destino: parseFloat(f.monto) || 0 }))
    }
  }, [form.cuenta_origen, form.cuenta_destino])

  const guardar = async () => {
    try {
      const datos = { ...form }
      if (form.tipo !== 'transferencia') {
        datos.cuenta_destino = null
        datos.tasa_cambio = null
        datos.monto_destino = null
      }
      if (form.tipo === 'transferencia') datos.categoria = null
      if (id) await axios.put(`/api/transacciones/${id}/`, datos)
      else await axios.post('/api/transacciones/', datos)
      navigate('/transacciones')
    } catch {
      setError('Error al guardar')
    }
  }

  const cuentaOrigen = getCuenta(form.cuenta_origen)
  const cuentaDestino = getCuenta(form.cuenta_destino)

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2>{id ? 'Editar' : 'Nueva'} Transacción</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--borde)' }}>
          {['gasto', 'ingreso', 'transferencia'].map(t => (
            <button key={t} onClick={() => setForm({ ...form, tipo: t })}
              style={{
                flex: 1, padding: 10, border: 'none', cursor: 'pointer',
                background: form.tipo === t ? 'var(--primario)' : 'var(--bg-card)',
                color: form.tipo === t ? 'white' : 'var(--texto)',
                textTransform: 'uppercase', fontSize: 12
              }}>
              {t}
            </button>
          ))}
        </div>

        <div className="card">
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label>Fecha</label>
              <input type="date" value={form.fecha}
                onChange={e => setForm({ ...form, fecha: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <label>Hora</label>
              <input type="time" value={form.hora}
                onChange={e => setForm({ ...form, hora: e.target.value })} />
            </div>
          </div>

          <label>{form.tipo === 'ingreso' ? 'Hacia cuenta' : 'Cuenta origen'}</label>
          <select value={form.cuenta_origen}
            onChange={e => setForm({ ...form, cuenta_origen: e.target.value })}>
            <option value="">-- Seleccionar --</option>
            {cuentas.map(c => (
              <option key={c.id} value={c.id}>{c.titulo} ({c.moneda.simbolo})</option>
            ))}
          </select>

          {form.tipo === 'transferencia' && (
            <>
              <label>Cuenta destino</label>
              <select value={form.cuenta_destino}
                onChange={e => setForm({ ...form, cuenta_destino: e.target.value })}>
                <option value="">-- Seleccionar --</option>
                {cuentas.map(c => (
                  <option key={c.id} value={c.id}>{c.titulo} ({c.moneda.simbolo})</option>
                ))}
              </select>
            </>
          )}

          {form.tipo !== 'transferencia' && (
            <>
              <label>Categoría</label>
              <select value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}>
                <option value="">-- Sin categoría --</option>
                {categorias.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </>
          )}

          <label>Monto {cuentaOrigen ? `(${cuentaOrigen.moneda.simbolo})` : ''}</label>
          <input type="number" step="0.01" value={form.monto}
            onChange={e => {
              const monto = e.target.value
              const destino = calcularDestino(monto, form.tasa_cambio)
              setForm(f => ({ ...f, monto, monto_destino: destino }))
            }} />

          {/* Sección tasa de cambio — solo si es transferencia con monedas distintas */}
          {form.tipo === 'transferencia' && form.cuenta_origen && form.cuenta_destino && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--borde)' }}>
              {mismaMoneda() ? (
                <p style={{ fontSize: 13, opacity: 0.7 }}>
                  Misma moneda ({cuentaOrigen?.moneda.simbolo}) — sin conversión
                </p>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                    <span>{cuentaOrigen?.moneda.simbolo}</span>
                    <span>→</span>
                    <span>{cuentaDestino?.moneda.simbolo}</span>
                  </div>

                  <label>Tasa de cambio</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" step="0.0001" value={form.tasa_cambio}
                      style={{ flex: 1 }}
                      onChange={e => {
                        const tasa = e.target.value
                        const destino = calcularDestino(form.monto, tasa)
                        setForm(f => ({ ...f, tasa_cambio: tasa, monto_destino: destino }))
                      }} />
                    <button className="btn btn-secundario"
                      style={{ width: 'auto', padding: '0 12px' }}
                      onClick={actualizarTasa} disabled={actualizando}>
                      {actualizando ? '...' : '🔄'}
                    </button>
                  </div>
                </>
              )}

              <p style={{ marginTop: 8, color: 'var(--primario)', fontWeight: 'bold' }}>
                Recibirá: {parseFloat(form.monto_destino).toLocaleString()} {cuentaDestino?.moneda.simbolo}
              </p>
            </div>
          )}

          <label style={{ marginTop: 12 }}>Nota</label>
          <textarea value={form.nota}
            onChange={e => setForm({ ...form, nota: e.target.value })} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <input type="checkbox" checked={form.confirmada}
              onChange={e => setForm({ ...form, confirmada: e.target.checked })}
              style={{ width: 'auto' }} />
            <label>Confirmada</label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <input type="checkbox" checked={form.incluir_en_informes}
              onChange={e => setForm({ ...form, incluir_en_informes: e.target.checked })}
              style={{ width: 'auto' }} />
            <label>Incluir en informes</label>
          </div>

          {error && <p className="error">{error}</p>}
          <button className="btn" onClick={guardar}>Guardar</button>
          <button className="btn btn-secundario"
            onClick={() => navigate('/transacciones')}>Cancelar</button>
        </div>
      </div>
    </>
  )
}
