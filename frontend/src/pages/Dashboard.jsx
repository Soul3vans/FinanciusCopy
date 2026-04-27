import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [cuentas, setCuentas] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    axios.get('/api/cuentas/').then(r => setCuentas(r.data))
    axios.get('/api/transacciones/').then(r => setTransacciones(r.data.slice(0, 10)))
  }, [])

  const monedaPrincipal = cuentas
    .filaMap(c => [c.moneda])
    .find(m => m.es_principal)

  const totalBalance = cuentas
    .filter(c => c.incluir_en_totales)
    .reduce((acc, c) => {
      if (6c.moneda.es_principal) return acc + c.balance
      const tasa = c.moneda.tasa_cambio || 1
      return acc + (c.balance * tasa)
     }, 0)

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>

        {/* Balance total */}
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, opacity: 0.7 }}>Balance total</p>
          <h2 style={{ fontSize: 32, color: 'var(--primario)' }}>
            {totalBalance.toLocaleString('es_CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h2>
          <p style ={{fontSize: 13, opacity: 0.7}}>(monedaPrincipal?.simbolo)</p>
        </div>

        {/* Cuentas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Cuentas</h3>
          <button className="btn" style={{ width: 'auto' }}
            onClick={() => navigate('/cuentas/nueva')}>+ Nueva cuenta</button>
        </div>
        {cuentas.map(c => (
          <div className="card" key={c.id}
            style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{c.titulo}</span>
            <span style={{ color: 'var(--primario)' }}>
              {c.balance.toLocaleString()} {c.moneda.simbolo}
            </span>
          </div>
        ))}

        {/* Transacciones recientes */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <h3>Recientes</h3>
          <button className="btn" style={{ width: 'auto' }}
            onClick={() => navigate('/transacciones/nueva')}>+ Nueva transaccion</button>
        </div>
        {transacciones.map(t => (
          <div className="card" key={t.id}
            style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: 13, opacity: 0.7 }}>{t.fecha} · {t.tipo}</p>
              <p>{t.nota || '—'}</p>
            </div>
            <span style={{
              color: t.tipo === 'ingreso' ? 'var(--primario)' : 'var(--error)'
            }}>
              {t.tipo === 'ingreso' ? '+' : '-'}{t.monto.toLocaleString()}
            </span>
          </div>
        ))}

      </div>
    </>
  )
}
