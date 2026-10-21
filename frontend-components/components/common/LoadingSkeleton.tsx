'use client'

import React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#e5ece1] ${className}`}
      aria-hidden="true"
    />
  )
}

export function MetricSkeleton() {
  return (
    <div className="rounded-2xl border border-[#e2e8de] bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="size-11 rounded-xl" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="mt-5 h-8 w-28" />
      <Skeleton className="mt-2 h-4 w-36" />
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <div className="flex items-center gap-4 border-b border-[#edf2ea] p-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-5 ${i === 0 ? 'w-1/3' : 'flex-1'}`}
        />
      ))}
    </div>
  )
}

export function ListCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-xl border border-[#e5ebe1] bg-white p-3.5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-xl" />
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-1.5 h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}
