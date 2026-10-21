'use client'

import React from 'react'
import { Leaf } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

interface BrandLogoProps {
  compact?: boolean
  showTagline?: boolean
  className?: string
}

export function BrandLogo({ compact = false, showTagline = true, className = '' }: BrandLogoProps) {
  const { t } = useTranslation()

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#1e6b38] text-white shadow-sm ring-1 ring-black/5">
        <Leaf className="size-5" />
      </div>
      {!compact && (
        <div className="flex flex-col">
          <div className="flex items-center text-xl font-black tracking-tight text-[#1c2420] dark:text-white">
            <span>Khata</span>
            <span className="text-[#1e6b38] dark:text-[#4ade80] ml-1">Vani</span>
          </div>
          {showTagline && (
            <span className="text-[11px] font-medium tracking-tight text-[#69786c]">
              {t('brandTagline')}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
