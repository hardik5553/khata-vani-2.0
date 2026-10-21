'use client'

import React from 'react'
import { Sun, Moon, Laptop } from 'lucide-react'
import { useTheme, Theme } from '@/lib/theme-context'

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'icon'
  className?: string
}

export function ThemeToggle({ variant = 'compact', className = '' }: ThemeToggleProps) {
  const { theme, effectiveTheme, setTheme } = useTheme()

  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center rounded-xl border border-[#dce3d8] dark:border-[#2e3b32] bg-[#f7f9f6] dark:bg-[#161c18] p-1 ${className}`}>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex min-h-[44px] min-w-[70px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            theme === 'light'
              ? 'bg-white text-[#1e6b38] shadow-sm'
              : 'text-[#617364] dark:text-[#9bb0a0] hover:text-[#1c2420] dark:hover:text-white'
          }`}
          aria-label="Light mode"
        >
          <Sun className="size-4 text-[#ea580c]" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex min-h-[44px] min-w-[70px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            theme === 'dark'
              ? 'bg-[#253329] text-[#4ade80] shadow-sm'
              : 'text-[#617364] dark:text-[#9bb0a0] hover:text-[#1c2420] dark:hover:text-white'
          }`}
          aria-label="Dark mode"
        >
          <Moon className="size-4 text-[#60a5fa]" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`flex min-h-[44px] min-w-[70px] items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
            theme === 'system'
              ? 'bg-white dark:bg-[#253329] text-[#1e6b38] dark:text-[#4ade80] shadow-sm'
              : 'text-[#617364] dark:text-[#9bb0a0] hover:text-[#1c2420] dark:hover:text-white'
          }`}
          aria-label="System default theme"
        >
          <Laptop className="size-4 text-[#8a9b8e]" />
          <span>System</span>
        </button>
      </div>
    )
  }

  // Compact toggle: cycles light -> dark -> system
  const handleCycle = () => {
    if (theme === 'light') setTheme('dark')
    else if (theme === 'dark') setTheme('system')
    else setTheme('light')
  }

  return (
    <button
      type="button"
      onClick={handleCycle}
      className={`grid size-11 place-items-center rounded-xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#202923] text-[#3d4e41] dark:text-[#c4d6c7] shadow-2xs hover:bg-[#f3f7f1] dark:hover:bg-[#27332b] active:scale-95 transition-all ${className}`}
      title={`Current: ${theme} (Click to change)`}
      aria-label={`Current theme: ${theme}. Tap to switch theme.`}
    >
      {effectiveTheme === 'dark' ? (
        <Moon className="size-5 text-[#60a5fa]" />
      ) : (
        <Sun className="size-5 text-[#ea580c]" />
      )}
    </button>
  )
}
