'use client'

import React, { useEffect, useState } from 'react'
import { Wifi, WifiOff } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export function OfflineIndicator({ className = '' }: { className?: string }) {
  const [isOnline, setIsOnline] = useState(true)
  const { t } = useTranslation()

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
        isOnline
          ? 'bg-[#eaf4ea] text-[#246b38]'
          : 'bg-[#fff2e3] text-[#ad631b]'
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      {isOnline ? (
        <>
          <Wifi className="size-3.5" />
          <span className="hidden sm:inline">{t('onlineBadge')}</span>
        </>
      ) : (
        <>
          <WifiOff className="size-3.5" />
          <span>{t('offlineBadge')}</span>
        </>
      )}
    </div>
  )
}
