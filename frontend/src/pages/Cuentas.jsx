import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Cuentas() {
  const [cuentas, setCuentas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/cuentas/').then(r => setCuentas(r.data))
  }, [])

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar cuenta?')) return
    await axios.delete(`/api/cuentas/${id}/`)
    setCuentas(cuentas.filter(c => c.id !== id))
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Cuentas</h2>
          <button className="btn" style={{ width: 'auto' }}
            onClick={() => navigate('/cuentas/nueva')}>+ Nueva</button>
        </div>
        {cuentas.map(c => (
          <div className="card" key={c.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontWeight: 'bold' }}>{c.titulo}</p>
                <p style={{ fontSize: 13, opacity: 0.7 }}>{c.moneda.simbolo}</p>
              </div>
              <span style={{ color: 'var(--primario)', fontSize: 18 }}>
                {c.balance.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-secundario"
                onClick={() => navigate(`/cuentas/${c.id}/editar`)}>Editar</button>
              <button className="btn" style={{ background: 'var(--error)' }}
                onClick={() => eliminar(c.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
