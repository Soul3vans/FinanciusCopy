import { useEffect, useState } from 'react'
import axios from 'axios'
import Navbar from '../components/Navbar'

const COLORES = ['#4CAF50','#2196F3','#FF5722','#9C27B0','#FF9800','#00BCD4','#E91E63','#607D8B']

function SubCategoria({ cat, onEditar, onEliminar, onAgregarSub }) {
  return (
    <div style={{ marginLeft: 16, borderLeft: '2px solid var(--borde)', paddingLeft: 12 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color }} />
          <span style={{ fontSize: 14 }}>{cat.nombre}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-secundario" style={{ width: 'auto', padding: '2px 8px', fontSize: 12 }}
            onClick={() => onAgregarSub(cat)}>+</button>
          <button className="btn btn-secundario" style={{ width: 'auto', padding: '2px 8px' }}
            onClick={() => onEditar(cat)}>✏️</button>
          <button onClick={() => onEliminar(cat.id)}
            style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>
            🗑
          </button>
        </div>
      </div>
      {cat.subcategorias?.map(sub => (
        <SubCategoria key={sub.id} cat={sub}
          onEditar={onEditar} onEliminar={onEliminar} onAgregarSub={onAgregarSub} />
      ))}
    </div>
  )
}

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [form, setForm] = useState({ nombre: '', color: '#4CAF50', padre: '' })
  const [editando, setEditando] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const cargar = () => axios.get('/api/categorias/').then(r => setCategorias(r.data))

  useEffect(() => { cargar() }, [])

  // Solo categorías raíz (sin padre)
  const raices = categorias.filter(c => !c.padre)

  // Lista plana para el selector de padre
  const todasParaPadre = categorias.filter(c => c.id !== editando)

  const guardar = async () => {
    try {
      const datos = {
        nombre: form.nombre,
        color: form.color,
        padre: form.padre || null
      }
      if (editando) {
        await axios.put(`/api/categorias/${editando}/`, datos)
        setEditando(null)
      } else {
        await axios.post('/api/categorias/', datos)
      }
      setForm({ nombre: '', color: '#4CAF50', padre: '' })
      setMensaje('✓ Guardado')
      cargar()
      setTimeout(() => setMensaje(''), 2000)
    } catch {
      setMensaje('Error al guardar')
    }
  }

  const editar = (cat) => {
    setEditando(cat.id)
    setForm({ nombre: cat.nombre, color: cat.color, padre: cat.padre || '' })
    window.scrollTo(0, 0)
  }

  const agregarSub = (cat) => {
    setEditando(null)
    setForm({ nombre: '', color: cat.color, padre: cat.id })
    window.scrollTo(0, 0)
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar categoría y sus subcategorías?')) return
    await axios.delete(`/api/categorias/${id}/`)
    cargar()
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 16 }}>Categorías</h2>

        <div className="card">
          <h3 style={{ marginBottom: 12 }}>{editando ? 'Editar' : 'Nueva'} categoría</h3>

          <label>Nombre</label>
          <input value={form.nombre}
            onChange={e => setForm({ ...form, nombre: e.target.value })}
            placeholder="Ej: Alimentación" />

          <label style={{ marginTop: 8 }}>Subcategoría de</label>
          <select value={form.padre}
            onChange={e => setForm({ ...form, padre: e.target.value })}>
            <option value="">— Ninguna (categoría principal) —</option>
            {todasParaPadre.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          <label style={{ marginTop: 8 }}>Color</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '8px 0' }}>
            {COLORES.map(c => (
              <div key={c} onClick={() => setForm({ ...form, color: c })}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: c, cursor: 'pointer',
                  border: form.color === c ? '3px solid white' : '3px solid transparent'
                }} />
            ))}
          </div>

          {mensaje && <p style={{ color: 'var(--primario)', fontSize: 13 }}>{mensaje}</p>}
          <button className="btn" onClick={guardar}>
            {editando ? 'Actualizar' : 'Agregar'}
          </button>
          {editando && (
            <button className="btn btn-secundario"
              onClick={() => { setEditando(null); setForm({ nombre: '', color: '#4CAF50', padre: '' }) }}>
              Cancelar
            </button>
          )}
        </div>

        <div style={{ marginTop: 16 }}>
          {raices.map(cat => (
            <div key={cat.id}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: cat.color }} />
                  <span style={{ fontWeight: 'bold' }}>{cat.nombre}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secundario" style={{ width: 'auto', padding: '4px 10px', fontSize: 12 }}
                    onClick={() => agregarSub(cat)}>+ Sub</button>
                  <button className="btn btn-secundario" style={{ width: 'auto', padding: '4px 10px' }}
                    onClick={() => editar(cat)}>✏️</button>
                  <button onClick={() => eliminar(cat.id)}
                    style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
                    🗑
                  </button>
                </div>
              </div>
              {cat.subcategorias?.map(sub => (
                <SubCategoria key={sub.id} cat={sub}
                  onEditar={editar} onEliminar={eliminar} onAgregarSub={agregarSub} />
              ))}
            </div>
          ))}
          {raices.length === 0 && (
            <p style={{ opacity: 0.6, textAlign: 'center', marginTop: 16 }}>No hay categorías</p>
          )}
        </div>
      </div>
    </>
  )
}
