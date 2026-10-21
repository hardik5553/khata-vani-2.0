'use client'

import React from 'react'
import { ClipboardList, ArrowDownToLine, Info, CheckCircle2, Package } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { TableRowSkeleton } from '../common/LoadingSkeleton'
import { useTranslation } from '@/lib/i18n'
import { Product, SaleTransaction } from '@/lib/api/types'

interface ReorderViewProps {
  products: Product[]
  sales: SaleTransaction[]
  isLoading: boolean
  onQuickStockIn: (product: Product) => void
}

export function ReorderView({
  products,
  sales,
  isLoading,
  onQuickStockIn,
}: ReorderViewProps) {
  const { t } = useTranslation()

  // Find products that are at or below their reorder threshold
  const itemsNeedingRestock = products.filter((p) => p.quantity <= p.reorderLevel)

  // Calculate suggested restock amounts using deterministic inventory rule
  // Rule: (Avg daily sales * lead time) + safety stock - current stock
  const calculateRestock = (p: Product) => {
    const productSales = sales.filter((s) => String(s.productId) === String(p.id))
    const totalUnitsSold = productSales.reduce((acc, s) => acc + s.quantity, 0)
    // Assume 7 days observation window for recent sales if data exists
    const dailyVelocity = totalUnitsSold > 0 ? totalUnitsSold / 7 : 0
    const leadTime = p.leadTimeDays || 2
    const safety = p.safetyStock || 2

    const dynamicReorderPoint = Math.ceil(dailyVelocity * leadTime + safety)
    const effectiveThreshold = Math.max(dynamicReorderPoint, p.reorderLevel)
    const suggestedOrder = Math.max(1, Number((effectiveThreshold - p.quantity).toFixed(2)))

    return {
      dailyVelocity: Number(dailyVelocity.toFixed(2)),
      reorderPoint: effectiveThreshold,
      suggestedOrder,
      hasSalesHistory: totalUnitsSold > 0,
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
          {t('reorderTitle')}
        </h1>
        <p className="mt-1 text-xs text-[#6a7c6e] sm:text-sm">
          {t('reorderSubtitle')}
        </p>
      </div>

      {/* Transparent Formula Explainer Banner (No Pseudo AI claims) */}
      <div className="rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-4.5 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#ffedd5] text-[#c2410c]">
            <Info className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#7c2d12]">
              Deterministic Restocking Formula
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#9a3412]">
              {t('reorderFormulaNote')}
              <span className="block mt-0.5 text-[11px] text-[#b45309]">
                Calculations are derived from verified sales history and your defined safety buffer.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Reorder Table */}
      <div className="rounded-2xl border border-[#e2e8de] bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-2">
            <TableRowSkeleton columns={5} />
            <TableRowSkeleton columns={5} />
          </div>
        ) : itemsNeedingRestock.length > 0 ? (
          <div className="divide-y divide-[#edf2ea]">
            {/* Desktop Table Header */}
            <div className="hidden grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 bg-[#fafbf9] px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-[#738475] md:grid">
              <span>{t('thProduct')}</span>
              <span>{t('thCurrentStock')}</span>
              <span>{t('thReorderPoint')}</span>
              <span>{t('thSuggestedOrder')}</span>
              <span className="text-right">Action</span>
            </div>

            {itemsNeedingRestock.map((p) => {
              const calc = calculateRestock(p)
              return (
                <div
                  key={p.id}
                  className="flex flex-col gap-3 p-4 sm:p-5 md:grid md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:items-center md:gap-4 md:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fee2e2] text-[#dc2626]">
                      <Package className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#1c2420]">{p.name}</p>
                      <p className="text-xs text-[#718274]">
                        {p.category} • Lead time: {p.leadTimeDays || 2}d
                      </p>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="text-[#718274] md:hidden">{t('thCurrentStock')}: </span>
                    <span className="font-bold text-[#dc2626]">
                      {p.quantity} {p.unit}
                    </span>
                  </div>

                  <div className="text-xs">
                    <span className="text-[#718274] md:hidden">{t('thReorderPoint')}: </span>
                    <span className="font-bold text-[#1c2420]">
                      {calc.reorderPoint} {p.unit}
                    </span>
                    {calc.hasSalesHistory && (
                      <span className="block text-[10px] text-[#6b7b6e]">
                        Velocity: {calc.dailyVelocity} {p.unit}/day
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[#718274] text-xs md:hidden">{t('thSuggestedOrder')}: </span>
                    <span className="inline-flex items-center rounded-xl bg-[#eaf4ea] px-3 py-1 text-xs font-black text-[#1e6b38]">
                      + {calc.suggestedOrder} {p.unit}
                    </span>
                  </div>

                  <div className="pt-2 md:pt-0 text-right">
                    <button
                      type="button"
                      onClick={() => onQuickStockIn(p)}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-[#1e6b38] px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#18552d]"
                    >
                      <ArrowDownToLine className="size-3.5" />
                      <span>{t('btnPlaceOrder')}</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={CheckCircle2}
              title={t('noReorderTitle')}
              description={t('noReorderDesc')}
              iconColorClass="bg-[#eaf4ea] text-[#1e6b38]"
            />
          </div>
        )}
      </div>
    </div>
  )
}
