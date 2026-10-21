'use client'

import React, { useEffect } from 'react'

interface AndroidDeviceFrameProps {
  children: React.ReactNode
  onBackPress?: () => void
}

export function AndroidDeviceFrame({
  children,
  onBackPress,
}: AndroidDeviceFrameProps) {
  // Handle Android back button via popstate
  useEffect(() => {
    const handlePopState = () => {
      if (onBackPress) {
        onBackPress()
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onBackPress])

  return (
    <div className="min-h-screen w-full bg-[#f7f8f4] dark:bg-[#121614] flex justify-center text-[#1c2420] dark:text-[#e4efe6] select-none">
      {/* Full bleed on Android phone, clean mobile view on browser */}
      <div className="w-full sm:max-w-md min-h-screen flex flex-col bg-[#f7f8f4] dark:bg-[#121614] relative sm:border-x sm:border-[#e2e8de] sm:dark:border-[#253228] shadow-sm">
        {children}
      </div>
    </div>
  )
}
