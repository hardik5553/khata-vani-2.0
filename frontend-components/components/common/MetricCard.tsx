'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { Skeleton } from './LoadingSkeleton'

interface MetricCardProps {
  label: string
  value: string | number | null | undefined
  subtitle: string
  icon: LucideIcon
  isLoading?: boolean
  trend?: string
  accentColor?: 'green' | 'amber' | 'blue'
}

export function MetricCard({
  label,
  value,
  subtitle,
  icon: Icon,
  isLoading = false,
  trend,
  accentColor = 'green',
}: MetricCardProps) {
  const colorStyles = {
    green: {
      bg: 'bg-[#eaf4ea]',
      text: 'text-[#1e6b38]',
    },
    amber: {
      bg: 'bg-[#fff3e5]',
      text: 'text-[#c27021]',
    },
    blue: {
      bg: 'bg-[#ebf4ff]',
      text: 'text-[#2563eb]',
    },
  }[accentColor]

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-[#e2e8de] bg-white p-4.5 sm:p-5 shadow-xs transition hover:border-[#cfd8cb]">
      <div className="flex items-start justify-between">
        <div className={`grid size-11 place-items-center rounded-xl ${colorStyles.bg} ${colorStyles.text}`}>
          <Icon className="size-5" />
        </div>
        {trend && (
          <span className="inline-flex items-center rounded-full bg-[#eaf4ea] px-2 py-0.5 text-xs font-bold text-[#1e6b38]">
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#708073]">
          {label}
        </p>
        <div className="mt-1">
          {isLoading ? (
            <Skeleton className="h-8 w-24 my-1" />
          ) : value !== null && value !== undefined ? (
            <p className="text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
              {value}
            </p>
          ) : (
            <p className="text-2xl font-bold text-[#94a397]">—</p>
          )}
        </div>
        <p className="mt-1 text-xs text-[#7d8d80]">{subtitle}</p>
      </div>
    </div>
  )
}
