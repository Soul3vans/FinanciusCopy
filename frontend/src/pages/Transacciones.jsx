import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Transacciones() {
  const [transacciones, setTransacciones] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/transacciones/').then(r => setTransacciones(r.data))
  }, [])

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar transacción?')) return
    await axios.delete(`/api/transacciones/${id}/`)
    setTransacciones(transacciones.filter(t => t.id !== id))
  }

  const colorTipo = (tipo) => {
    if (tipo === 'ingreso') return 'var(--primario)'
    if (tipo === 'gasto') return 'var(--error)'
    return 'var(--texto)'
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Transacciones</h2>
          <button className="btn" style={{ width: 'auto' }}
            onClick={() => navigate('/transacciones/nueva')}>+ Nueva</button>
        </div>
        {transacciones.map(t => (
          <div className="card" key={t.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontSize: 12, opacity: 0.6 }}>{t.fecha} {t.hora}</p>
                <p style={{ fontWeight: 'bold', color: colorTipo(t.tipo) }}>
                  {t.tipo.toUpperCase()}
                </p>
                {t.nota && <p style={{ fontSize: 13 }}>{t.nota}</p>}
              </div>
              <span style={{ color: colorTipo(t.tipo), fontSize: 18 }}>
                {t.tipo === 'ingreso' ? '+' : '-'}{t.monto.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-secundario"
                onClick={() => navigate(`/transacciones/${t.id}/editar`)}>Editar</button>
              <button className="btn" style={{ background: 'var(--error)' }}
                onClick={() => eliminar(t.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
