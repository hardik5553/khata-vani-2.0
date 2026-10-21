'use client'

import React, { useState, useEffect } from 'react'
import {
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Wifi,
  WifiOff,
  CloudUpload,
  Layers,
} from 'lucide-react'
import { localDb, SyncQueueItem } from '@/lib/db/indexed-db'
import { syncService, SyncStatusReport } from '@/lib/sync/sync-service'
import { useTranslation } from '@/lib/i18n'

interface SyncStatusModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SyncStatusModal({ isOpen, onClose }: SyncStatusModalProps) {
  const { lang } = useTranslation()
  const [report, setReport] = useState<SyncStatusReport>(syncService.getStatusSync())
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine)
    }

    if (isOpen) {
      loadDetails()
    }

    const unsub = syncService.subscribe((rep) => {
      setReport(rep)
      if (isOpen) loadDetails()
    })

    return () => unsub()
  }, [isOpen])

  const loadDetails = async () => {
    const { items } = await localDb.getSyncQueueStatus()
    setQueueItems(items)
    const detailed = await syncService.getDetailedStatus()
    setReport(detailed)
  }

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncService.triggerSync()
      await loadDetails()
    } finally {
      setIsSyncing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sync status"
        className="w-full max-w-md rounded-3xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[#edf2ea] dark:border-[#28352b] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]">
              <CloudUpload className="size-4.5" />
            </span>
            <span className="text-sm font-black text-[#1c2420] dark:text-white">
              {lang === 'hi' ? 'डेटा सिंक स्थिति' : 'Offline Sync Status'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-[#6b7c6e] hover:bg-[#f1f5ee] dark:hover:bg-[#28352b]"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Current Network & Sync Status Banner */}
        <div className="mt-4 rounded-2xl border p-4 space-y-2 bg-[#f9fbf8] dark:bg-[#161c18] border-[#dce3d8] dark:border-[#28352b]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              {isOnline ? (
                <>
                  <Wifi className="size-4 text-[#16a34a]" />
                  <span className="text-[#166534] dark:text-[#4ade80]">Internet Connected / ऑनलाइन</span>
                </>
              ) : (
                <>
                  <WifiOff className="size-4 text-[#ea580c]" />
                  <span className="text-[#c2410c] dark:text-[#fb923c]">Airplane Mode / ऑफलाइन</span>
                </>
              )}
            </div>

            <span className="text-[11px] font-semibold text-[#6e7f71] dark:text-[#8ba090]">
              {report.lastSyncedAt ? `Last synced: ${report.lastSyncedAt}` : 'Not synced yet'}
            </span>
          </div>

          <p className="text-[11px] leading-relaxed text-[#5a6b5d] dark:text-[#99ad9d]">
            {isOnline
              ? 'All transactions saved locally are automatically synchronized with the server.'
              : 'App is running in Airplane mode. All sales and goods are saved safely on this phone.'}
          </p>
        </div>

        {/* Pending Operations Queue */}
        <div className="mt-4 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between text-xs font-bold text-[#3d4d40] dark:text-[#c4d6c7] mb-2">
            <span>Operations on this Phone ({queueItems.length})</span>
            {report.pendingCount > 0 && (
              <span className="text-[#ea580c] dark:text-[#fb923c] font-black">
                {report.pendingCount} Waiting to Sync
              </span>
            )}
          </div>

          {queueItems.length > 0 ? (
            <div className="space-y-2">
              {queueItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-[#e5ebe1] dark:border-[#28352b] bg-white dark:bg-[#1f2923] p-3 text-xs flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-[#1c2420] dark:text-white capitalize">
                      {item.operationType.replace('_', ' ')}
                    </p>
                    <p className="text-[10px] text-[#718274] dark:text-[#8b9e90] font-mono">
                      {item.idempotencyKey}
                    </p>
                  </div>

                  <div>
                    {item.status === 'synced' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf4ea] dark:bg-[#1a3821] px-2 py-0.5 text-[10px] font-bold text-[#1e6b38] dark:text-[#4ade80]">
                        <CheckCircle2 className="size-3" /> Synced
                      </span>
                    ) : item.status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fef2f2] dark:bg-[#331515] px-2 py-0.5 text-[10px] font-bold text-[#dc2626] dark:text-[#f87171]">
                        <AlertCircle className="size-3" /> Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7ed] dark:bg-[#331c0e] px-2 py-0.5 text-[10px] font-bold text-[#ea580c] dark:text-[#fb923c]">
                        <Clock className="size-3" /> Saved on Phone
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-[#718274] dark:text-[#8ba090]">
              <CheckCircle2 className="mx-auto size-8 text-[#16a34a] mb-2" />
              <p className="font-bold">Queue Empty / सब सिंक है</p>
              <p className="text-[11px] mt-0.5">All local operations are reconciled with the server.</p>
            </div>
          )}
        </div>

        {/* Sync Action Button */}
        <div className="mt-4 pt-3 border-t border-[#edf2ea] dark:border-[#28352b]">
          <button
            type="button"
            disabled={isSyncing || !isOnline}
            onClick={handleManualSync}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1e6b38] text-sm font-bold text-white shadow-xs hover:bg-[#18552d] disabled:opacity-50"
          >
            <RotateCcw className={`size-4.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now / अभी सिंक करें'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
