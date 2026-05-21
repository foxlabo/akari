'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'akari-theme'

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const effective = theme === 'system' ? getSystemTheme() : theme
  root.classList.toggle('dark', effective === 'dark')
  root.style.colorScheme = effective
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  // Initial load from localStorage.
  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
    }
  }, [])

  // Apply theme + listen to system changes when in system mode.
  useEffect(() => {
    applyTheme(theme)
    setResolvedTheme(theme === 'system' ? getSystemTheme() : theme)

    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      applyTheme('system')
      setResolvedTheme(getSystemTheme())
    }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next)
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
