'use client'

import React from 'react'
import { Volume2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { speechService } from '@/lib/voice/speech-service'

interface ShelfIllustrationProps {
  status: 'full' | 'low' | 'empty'
  label?: string
  spokenMessage?: string
  lang?: string
  className?: string
}

export function ShelfIllustration({
  status,
  label,
  spokenMessage,
  lang = 'hi',
  className = '',
}: ShelfIllustrationProps) {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation()
    const msg =
      spokenMessage ||
      (status === 'full'
        ? 'स्टॉक पर्याप्त है। सभी अलमारियाँ भरी हैं।'
        : status === 'low'
        ? 'चेतावनी: कुछ सामान का स्टॉक कम हो गया है। नया माल मंगाएँ।'
        : 'अलर्ट: सामान खत्म हो चुका है। तुरंत रीऑर्डर करें।')
    speechService.speak(msg, lang)
  }

  return (
    <div
      className={`relative flex flex-col items-center justify-between rounded-2xl border p-4 transition-all ${
        status === 'full'
          ? 'border-[#cce3d0] dark:border-[#1e3d25] bg-[#f0f9f1] dark:bg-[#132417]'
          : status === 'low'
          ? 'border-[#fed7aa] dark:border-[#452712] bg-[#fffaf5] dark:bg-[#23150b]'
          : 'border-[#fecaca] dark:border-[#4c1d1d] bg-[#fff5f5] dark:bg-[#291212]'
      } ${className}`}
    >
      {/* Audio Playback button for Zero-Literacy shopkeeper */}
      <button
        type="button"
        onClick={handleSpeak}
        className="absolute top-2.5 right-2.5 grid size-9 place-items-center rounded-xl bg-white/90 dark:bg-[#1c2420]/90 text-[#1e6b38] dark:text-[#4ade80] shadow-2xs hover:scale-105 active:scale-95 transition-transform"
        aria-label="Speak status out loud"
        title="Tap to listen"
      >
        <Volume2 className="size-4.5" />
      </button>

      {/* SVG Shelf Illustration */}
      <div className="w-full max-w-[180px] py-2">
        <svg
          viewBox="0 0 200 110"
          className="w-full h-auto drop-shadow-xs"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Wooden / Steel Shelf Structure */}
          <rect
            x="15"
            y="85"
            width="170"
            height="14"
            rx="4"
            className="fill-[#8c7456] dark:fill-[#5c4933]"
          />
          {/* Shelf Support Brackets */}
          <path
            d="M25 99 L25 108 M175 99 L175 108"
            stroke="#63523c"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* ITEM 1 (Left Jar) */}
          <g className={status === 'empty' ? 'opacity-15' : 'opacity-100'}>
            <rect
              x="30"
              y="35"
              width="36"
              height="50"
              rx="6"
              className={
                status === 'empty'
                  ? 'fill-gray-300 dark:fill-gray-700'
                  : 'fill-[#38a169] dark:fill-[#2f855a]'
              }
            />
            {/* Jar Lid */}
            <rect
              x="36"
              y="28"
              width="24"
              height="7"
              rx="2"
              className="fill-[#d69e2e]"
            />
            {/* Jar Label */}
            <rect
              x="34"
              y="52"
              width="28"
              height="16"
              rx="3"
              className="fill-white/80 dark:fill-white/70"
            />
          </g>

          {/* ITEM 2 (Center Box) */}
          <g
            className={
              status === 'full'
                ? 'opacity-100'
                : 'opacity-15'
            }
          >
            <rect
              x="82"
              y="25"
              width="36"
              height="60"
              rx="4"
              className="fill-[#dd6b20] dark:fill-[#c05621]"
            />
            <line
              x1="86"
              y1="40"
              x2="114"
              y2="40"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />
            <line
              x1="86"
              y1="50"
              x2="106"
              y2="50"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeOpacity="0.7"
            />
          </g>

          {/* ITEM 3 (Right Bottle / Container) */}
          <g
            className={
              status === 'full'
                ? 'opacity-100'
                : 'opacity-15'
            }
          >
            <path
              d="M138 45 C138 38 143 32 149 32 L151 32 C157 32 162 38 162 45 L162 85 L138 85 Z"
              className="fill-[#3182ce] dark:fill-[#2b6cb0]"
            />
            <rect
              x="146"
              y="24"
              width="8"
              height="8"
              rx="1.5"
              className="fill-[#e2e8f0]"
            />
          </g>
        </svg>
      </div>

      {/* Visual Status Indicator & Label */}
      <div className="mt-2 flex items-center gap-1.5 text-center">
        {status === 'full' && (
          <>
            <CheckCircle2 className="size-4 text-[#1e6b38] dark:text-[#4ade80]" />
            <span className="text-xs font-bold text-[#1e6b38] dark:text-[#4ade80]">
              {label || 'Shelf Full / भरा हुआ'}
            </span>
          </>
        )}
        {status === 'low' && (
          <>
            <AlertTriangle className="size-4 text-[#ea580c] dark:text-[#fb923c]" />
            <span className="text-xs font-bold text-[#c2410c] dark:text-[#fb923c]">
              {label || 'Shelf Running Low / कम स्टॉक'}
            </span>
          </>
        )}
        {status === 'empty' && (
          <>
            <AlertTriangle className="size-4 text-[#dc2626] dark:text-[#f87171]" />
            <span className="text-xs font-bold text-[#b91c1c] dark:text-[#f87171]">
              {label || 'Empty Shelf / खाली अलमारी'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
