'use client'

import React from 'react'
import {
  PackagePlus,
  CircleDollarSign,
  Truck,
  AlertTriangle,
  Mic,
  Camera,
  Volume2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Package,
  Clock,
} from 'lucide-react'
import { ShelfIllustration } from '../common/ShelfIllustration'
import { EmptyState } from '../common/EmptyState'
import { useTranslation } from '@/lib/i18n'
import { Product, SaleTransaction, ShopProfile, AuthUser } from '@/lib/api/types'
import { AppView } from '../layout/AppShell'
import { speechService } from '@/lib/voice/speech-service'

interface VisualDashboardViewProps {
  onNavigate: (view: AppView) => void
  onOpenVoiceModal: () => void
  onOpenCameraModal: () => void
  products: Product[]
  sales: SaleTransaction[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  user: AuthUser | null
  shop: ShopProfile | null
}

export function VisualDashboardView({
  onNavigate,
  onOpenVoiceModal,
  onOpenCameraModal,
  products,
  sales,
  isLoading,
  error,
  onRetry,
  user,
  shop,
}: VisualDashboardViewProps) {
  const { t, lang } = useTranslation()

  // Real data calculations (zero fake numbers)
  const lowStockProducts = products.filter((p) => p.quantity <= p.reorderLevel)
  const totalProductsCount = products.length

  // Overall shelf status based on real data
  const overallShelfStatus =
    products.length === 0
      ? 'empty'
      : lowStockProducts.length > 0
      ? 'low'
      : 'full'

  const handleSpeakDashboard = () => {
    let msg = `नमस्ते। आपकी दुकान में कुल ${totalProductsCount} प्रोडक्ट हैं। `
    if (lowStockProducts.length > 0) {
      msg += `अलर्ट: ${lowStockProducts.length} सामान का स्टॉक कम है। `
    } else {
      msg += 'सभी सामान पर्याप्त है। '
    }
    msg += 'माल बेचने के लिए नीला बटन दबाएँ, या आवाज़ से काम करने के लिए माइक दबाएँ।'
    speechService.speak(msg, lang)
  }

  return (
    <div className="space-y-6 pb-20">
      {/* 1. Shop Header & Zero-Literacy Audio Spoken Guide */}
      <div className="flex items-center justify-between rounded-3xl border border-[#dce3d8] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-4.5 sm:p-6 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e6b38] dark:text-[#4ade80]">
            {shop?.shopName || 'Apni Dukaan'}
          </span>
          <h1 className="mt-0.5 text-2xl font-black text-[#1c2420] dark:text-white sm:text-3xl">
            {t('greetingMorning')}, {user?.name || t('greetingShopkeeper')}
          </h1>
          <p className="mt-0.5 text-xs text-[#607163] dark:text-[#99ada0]">
            Tap any large card or use microphone below
          </p>
        </div>

        {/* Read aloud guide button */}
        <button
          type="button"
          onClick={handleSpeakDashboard}
          className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80] shadow-xs hover:scale-105 active:scale-95 transition-all"
          title="Listen shop summary out loud"
          aria-label="Speak shop status out loud"
        >
          <Volume2 className="size-6" />
        </button>
      </div>

      {/* 2. Four Massive Visual Action Tiles (Zero-Literacy 64dp Touch Targets) */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
        {/* A. Maal Becho — Sell Goods (Primary Action) */}
        <button
          type="button"
          onClick={() => onNavigate('sale')}
          className="group flex flex-col justify-between min-h-[140px] sm:min-h-[160px] rounded-3xl border-2 border-[#bfdbfe] dark:border-[#1e3a5f] bg-[#eff6ff] dark:bg-[#0f1d2f] p-4.5 sm:p-6 text-left shadow-xs hover:shadow-md hover:border-[#3b82f6] active:scale-98 transition-all"
        >
          <div className="flex items-start justify-between w-full">
            <div className="grid size-14 place-items-center rounded-2xl bg-[#2563eb] text-white shadow-sm">
              <CircleDollarSign className="size-8" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider rounded-full bg-[#dbeafe] dark:bg-[#1e293b] text-[#1d4ed8] dark:text-[#93c5fd] px-2.5 py-0.5">
              1-Tap Sale
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black text-[#1e3a8a] dark:text-[#bfdbfe]">
              माल बेचें
            </h2>
            <p className="text-xs font-bold text-[#2563eb] dark:text-[#93c5fd]">
              Record Sale (बिलिंग)
            </p>
          </div>
        </button>

        {/* B. Maal Jodo — Add Goods (Camera, Voice, or Manual) */}
        <button
          type="button"
          onClick={() => onNavigate('stock')}
          className="group flex flex-col justify-between min-h-[140px] sm:min-h-[160px] rounded-3xl border-2 border-[#bbf7d0] dark:border-[#1e3d25] bg-[#f0fdf4] dark:bg-[#112316] p-4.5 sm:p-6 text-left shadow-xs hover:shadow-md hover:border-[#22c55e] active:scale-98 transition-all"
        >
          <div className="flex items-start justify-between w-full">
            <div className="grid size-14 place-items-center rounded-2xl bg-[#16a34a] text-white shadow-sm">
              <PackagePlus className="size-8" />
            </div>
            <div className="flex gap-1.5">
              <span
                onClick={(e) => {
                  e.stopPropagation()
                  onOpenCameraModal()
                }}
                className="grid size-8 place-items-center rounded-xl bg-white dark:bg-[#1c2420] text-[#16a34a] dark:text-[#4ade80] shadow-2xs hover:scale-105"
                title="Add using Camera"
              >
                <Camera className="size-4" />
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black text-[#14532d] dark:text-[#bbf7d0]">
              माल जोड़ें
            </h2>
            <p className="text-xs font-bold text-[#16a34a] dark:text-[#86efac]">
              Add Product (नया सामान)
            </p>
          </div>
        </button>

        {/* C. Naya Maal Aaya — Stock In (Received Shipments) */}
        <button
          type="button"
          onClick={() => onNavigate('stock-in')}
          className="group flex flex-col justify-between min-h-[140px] sm:min-h-[160px] rounded-3xl border-2 border-[#fef08a] dark:border-[#423910] bg-[#fefce8] dark:bg-[#1e1b09] p-4.5 sm:p-6 text-left shadow-xs hover:shadow-md hover:border-[#eab308] active:scale-98 transition-all"
        >
          <div className="flex items-start justify-between w-full">
            <div className="grid size-14 place-items-center rounded-2xl bg-[#ca8a04] text-white shadow-sm">
              <Truck className="size-8" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider rounded-full bg-[#fef9c3] dark:bg-[#2b250c] text-[#854d0e] dark:text-[#fde047] px-2.5 py-0.5">
              Receive
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black text-[#713f12] dark:text-[#fef08a]">
              नया माल आया
            </h2>
            <p className="text-xs font-bold text-[#a16207] dark:text-[#fde047]">
              Stock In (स्टॉक बढ़ाएँ)
            </p>
          </div>
        </button>

        {/* D. Maal Mangwayein — Low Stock Warnings & Reorder */}
        <button
          type="button"
          onClick={() => onNavigate('reorder')}
          className="group flex flex-col justify-between min-h-[140px] sm:min-h-[160px] rounded-3xl border-2 border-[#fed7aa] dark:border-[#452712] bg-[#fffaf5] dark:bg-[#221308] p-4.5 sm:p-6 text-left shadow-xs hover:shadow-md hover:border-[#f97316] active:scale-98 transition-all"
        >
          <div className="flex items-start justify-between w-full">
            <div className="grid size-14 place-items-center rounded-2xl bg-[#ea580c] text-white shadow-sm">
              <AlertTriangle className="size-8" />
            </div>
            <span className="text-xs font-black rounded-full bg-[#ffedd5] dark:bg-[#381a07] text-[#c2410c] dark:text-[#fdba74] px-2.5 py-0.5">
              {lowStockProducts.length} Items
            </span>
          </div>

          <div className="mt-4">
            <h2 className="text-xl font-black text-[#7c2d12] dark:text-[#fed7aa]">
              माल मंगवाएँ
            </h2>
            <p className="text-xs font-bold text-[#ea580c] dark:text-[#fdba74]">
              Reorder (कम स्टॉक अलर्ट)
            </p>
          </div>
        </button>

        {/* E. Jo Maal Nahi Bik Raha — Slow-Moving / Dead Stock Items */}
        <button
          type="button"
          onClick={() => onNavigate('slow-moving')}
          className="group col-span-2 flex items-center justify-between min-h-[90px] sm:min-h-[100px] rounded-3xl border-2 border-[#e9d5ff] dark:border-[#3b1f50] bg-[#faf5ff] dark:bg-[#1a1024] p-4.5 sm:p-5 text-left shadow-xs hover:shadow-md hover:border-[#a855f7] active:scale-98 transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="grid size-13 place-items-center rounded-2xl bg-[#9333ea] text-white shadow-sm shrink-0">
              <Clock className="size-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-[#581c87] dark:text-[#f3e8ff]">
                  जो माल नहीं बिक रहा
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider rounded-full bg-[#f3e8ff] dark:bg-[#2e1047] text-[#7e22ce] dark:text-[#d8b4fe] px-2 py-0.5">
                  Slow-Moving
                </span>
              </div>
              <p className="text-xs font-semibold text-[#9333ea] dark:text-[#c084fc] mt-0.5">
                फँसा हुआ माल देखें और छूट दें (Dead Stock Action)
              </p>
            </div>
          </div>
          <ChevronRight className="size-5 text-[#9333ea] dark:text-[#c084fc] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3. Overall Visual Shelf Health Illustration */}
      <section className="rounded-3xl border border-[#dce3d8] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#edf2ea] dark:border-[#28352b] pb-3.5">
          <div>
            <h3 className="text-sm font-bold text-[#1c2420] dark:text-white">
              Shelf Status / दुकान की स्थिति
            </h3>
            <p className="text-xs text-[#6e7f70] dark:text-[#8e9f91]">
              Visual stock inspection for shop shelves
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('stock')}
            className="text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] hover:underline flex items-center gap-1"
          >
            <span>View All Stock</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        <div className="mt-4">
          <ShelfIllustration
            status={overallShelfStatus}
            lang={lang}
            label={
              overallShelfStatus === 'full'
                ? 'All Stocked Up! Shelves are healthy'
                : overallShelfStatus === 'low'
                ? `${lowStockProducts.length} items running low`
                : 'No products in catalog yet'
            }
          />
        </div>
      </section>

      {/* 4. Recent Transactions / हाल की बिक्री */}
      <section className="rounded-3xl border border-[#dce3d8] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-4.5 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#edf2ea] dark:border-[#28352b] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-[#eff6ff] dark:bg-[#19273c] text-[#2563eb] dark:text-[#60a5fa]">
              <CircleDollarSign className="size-4" />
            </span>
            <h3 className="text-sm font-bold text-[#1c2420] dark:text-white">
              {lang === 'hi' ? 'आज की बिक्री (Recent Sales)' : 'Recent Sales'}
            </h3>
          </div>
          {sales.length > 0 && (
            <button
              type="button"
              onClick={() => onNavigate('reports')}
              className="text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] hover:underline flex items-center gap-1"
            >
              <span>{lang === 'hi' ? 'सभी देखें' : 'View History'}</span>
              <ChevronRight className="size-3.5" />
            </button>
          )}
        </div>

        <div className="mt-3 divide-y divide-[#edf2ea] dark:divide-[#28352b]">
          {sales.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-xs text-[#718274] dark:text-[#8e9f91]">
                {lang === 'hi' ? 'आज अभी तक कोई बिक्री दर्ज नहीं हुई।' : 'No sales recorded yet today.'}
              </p>
              <button
                type="button"
                onClick={() => onNavigate('sale')}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-xl bg-[#2563eb] px-4 py-2 text-xs font-bold text-white hover:bg-[#1d4ed8] active:scale-95 transition-all"
              >
                + {lang === 'hi' ? 'माल बेचें' : 'Record Sale'}
              </button>
            </div>
          ) : (
            sales.slice(0, 4).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2.5 text-xs">
                <div>
                  <p className="font-bold text-[#1c2420] dark:text-white">{sale.productName}</p>
                  <p className="text-[11px] text-[#6e7f71] dark:text-[#8e9f90]">
                    {sale.quantity} {sale.unit} • {sale.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#16a34a] dark:text-[#4ade80]">
                    +₹{sale.amount.toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 5. Prominent Floating Voice & Camera Actions (Large Android Buttons) */}
      <div className="fixed bottom-20 right-4 z-30 flex flex-col gap-3">
        {/* Camera FAB */}
        <button
          type="button"
          onClick={onOpenCameraModal}
          className="grid size-14 place-items-center rounded-full bg-white dark:bg-[#202923] text-[#1e6b38] dark:text-[#4ade80] shadow-xl border border-[#dce3d8] dark:border-[#2e3b32] hover:scale-105 active:scale-95 transition-all"
          aria-label="Scan or photograph product"
          title="Open camera"
        >
          <Camera className="size-6" />
        </button>

        {/* Microphone FAB */}
        <button
          type="button"
          onClick={onOpenVoiceModal}
          className="grid size-16 place-items-center rounded-full bg-[#1e6b38] text-white shadow-2xl ring-4 ring-[#1e6b38]/20 hover:scale-105 active:scale-95 transition-all"
          aria-label="Speak voice command"
          title="Speak command"
        >
          <Mic className="size-8" />
        </button>
      </div>
    </div>
  )
}
