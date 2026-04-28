import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [cuentas, setCuentas] = useState([])
  const [transacciones, setTransacciones] = useState([])
  const navigate = useNavigate()

  const [error, setError] = useState('')

  useEffect(() => {
    axios.get('/api/cuentas/').then(r => setCuentas(r.data))
.catch(e => setError('Cuentas: ' + e.message))
    axios.get('/api/transacciones/').then(r => setTransacciones(r.data.slice(0, 10)))
.catch(e => setError('Transacciones: ' + e.message)) 
 }, [])

  const monedaPrincipal = cuentas
    .flatMap(c => [c.moneda])
    .find(m => m.es_principal)

  const totalBalance = cuentas
    .filter(c => c.incluir_en_totales)
    .reduce((acc, c) => {
      if (c.moneda.es_principal) return acc + c.balance
      const tasa = c.moneda.tasa_cambio || 1
      return acc + (c.balance * tasa)
     }, 0)

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>

{error && <p style={{ color: 'var(--error)', padding: 16 }}>{error}</p>}
        {/* Balance total */}
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, opacity: 0.7 }}>Balance total</p>
          <h2 style={{ fontSize: 32, color: 'var(--primario)' }}>
            {totalBalance.toLocaleString('es-CL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </h2>
          <p style ={{fontSize: 13, opacity: 0.7}}>{monedaPrincipal?.simbolo}</p>
        </div>

        {/* Cuentas */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>Cuentas</h3>
          <button className="btn" style={{ width: 'auto' }}
            onClick={() => navigate('/cuentas/nueva')}>+ Nueva cuenta</button>
        </div>
        {[...cuentas]
          .sort((a, b) => {
            const aEnPrincipal = a.moneda.es_principal ? a.balance : a.balance * (a.moneda.tasa_cambio || 1)
            const bEnPrincipal = b.moneda.es_principal ? b.balance : b.balance * (b.moneda.tasa_cambio || 1)
            return bEnPrincipal - aEnPrincipal
          })
          .map(c => (
            <div className="card" key={c.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span>{c.titulo}</span>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--primario)' }}>
                  {c.balance.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {c.moneda.simbolo}
                </span>
                {!c.moneda.es_principal && (
                  <p style={{ fontSize: 11, opacity: 0.6, margin: 0 }}>
                    tasa={c.moneda.tasa_cambio?.toFixed(2)} | {(c.balance * c.moneda.tasa_cambio).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {monedaPrincipal?.simbolo}
                   </p>
                )}
              </div>
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
