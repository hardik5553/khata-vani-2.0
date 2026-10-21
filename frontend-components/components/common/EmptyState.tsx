'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  iconColorClass?: string
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColorClass = 'bg-[#f1f5ee] text-[#1e6b38]',
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#d8e0d4] bg-white/70 px-6 py-12 text-center backdrop-blur-xs ${className}`}
    >
      <div className={`grid size-14 place-items-center rounded-2xl ${iconColorClass}`}>
        <Icon className="size-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-[#1c2420] sm:text-lg">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[#667669]">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1e6b38] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition hover:bg-[#18552d] focus-visible:ring-2 focus-visible:ring-[#1e6b38] focus-visible:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
