'use client'

import React, { useState } from 'react'
import {
  Store,
  Languages,
  Server,
  CheckCircle2,
  Save,
  Globe,
  Sliders,
  Sun,
  Volume2,
  RefreshCw,
  AlertCircle,
  Wifi,
} from 'lucide-react'
import { useTranslation, Language } from '@/lib/i18n'
import { ShopProfile, AuthUser } from '@/lib/api/types'
import { ThemeToggle } from '../common/ThemeToggle'
import { speechService } from '@/lib/voice/speech-service'
import {
  getApiBaseUrl,
  setCustomBackendUrl,
  testBackendHealth,
  isNativeAndroid,
} from '@/lib/api/client'

interface SettingsViewProps {
  user: AuthUser | null
  shop: ShopProfile | null
  onUpdateShop: (updates: Partial<ShopProfile>) => Promise<void>
}

export function SettingsView({ user, shop, onUpdateShop }: SettingsViewProps) {
  const { t, lang, setLang } = useTranslation()

  const [shopName, setShopName] = useState(shop?.shopName || 'Apni Dukaan')
  const [ownerName, setOwnerName] = useState(shop?.ownerName || user?.name || '')
  const [phone, setPhone] = useState(shop?.phone || '')
  const [address, setAddress] = useState(shop?.address || '')
  const [isSaved, setIsSaved] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setIsSaved(false)

    try {
      await onUpdateShop({
        shopName: shopName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        defaultLanguage: lang,
      })
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestSpeech = () => {
    speechService.speak('स्टॉकस्प्रिंट ऑडियो ठीक से काम कर रहा है।', lang)
  }

  const [backendUrl, setBackendUrlState] = useState(() => getApiBaseUrl())
  const [urlInput, setUrlInput] = useState(() => getApiBaseUrl())
  const [isUrlSaved, setIsUrlSaved] = useState(false)
  const [healthStatus, setHealthStatus] = useState<{
    tested: boolean
    testing: boolean
    ok?: boolean
    status?: string
    database?: string
    latencyMs?: number
    error?: string
  }>({ tested: false, testing: false })

  const handleSaveBackendUrl = (e: React.FormEvent) => {
    e.preventDefault()
    setCustomBackendUrl(urlInput)
    const effective = getApiBaseUrl()
    setBackendUrlState(effective)
    setIsUrlSaved(true)
    setTimeout(() => setIsUrlSaved(false), 3000)
  }

  const handleResetBackendUrl = () => {
    setCustomBackendUrl(null)
    const effective = getApiBaseUrl()
    setUrlInput(effective)
    setBackendUrlState(effective)
    setIsUrlSaved(true)
    setTimeout(() => setIsUrlSaved(false), 3000)
  }

  const handleTestBackend = async () => {
    setHealthStatus({ tested: false, testing: true })
    const res = await testBackendHealth(urlInput)
    setHealthStatus({
      tested: true,
      testing: false,
      ok: res.ok,
      status: res.status,
      database: res.database,
      latencyMs: res.latencyMs,
      error: res.error,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#1c2420] dark:text-white sm:text-3xl">
          {t('settingsTitle')}
        </h1>
        <p className="mt-1 text-xs text-[#6a7c6e] dark:text-[#9bb0a0] sm:text-sm">
          {t('settingsSubtitle')}
        </p>
      </div>

      {isSaved && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#bbf7d0] dark:border-[#1d4c2b] bg-[#f0fdf4] dark:bg-[#142618] p-4 text-xs font-bold text-[#166534] dark:text-[#4ade80]">
          <CheckCircle2 className="size-5 shrink-0 text-[#16a34a] dark:text-[#4ade80]" />
          <span>{t('settingsSavedMsg')}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. Shop Details Form */}
        <section className="rounded-3xl border border-[#e2e8de] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-6 shadow-xs sm:p-7">
          <div className="flex items-center gap-2.5 border-b border-[#edf2ea] dark:border-[#28352b] pb-4">
            <div className="grid size-9 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]">
              <Store className="size-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1c2420] dark:text-white">
                {t('sectionShopProfile')}
              </h2>
              <p className="text-[11px] text-[#718274] dark:text-[#8b9e90]">
                Your shop identity shown on bills and invoices
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#3d4d40] dark:text-[#c4d6c7]">
                {t('fieldShopName')}
              </label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] dark:border-[#2e3b32] bg-[#fafbf9] dark:bg-[#161c18] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white dark:focus:bg-[#1a221d] text-[#1c2420] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3d4d40] dark:text-[#c4d6c7]">
                {t('fieldOwnerName')}
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] dark:border-[#2e3b32] bg-[#fafbf9] dark:bg-[#161c18] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white dark:focus:bg-[#1a221d] text-[#1c2420] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3d4d40] dark:text-[#c4d6c7]">
                {t('fieldPhone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g., 9876543210"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] dark:border-[#2e3b32] bg-[#fafbf9] dark:bg-[#161c18] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white dark:focus:bg-[#1a221d] text-[#1c2420] dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3d4d40] dark:text-[#c4d6c7]">
                {t('fieldAddress')}
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                placeholder="Market, City, State"
                className="mt-1.5 w-full rounded-xl border border-[#d8e0d4] dark:border-[#2e3b32] bg-[#fafbf9] dark:bg-[#161c18] p-3 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white dark:focus:bg-[#1a221d] text-[#1c2420] dark:text-white"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#1e6b38] px-6 text-xs font-bold text-white shadow-xs transition hover:bg-[#18552d] disabled:bg-[#a8baa9]"
              >
                <Save className="size-4" />
                <span>{isSubmitting ? 'Saving...' : t('btnSaveSettings')}</span>
              </button>
            </div>
          </form>
        </section>

        {/* 2. Preferences: Theme, Language, Audio & System Status */}
        <div className="space-y-6">
          {/* Theme Preference: Light / Dark / System */}
          <section className="rounded-3xl border border-[#e2e8de] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-6 shadow-xs sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-[#edf2ea] dark:border-[#28352b] pb-4">
              <div className="grid size-9 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]">
                <Sun className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1c2420] dark:text-white">
                  Appearance / थीम
                </h2>
                <p className="text-[11px] text-[#718274] dark:text-[#8b9e90]">
                  Switch between Light, Dark, or System Default
                </p>
              </div>
            </div>

            <div className="mt-4">
              <ThemeToggle variant="segmented" />
            </div>
          </section>

          {/* Language Preference & Audio Test */}
          <section className="rounded-3xl border border-[#e2e8de] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-6 shadow-xs sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-[#edf2ea] dark:border-[#28352b] pb-4">
              <div className="grid size-9 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]">
                <Globe className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1c2420] dark:text-white">
                  {t('sectionPreferences')}
                </h2>
                <p className="text-[11px] text-[#718274] dark:text-[#8b9e90]">
                  {t('fieldLanguage')} & Spoken Guidance
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`flex min-h-[48px] items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all ${
                    lang === 'en'
                      ? 'border-[#1e6b38] bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]'
                      : 'border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] text-[#566559] dark:text-[#9bb0a0] hover:bg-[#f3f6f1]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLang('hi')}
                  className={`flex min-h-[48px] items-center justify-center rounded-xl border p-3 text-xs font-bold transition-all ${
                    lang === 'hi'
                      ? 'border-[#1e6b38] bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]'
                      : 'border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] text-[#566559] dark:text-[#9bb0a0] hover:bg-[#f3f6f1]'
                  }`}
                >
                  हिन्दी (Hindi)
                </button>
              </div>

              {/* Spoken Guidance Audio Test */}
              <div className="flex items-center justify-between rounded-2xl border border-[#dce3d8] dark:border-[#2e3b32] bg-[#f9fbf8] dark:bg-[#161c18] p-3.5">
                <div>
                  <p className="text-xs font-bold text-[#1c2420] dark:text-white">Spoken Guidance Test</p>
                  <p className="text-[11px] text-[#718274] dark:text-[#8b9e90]">Test your phone speaker audio</p>
                </div>
                <button
                  type="button"
                  onClick={handleTestSpeech}
                  className="inline-flex min-h-[38px] items-center gap-1.5 rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] px-3 text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] hover:scale-105 transition-transform"
                >
                  <Volume2 className="size-4" />
                  <span>Test Audio</span>
                </button>
              </div>
            </div>
          </section>

          {/* Authoritative Backend Status & LAN IP Configurator */}
          <section className="rounded-3xl border border-[#e2e8de] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-6 shadow-xs sm:p-7">
            <div className="flex items-center gap-2.5 border-b border-[#edf2ea] dark:border-[#28352b] pb-4">
              <div className="grid size-9 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]">
                <Server className="size-4.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1c2420] dark:text-white">
                  Authoritative FastAPI Backend (सर्वर कनेक्शन)
                </h2>
                <p className="text-[11px] text-[#718274] dark:text-[#8b9e90]">
                  Single persistent SQLite database with SQLAlchemy
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between rounded-xl bg-[#fafbf9] dark:bg-[#161c18] p-3 border border-[#edf2ea] dark:border-[#28352b]">
                <span className="font-semibold text-[#1c2420] dark:text-white">Platform Target:</span>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-[#1e6b38]/10 text-[#1e6b38] dark:text-[#4ade80] font-bold">
                  {typeof window !== 'undefined' && isNativeAndroid()
                    ? 'Android Native (Capacitor APK)'
                    : 'Android Application (Dedicated Mobile UI)'}
                </span>
              </div>

              {/* URL Configuration Form */}
              <form onSubmit={handleSaveBackendUrl} className="space-y-2">
                <label className="block text-xs font-bold text-[#3d4d40] dark:text-[#c4d6c7]">
                  Backend Base URL / IP Address:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="e.g. http://192.168.1.15:8000"
                    className="flex-1 rounded-xl border border-[#dce3d8] dark:border-[#2e3b32] bg-[#f9fbf8] dark:bg-[#161c18] px-3.5 py-2 text-xs font-mono text-[#1c2420] dark:text-white focus:border-[#1e6b38] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[#1e6b38] px-3 py-2 text-xs font-bold text-white hover:bg-[#18572d] transition-colors"
                  >
                    Save URL
                  </button>
                  <button
                    type="button"
                    onClick={handleResetBackendUrl}
                    className="rounded-xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] px-2.5 py-2 text-xs font-bold text-[#566559] dark:text-[#9bb0a0] hover:bg-[#f3f6f1]"
                    title="Reset to default"
                  >
                    Reset
                  </button>
                </div>
                {isUrlSaved && (
                  <p className="text-[11px] text-[#16a34a] font-bold">✓ Backend URL updated successfully!</p>
                )}
                <p className="text-[11px] text-[#788a7b] dark:text-[#7f9583] leading-relaxed">
                  <strong>Android Phone Testing Tip:</strong> On a real phone, do not use <code>localhost</code>. Enter your computer&apos;s Wi-Fi IP address (e.g. <code>http://192.168.1.X:8000</code>).
                </p>
              </form>

              {/* Live Connection Test Button & Status */}
              <div className="pt-2 border-t border-[#edf2ea] dark:border-[#28352b]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1c2420] dark:text-white">Connection Diagnostics:</span>
                  <button
                    type="button"
                    onClick={handleTestBackend}
                    disabled={healthStatus.testing}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] px-3 py-1.5 text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3.5 ${healthStatus.testing ? 'animate-spin' : ''}`} />
                    <span>{healthStatus.testing ? 'Checking...' : 'Test Connection'}</span>
                  </button>
                </div>

                {healthStatus.tested && (
                  <div
                    className={`mt-2.5 rounded-2xl p-3 border text-xs ${
                      healthStatus.ok
                        ? 'border-[#bbf7d0] dark:border-[#1d4c2b] bg-[#f0fdf4] dark:bg-[#142618] text-[#166534] dark:text-[#4ade80]'
                        : 'border-[#fecaca] dark:border-[#4c1d1d] bg-[#fef2f2] dark:bg-[#261414] text-[#991b1b] dark:text-[#f87171]'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold">
                      {healthStatus.ok ? (
                        <>
                          <CheckCircle2 className="size-4 shrink-0 text-[#16a34a]" />
                          <span>Connected to FastAPI Server ({healthStatus.latencyMs}ms)</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="size-4 shrink-0 text-[#dc2626]" />
                          <span>Connection Failed ({healthStatus.status})</span>
                        </>
                      )}
                    </div>
                    {healthStatus.ok ? (
                      <div className="mt-1.5 text-[11px] space-y-0.5 opacity-90">
                        <p>Authoritative Database: <strong>Persistent SQLite ({healthStatus.database})</strong></p>
                        <p>Ready for offline sync & real-time inventory updates.</p>
                      </div>
                    ) : (
                      <div className="mt-1.5 text-[11px] leading-relaxed space-y-1">
                        <p>{healthStatus.error}</p>
                        <p className="font-semibold">Troubleshooting:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Start backend: <code>uvicorn backend.main:app --host 0.0.0.0 --port 8000</code></li>
                          <li>Confirm your phone and PC are connected to the same Wi-Fi.</li>
                          <li>Check Windows Defender Firewall allows incoming connections on port 8000.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
