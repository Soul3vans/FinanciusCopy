import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const temas = {
  light: {
    '--bg': '#ffffff',
    '--bg-card': '#f5f5f5',
    '--texto': '#1a1a1a',
    '--primario': '#4CAF50',
    '--secundario': '#8BC34A',
    '--borde': '#ddd',
    '--error': '#e53935',
  },
  dark: {
    '--bg': '#121212',
    '--bg-card': '#1e1e1e',
    '--texto': '#f0f0f0',
    '--primario': '#8BC34A',
    '--secundario': '#4CAF50',
    '--borde': '#333',
    '--error': '#ef5350',
  },
  moderno: {
    '--bg': '#0f0c29',
    '--bg-card': '#1a1744',
    '--texto': '#e0e0e0',
    '--primario': '#a78bfa',
    '--secundario': '#7c3aed',
    '--borde': '#2d2b55',
    '--error': '#f87171',
  }
}

export function ThemeProvider({ children }) {
  const [tema, setTema] = useState(
    localStorage.getItem('tema') || 'light'
  )

  useEffect(() => {
    const vars = temas[tema]
    Object.entries(vars).forEach(([key, val]) => {
      document.documentElement.style.setProperty(key, val)
    })
    localStorage.setItem('tema', tema)
  }, [tema])

  return (
    <ThemeContext.Provider value={{ tema, setTema, temas: Object.keys(temas) }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTema = () => useContext(ThemeContext)
