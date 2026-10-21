'use client'

import { useEffect } from 'react'

export function PwaRegistrar() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('StockSprint PWA ServiceWorker registered successfully:', reg.scope)
          })
          .catch((err) => {
            console.warn('StockSprint ServiceWorker registration skipped:', err)
          })
      })
    }
  }, [])

  return null
}
