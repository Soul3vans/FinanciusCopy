import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'

export default function FormCuenta() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [monedas, setMonedas] = useState([])
  const [form, setForm] = useState({
    titulo: '', moneda_id: '', balance: 0,
    incluir_en_totales: true, mostrar_en_seleccion: true, nota: ''
  })
  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/monedas/').then(r => setMonedas(r.data))
    if (id) {
      axios.get(`/api/cuentas/${id}/`).then(r => {
        const c = r.data
        setForm({
          titulo: c.titulo, moneda_id: c.moneda.id,
          balance: c.balance, incluir_en_totales: c.incluir_en_totales,
          mostrar_en_seleccion: c.mostrar_en_seleccion, nota: c.nota || ''
        })
      })
    }
  }, [id])

  const guardar = async () => {
    try {
      if (id) await axios.put(`/api/cuentas/${id}/`, form)
      else await axios.post('/api/cuentas/', form)
      navigate('/cuentas')
    } catch {
      setError('Error al guardar')
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2>{id ? 'Editar' : 'Nueva'} Cuenta</h2>
        <div className="card">
          <label>Título</label>
          <input value={form.titulo}
            onChange={e => setForm({ ...form, titulo: e.target.value })} />

          <label>Moneda</label>
          <select value={form.moneda_id}
            onChange={e => setForm({ ...form, moneda_id: e.target.value })}>
            <option value="">-- Seleccionar --</option>
            {monedas.map(m => (
              <option key={m.id} value={m.id}>{m.simbolo}</option>
            ))}
          </select>

          <label>Balance inicial</label>
          <input type="number" step="0.01" value={form.balance}
            onChange={e => setForm({ ...form, balance: parseFloat(e.target.value) })} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <input type="checkbox" checked={form.incluir_en_totales}
              onChange={e => setForm({ ...form, incluir_en_totales: e.target.checked })}
              style={{ width: 'auto' }} />
            <label>Incluir en totales</label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <input type="checkbox" checked={form.mostrar_en_seleccion}
              onChange={e => setForm({ ...form, mostrar_en_seleccion: e.target.checked })}
              style={{ width: 'auto' }} />
            <label>Mostrar en selección</label>
          </div>

          <label>Nota</label>
          <textarea value={form.nota}
            onChange={e => setForm({ ...form, nota: e.target.value })} />

          {error && <p className="error">{error}</p>}
          <button className="btn" onClick={guardar}>Guardar</button>
          <button className="btn btn-secundario"
            onClick={() => navigate('/cuentas')}>Cancelar</button>
        </div>
      </div>
    </>
  )
}
