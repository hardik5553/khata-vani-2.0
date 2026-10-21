'use client'

import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Package,
  CircleDollarSign,
  ClipboardList,
  Settings,
  ArrowLeft,
  Store,
  Mic,
  Camera,
  CloudUpload,
  RefreshCw,
} from 'lucide-react'
import { LanguageSelector } from '../common/LanguageSelector'
import { OfflineIndicator } from '../common/OfflineIndicator'
import { ThemeToggle } from '../common/ThemeToggle'
import { AndroidDeviceFrame } from './AndroidDeviceFrame'
import { useTranslation } from '@/lib/i18n'
import { ShopProfile, AuthUser } from '@/lib/api/types'
import { syncService, SyncStatusReport } from '@/lib/sync/sync-service'

export type AppView =
  | 'dashboard'
  | 'stock'
  | 'sale'
  | 'stock-in'
  | 'reorder'
  | 'slow-moving'
  | 'reports'
  | 'settings'

interface AppShellProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
  onLogout: () => void
  onOpenVoiceModal?: () => void
  onOpenCameraModal?: () => void
  onOpenSyncModal?: () => void
  user: AuthUser | null
  shop: ShopProfile | null
  children: React.ReactNode
}

export function AppShell({
  currentView,
  onNavigate,
  onLogout,
  onOpenVoiceModal,
  onOpenCameraModal,
  onOpenSyncModal,
  user,
  shop,
  children,
}: AppShellProps) {
  const { t, lang } = useTranslation()
  const [syncStatus, setSyncStatus] = useState<SyncStatusReport>(syncService.getStatusSync())

  useEffect(() => {
    const unsub = syncService.subscribe((s) => setSyncStatus(s))
    return () => unsub()
  }, [])

  const displayShopName = shop?.shopName || 'Apni Dukaan'

  // Dedicated Android Bottom Tabs
  const bottomTabs = [
    {
      id: 'dashboard' as AppView,
      label: lang === 'hi' ? 'मुख्य' : 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'stock' as AppView,
      label: lang === 'hi' ? 'माल' : 'Stock',
      icon: Package,
    },
    {
      id: 'sale' as AppView,
      label: lang === 'hi' ? 'बेचें' : 'Sell',
      icon: CircleDollarSign,
      isPrimaryAction: true,
    },
    {
      id: 'reorder' as AppView,
      label: lang === 'hi' ? 'मंगाएँ' : 'Reorder',
      icon: ClipboardList,
    },
    {
      id: 'settings' as AppView,
      label: lang === 'hi' ? 'सेटिंग्स' : 'Settings',
      icon: Settings,
    },
  ]

  const getViewTitle = (view: AppView): string => {
    switch (view) {
      case 'dashboard':
        return displayShopName
      case 'stock':
        return lang === 'hi' ? 'माल जोड़ें / देखें' : 'Product Inventory'
      case 'sale':
        return lang === 'hi' ? 'माल बेचें (बिलिंग)' : 'Record Sale'
      case 'stock-in':
        return lang === 'hi' ? 'नया माल आया' : 'Stock In (Incoming)'
      case 'reorder':
        return lang === 'hi' ? 'माल मंगवाएँ (कम स्टॉक)' : 'Low Stock & Reorder'
      case 'slow-moving':
        return lang === 'hi' ? 'जो माल नहीं बिक रहा' : 'Slow-Moving Stock'
      case 'reports':
        return lang === 'hi' ? 'बिक्री इतिहास' : 'Sales History'
      case 'settings':
        return lang === 'hi' ? 'ऐप सेटिंग्स' : 'Settings'
      default:
        return 'StockSprint'
    }
  }

  const handleBack = () => {
    if (currentView !== 'dashboard') {
      onNavigate('dashboard')
    }
  }

  return (
    <AndroidDeviceFrame onBackPress={handleBack}>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f7f8f4] dark:bg-[#121614] text-[#1c2420] dark:text-[#e4efe6]">
        {/* 1. Android Top App Bar */}
        <header className="shrink-0 flex items-center justify-between h-14 px-3.5 bg-white dark:bg-[#161c18] border-b border-[#e2e8de] dark:border-[#253228] z-20 shadow-2xs pt-[env(safe-area-inset-top,0px)]">
          {/* Left: Back button or Shop Identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            {currentView !== 'dashboard' ? (
              <button
                type="button"
                onClick={handleBack}
                className="grid size-10 place-items-center rounded-xl hover:bg-black/5 dark:hover:bg-white/10 active:scale-90 transition-transform shrink-0"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="size-5 text-[#1e6b38] dark:text-[#4ade80]" />
              </button>
            ) : (
              <div className="grid size-9 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80] shrink-0">
                <Store className="size-5" />
              </div>
            )}

            <div className="min-w-0 truncate">
              <h1 className="text-sm font-black tracking-tight text-[#1c2420] dark:text-white truncate">
                {getViewTitle(currentView)}
              </h1>
              {currentView === 'dashboard' && (
                <p className="text-[10px] font-semibold text-[#667768] dark:text-[#8ea292] leading-none truncate">
                  {lang === 'hi' ? 'किराना स्टॉक सहायक' : 'Kirana Stock Assistant'}
                </p>
              )}
            </div>
          </div>

          {/* Right: Quick Android Actions (Voice, Sync status, Language toggle) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sync Status Button */}
            {onOpenSyncModal && (
              <button
                type="button"
                onClick={onOpenSyncModal}
                className={`relative grid size-9 place-items-center rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  syncStatus.pendingCount > 0
                    ? 'bg-[#fef3c7] dark:bg-[#382a0b] text-[#b45309] dark:text-[#fbbf24]'
                    : 'bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]'
                }`}
                title={syncStatus.isSyncing ? 'Syncing...' : 'Sync Status'}
              >
                {syncStatus.isSyncing ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : (
                  <CloudUpload className="size-4" />
                )}
                {syncStatus.pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 grid size-4.5 place-items-center rounded-full bg-[#dc2626] text-[9px] font-black text-white">
                    {syncStatus.pendingCount}
                  </span>
                )}
              </button>
            )}

            {/* Voice Assistant Trigger */}
            {onOpenVoiceModal && (
              <button
                type="button"
                onClick={onOpenVoiceModal}
                className="grid size-9 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80] shadow-2xs hover:scale-105 active:scale-90 transition-transform"
                title="Voice Assistant (माइक)"
                aria-label="Voice command assistant"
              >
                <Mic className="size-4.5" />
              </button>
            )}

            {/* Camera Barcode Trigger */}
            {onOpenCameraModal && (
              <button
                type="button"
                onClick={onOpenCameraModal}
                className="grid size-9 place-items-center rounded-xl bg-[#eff6ff] dark:bg-[#16253d] text-[#2563eb] dark:text-[#60a5fa] shadow-2xs hover:scale-105 active:scale-90 transition-transform"
                title="Camera Scanner (कैमरा)"
                aria-label="Camera scanner"
              >
                <Camera className="size-4.5" />
              </button>
            )}

            {/* Language Selector */}
            <LanguageSelector />
          </div>
        </header>

        {/* 2. Scrollable Screen Content */}
        <main className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-20 overscroll-contain">
          {children}
        </main>

        {/* 3. Android Fixed Bottom Navigation Bar (56dp standard height with thumb targets) */}
        <nav
          className="shrink-0 flex items-center justify-around h-16 bg-white dark:bg-[#161c18] border-t border-[#e2e8de] dark:border-[#253228] px-1 z-30 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-2px_10px_rgba(0,0,0,0.05)]"
          role="navigation"
          aria-label="Android Bottom Navigation"
        >
          {bottomTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = currentView === tab.id

            if (tab.isPrimaryAction) {
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onNavigate(tab.id)}
                  className={`flex flex-col items-center justify-center -mt-3.5 size-13 rounded-2xl shadow-md transition-all active:scale-90 ${
                    isActive
                      ? 'bg-[#1e6b38] text-white ring-4 ring-[#1e6b38]/20'
                      : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                  }`}
                  aria-label={tab.label}
                >
                  <Icon className="size-6 stroke-[2.2]" />
                  <span className="text-[9px] font-black mt-0.5">{tab.label}</span>
                </button>
              )
            }

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onNavigate(tab.id)}
                className={`flex flex-1 flex-col items-center justify-center min-h-[48px] rounded-xl py-1 text-[10px] font-bold transition-all active:scale-95 ${
                  isActive
                    ? 'text-[#1e6b38] dark:text-[#4ade80]'
                    : 'text-[#627365] dark:text-[#8ba090] hover:text-[#1c2420] dark:hover:text-white'
                }`}
              >
                <Icon className={`size-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="truncate max-w-[58px] mt-0.5">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>
    </AndroidDeviceFrame>
  )
}
