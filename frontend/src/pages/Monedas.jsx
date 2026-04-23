import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Monedas() {
  const [monedas, setMonedas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/monedas/').then(r => setMonedas(r.data))
  }, [])

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar moneda?')) return
    await axios.delete(`/api/monedas/${id}/`)
    setMonedas(monedas.filter(m => m.id !== id))
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Monedas</h2>
          <button className="btn" style={{ width: 'auto' }}
            onClick={() => navigate('/monedas/nueva')}>+ Nueva</button>
        </div>
        {monedas.map(m => (
          <div className="card" key={m.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{m.simbolo}
                  {m.es_principal && <span style={{ color: 'var(--primario)' }}> ★</span>}
                </p>
                <p style={{ fontSize: 13, opacity: 0.7 }}>Tasa: {m.tasa_cambio}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-secundario"
                onClick={() => navigate(`/monedas/${m.id}/editar`)}>Editar</button>
              <button className="btn" style={{ background: 'var(--error)' }}
                onClick={() => eliminar(m.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
