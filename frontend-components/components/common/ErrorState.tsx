'use client'

import React from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title,
  description,
  onRetry,
  className = '',
}: ErrorStateProps) {
  const { t } = useTranslation()

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-6 text-center ${className}`}
      role="alert"
    >
      <div className="grid size-12 place-items-center rounded-2xl bg-[#ffedd5] text-[#c2410c]">
        <AlertCircle className="size-6" />
      </div>
      <h3 className="mt-3 text-base font-bold text-[#7c2d12]">
        {title || t('errorTitle')}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-[#9a3412]">
        {description || t('errorDesc')}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#c2410c] px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-[#9a3412] focus-visible:ring-2 focus-visible:ring-[#c2410c] focus-visible:ring-offset-2"
        >
          <RotateCcw className="size-4" />
          {t('retry')}
        </button>
      )}
    </div>
  )
}
