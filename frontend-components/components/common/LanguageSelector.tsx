'use client'

import React from 'react'
import { Languages } from 'lucide-react'
import { useTranslation, Language } from '@/lib/i18n'

interface LanguageSelectorProps {
  variant?: 'pill' | 'dropdown' | 'inline'
  className?: string
}

export function LanguageSelector({ variant = 'pill', className = '' }: LanguageSelectorProps) {
  const { lang, setLang } = useTranslation()

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-1 rounded-xl bg-[#ecefe9] p-1 ${className}`}>
        <button
          type="button"
          onClick={() => setLang('en')}
          className={`min-h-[44px] min-w-[50px] rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            lang === 'en'
              ? 'bg-white text-[#1e6b38] shadow-sm'
              : 'text-[#566559] hover:text-[#1c2420]'
          }`}
          aria-label="Switch to English"
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLang('hi')}
          className={`min-h-[44px] min-w-[50px] rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            lang === 'hi'
              ? 'bg-white text-[#1e6b38] shadow-sm'
              : 'text-[#566559] hover:text-[#1c2420]'
          }`}
          aria-label="हिन्दी में बदलें"
        >
          हिन्दी
        </button>
      </div>
    )
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border border-[#dce3d8] bg-white p-1 text-xs shadow-sm ${className}`}>
      <span className="flex size-7 items-center justify-center rounded-full bg-[#f1f5ee] text-[#1e6b38]">
        <Languages className="size-3.5" />
      </span>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setLang('en')
        }}
        className={`cursor-pointer relative z-10 min-h-[36px] rounded-full px-3.5 py-1 font-bold transition-all ${
          lang === 'en'
            ? 'bg-[#1e6b38] text-white shadow-xs'
            : 'text-[#5c6c60] hover:bg-[#f3f6f1] active:scale-95'
        }`}
        aria-label="Select English language"
        aria-pressed={lang === 'en'}
      >
        English
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setLang('hi')
        }}
        className={`cursor-pointer relative z-10 min-h-[36px] rounded-full px-3.5 py-1 font-bold transition-all ${
          lang === 'hi'
            ? 'bg-[#1e6b38] text-white shadow-xs'
            : 'text-[#5c6c60] hover:bg-[#f3f6f1] active:scale-95'
        }`}
        aria-label="हिन्दी भाषा चुनें"
        aria-pressed={lang === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  )
}
