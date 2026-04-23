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
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/cuentas/').then(r => setCuentas(r.data))
    axios.get('/api/categorias/').then(r => setCategorias(r.data))
    if (id) axios.get(`/api/transacciones/${id}/`).then(r => setForm(r.data))
  }, [id])

  useEffect(() => {
    if (form.tipo === 'transferencia') calcularDestino()
  }, [form.monto, form.tasa_cambio])

  const calcularDestino = () => {
    const resultado = parseFloat(form.monto) * parseFloat(form.tasa_cambio)
    setForm(f => ({ ...f, monto_destino: isNaN(resultado) ? 0 : resultado }))
  }

  const monedaCuenta = (cuentaId) => {
    const c = cuentas.find(c => c.id === parseInt(cuentaId))
    return c ? c.moneda.simbolo : ''
  }

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

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2>{id ? 'Editar' : 'Nueva'} Transacción</h2>

        {/* Tabs tipo */}
        <div style={{ display: 'flex', marginBottom: 16, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--borde)' }}>
          {['gasto', 'ingreso', 'transferencia'].map(t => (
            <button key={t}
              onClick={() => setForm({ ...form, tipo: t })}
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

          <label>{form.tipo === 'gasto' ? 'Cuenta' : form.tipo === 'ingreso' ? 'Hacia cuenta' : 'Cuenta origen'}</label>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, opacity: 0.7, margin: '4px 0' }}>
                <span>{monedaCuenta(form.cuenta_origen)}</span>
                <span>→</span>
                <span>{monedaCuenta(form.cuenta_destino)}</span>
              </div>

              <label>Tasa de cambio</label>
              <input type="number" step="0.0001" value={form.tasa_cambio}
                onChange={e => setForm({ ...form, tasa_cambio: e.target.value })}
                onBlur={calcularDestino} />
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

          <label>Monto {monedaCuenta(form.cuenta_origen) && `(${monedaCuenta(form.cuenta_origen)})`}</label>
          <input type="number" step="0.01" value={form.monto}
            onChange={e => setForm({ ...form, monto: e.target.value })}
            onBlur={calcularDestino} />

          {form.tipo === 'transferencia' && (
            <p style={{ color: 'var(--primario)', margin: '8px 0' }}>
              = {parseFloat(form.monto_destino).toLocaleString()} {monedaCuenta(form.cuenta_destino)}
            </p>
          )}

          <label>Nota</label>
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
