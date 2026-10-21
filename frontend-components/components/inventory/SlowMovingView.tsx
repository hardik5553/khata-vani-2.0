'use client'

import React, { useState, useEffect } from 'react'
import {
  Clock,
  Package,
  AlertCircle,
  Tag,
  CheckCircle2,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { TableRowSkeleton } from '../common/LoadingSkeleton'
import { useTranslation } from '@/lib/i18n'
import { offlineInventory } from '@/lib/db/indexed-db'
import { Product } from '@/lib/api/types'

interface SlowMovingItem {
  product: Product
  unitsSold: number
  lastSaleDate?: string
  daysSinceLastSale?: number
}

interface SlowMovingViewProps {
  onRecordSaleQuick: (product: Product) => void
}

export function SlowMovingView({ onRecordSaleQuick }: SlowMovingViewProps) {
  const { t, lang } = useTranslation()
  const [windowDays, setWindowDays] = useState<number>(14)
  const [items, setItems] = useState<SlowMovingItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadSlowMoving()
  }, [windowDays])

  const loadSlowMoving = async () => {
    setIsLoading(true)
    try {
      const slow = await offlineInventory.getSlowMovingProducts(windowDays)
      setItems(slow)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-[#fff7ed] dark:bg-[#331c0e] text-[#ea580c] dark:text-[#fb923c]">
            <Clock className="size-4.5" />
          </span>
          <h1 className="text-2xl font-black tracking-tight text-[#1c2420] dark:text-white sm:text-3xl">
            {lang === 'hi' ? 'जो माल नहीं बिक रहा' : 'Slow-Moving Items'}
          </h1>
        </div>
        <p className="mt-1 text-xs text-[#6a7c6e] dark:text-[#9bb0a0] sm:text-sm">
          {lang === 'hi'
            ? 'दुकान का ऐसा सामान जिसकी हाल ही में कम या कोई बिक्री नहीं हुई है।'
            : 'Inventory with little to no counter movement over the selected time window.'}
        </p>
      </div>

      {/* Time Window Selector (7 days, 14 days, 30 days) */}
      <div className="flex items-center justify-between rounded-2xl border border-[#dce3d8] dark:border-[#28352b] bg-white dark:bg-[#1c2420] p-3 shadow-xs">
        <span className="text-xs font-bold text-[#4c5d4f] dark:text-[#9bb0a0]">
          Observation Window:
        </span>
        <div className="flex items-center gap-1.5">
          {[7, 14, 30].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setWindowDays(d)}
              className={`min-h-[38px] rounded-xl px-3 text-xs font-bold transition-all ${
                windowDays === d
                  ? 'bg-[#ea580c] text-white shadow-2xs'
                  : 'text-[#627364] dark:text-[#8ba090] hover:bg-[#f3f7f1] dark:hover:bg-[#253229]'
              }`}
            >
              {d} Days
            </button>
          ))}
        </div>
      </div>

      {/* Explainer Notice */}
      <div className="rounded-2xl border border-[#fed7aa] dark:border-[#452712] bg-[#fffaf5] dark:bg-[#221308] p-4 text-xs text-[#9a3412] dark:text-[#fed7aa] space-y-1">
        <p className="font-bold">
          {lang === 'hi' ? 'सलाह: पूंजी फँसी होने से बचाएँ' : 'Kirana Advice: Free up working capital'}
        </p>
        <p className="text-[11px] leading-relaxed text-[#b45309] dark:text-[#fdba74]">
          {lang === 'hi'
            ? 'इस सूची के सामान का नया ऑर्डर रोकें और इसे काउंटर के सामने रखकर या छोटा डिस्काउंट देकर निकालने पर विचार करें।'
            : 'Hold off reordering these items. Consider placing them near counter display or offering small combo deals to clear stock.'}
        </p>
      </div>

      {/* Items List */}
      <div className="rounded-3xl border border-[#e2e8de] dark:border-[#28352b] bg-white dark:bg-[#1c2420] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <TableRowSkeleton columns={4} />
            <TableRowSkeleton columns={4} />
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-[#edf2ea] dark:divide-[#28352b]">
            {items.map((it) => (
              <div key={it.product.id} className="p-4.5 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-2xl bg-[#fff7ed] dark:bg-[#2e1a0d] text-[#ea580c] dark:text-[#fb923c]">
                      <Package className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1c2420] dark:text-white">
                        {it.product.name}
                      </p>
                      <p className="text-xs text-[#6e8071] dark:text-[#8ba090]">
                        {it.product.category} • Current stock: <strong className="text-[#1c2420] dark:text-white">{it.product.quantity} {it.product.unit}</strong>
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#fef2f2] dark:bg-[#331515] px-2.5 py-0.5 text-xs font-black text-[#dc2626] dark:text-[#f87171]">
                    {it.unitsSold === 0 ? '0 Sold' : `${it.unitsSold} sold`}
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-[#f1f5ee] dark:border-[#253228] pt-2 text-xs">
                  <span className="text-[#6e8071] dark:text-[#8ba090] flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {it.daysSinceLastSale !== undefined
                      ? `Last sold: ${it.daysSinceLastSale} days ago`
                      : 'No sales recorded yet'}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRecordSaleQuick(it.product)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl bg-[#1e6b38] px-3.5 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-[#18552d]"
                  >
                    <Tag className="size-3.5" />
                    <span>Quick Sale / बेचें</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={CheckCircle2}
              title={lang === 'hi' ? 'सभी सामान बिक रहा है!' : 'All Items Moving Well!'}
              description={
                lang === 'hi'
                  ? 'आपकी दुकान में ऐसा कोई सामान नहीं है जो फँसा हुआ हो।'
                  : 'No dead stock detected. Your store inventory is rotating steadily.'
              }
              iconColorClass="bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]"
            />
          </div>
        )}
      </div>
    </div>
  )
}
