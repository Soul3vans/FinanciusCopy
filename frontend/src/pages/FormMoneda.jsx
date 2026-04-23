import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate, useParams } from 'react-router-dom'

export default function FormMoneda() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    simbolo: '', es_principal: false,
    separador_millares: ',', separador_decimal: '.',
    decimales: 2, formato: '0 S', tasa_cambio: 1.0
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) axios.get(`/api/monedas/${id}/`).then(r => setForm(r.data))
  }, [id])

  const guardar = async () => {
    try {
      if (id) await axios.put(`/api/monedas/${id}/`, form)
      else await axios.post('/api/monedas/', form)
      navigate('/monedas')
    } catch {
      setError('Error al guardar')
    }
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2>{id ? 'Editar' : 'Nueva'} Moneda</h2>
        <div className="card">
          <label>Símbolo</label>
          <input value={form.simbolo}
            onChange={e => setForm({ ...form, simbolo: e.target.value })} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0' }}>
            <input type="checkbox" checked={form.es_principal}
              onChange={e => setForm({ ...form, es_principal: e.target.checked })}
              style={{ width: 'auto' }} />
            <label>Moneda principal</label>
          </div>

          <label>Separador de millares</label>
          <select value={form.separador_millares}
            onChange={e => setForm({ ...form, separador_millares: e.target.value })}>
            <option value=",">, Coma</option>
            <option value=".">. Punto</option>
            <option value=" ">Espacio</option>
            <option value="">Vacío</option>
          </select>

          <label>Separador decimal</label>
          <select value={form.separador_decimal}
            onChange={e => setForm({ ...form, separador_decimal: e.target.value })}>
            <option value=".">. Punto</option>
            <option value=",">, Coma</option>
            <option value=" ">Espacio</option>
          </select>

          <label>Decimales</label>
          <select value={form.decimales}
            onChange={e => setForm({ ...form, decimales: parseInt(e.target.value) })}>
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>

          <label>Formato</label>
          <select value={form.formato}
            onChange={e => setForm({ ...form, formato: e.target.value })}>
            <option value="0 S">0 S</option>
            <option value="0S">0S</option>
            <option value="S 0">S 0</option>
            <option value="S0">S0</option>
          </select>

          <label>Tasa de cambio</label>
          <input type="number" step="0.0001" value={form.tasa_cambio}
            onChange={e => setForm({ ...form, tasa_cambio: parseFloat(e.target.value) })} />

          {error && <p className="error">{error}</p>}
          <button className="btn" onClick={guardar}>Guardar</button>
          <button className="btn btn-secundario"
            onClick={() => navigate('/monedas')}>Cancelar</button>
        </div>
      </div>
    </>
  )
}
