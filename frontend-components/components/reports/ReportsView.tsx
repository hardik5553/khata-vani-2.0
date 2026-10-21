'use client'

import React from 'react'
import { BarChart3, TrendingUp, ShoppingBag, Layers, AlertCircle } from 'lucide-react'
import { MetricCard } from '../common/MetricCard'
import { EmptyState } from '../common/EmptyState'
import { useTranslation } from '@/lib/i18n'
import { Product, SaleTransaction } from '@/lib/api/types'

interface ReportsViewProps {
  products: Product[]
  sales: SaleTransaction[]
  isLoading: boolean
  onNavigateToSale: () => void
}

export function ReportsView({
  products,
  sales,
  isLoading,
  onNavigateToSale,
}: ReportsViewProps) {
  const { t } = useTranslation()

  // Real data calculations
  const totalRevenue = sales.reduce((acc, s) => acc + s.amount, 0)
  const totalTransactions = sales.length

  // Calculate gross margin from verified cost prices
  const estimatedMargin = sales.reduce((acc, s) => {
    const prod = products.find((p) => String(p.id) === String(s.productId))
    if (prod?.purchaseCost && prod?.price) {
      const unitMargin = prod.price - prod.purchaseCost
      return acc + unitMargin * s.quantity
    }
    return acc
  }, 0)

  // Compute product velocity
  const productSalesMap = new Map<string | number, { units: number; revenue: number }>()
  sales.forEach((s) => {
    const prev = productSalesMap.get(s.productId) || { units: 0, revenue: 0 }
    productSalesMap.set(s.productId, {
      units: prev.units + s.quantity,
      revenue: prev.revenue + s.amount,
    })
  })

  const fastMoving = Array.from(productSalesMap.entries())
    .map(([productId, data]) => {
      const prod = products.find((p) => String(p.id) === String(productId))
      return {
        id: productId,
        name: prod?.name || sProductFallback(productId),
        category: prod?.category || 'General',
        unit: prod?.unit || 'units',
        unitsSold: data.units,
        revenue: data.revenue,
      }
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)

  function sProductFallback(id: string | number) {
    const match = sales.find((s) => String(s.productId) === String(id))
    return match?.productName || `Product #${id}`
  }

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
          {t('reportsTitle')}
        </h1>
        <p className="mt-1 text-xs text-[#6a7c6e] sm:text-sm">
          {t('reportsSubtitle')}
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={t('metricRecordedRevenue')}
          value={isLoading ? null : formatCurrency(totalRevenue)}
          subtitle="Gross sales recorded at counter"
          icon={TrendingUp}
          isLoading={isLoading}
          accentColor="green"
        />
        <MetricCard
          label={t('metricTransactionsCount')}
          value={isLoading ? null : totalTransactions}
          subtitle="Total completed billing orders"
          icon={ShoppingBag}
          isLoading={isLoading}
          accentColor="blue"
        />
        <MetricCard
          label={t('metricGrossMargin')}
          value={isLoading ? null : formatCurrency(estimatedMargin)}
          subtitle="Selling price minus purchase cost"
          icon={Layers}
          isLoading={isLoading}
          accentColor="green"
        />
      </div>

      {/* Fast Moving Products Table */}
      <div className="rounded-2xl border border-[#e2e8de] bg-white shadow-xs overflow-hidden">
        <div className="border-b border-[#edf2ea] bg-[#fafbf9] px-6 py-4">
          <h2 className="text-sm font-bold text-[#1c2420]">
            {t('sectionFastMoving')}
          </h2>
          <p className="mt-0.5 text-xs text-[#718274]">
            Ranking based on recorded counter transactions
          </p>
        </div>

        {fastMoving.length > 0 ? (
          <div className="divide-y divide-[#edf2ea]">
            {fastMoving.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 sm:px-6"
              >
                <div className="flex items-center gap-3.5">
                  <span className="grid size-7 place-items-center rounded-lg bg-[#f1f5ee] text-xs font-black text-[#566758]">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#1c2420] sm:text-sm">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-[#718274]">
                      {item.category}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-[#1e6b38] sm:text-sm">
                    {item.unitsSold} {item.unit} sold
                  </p>
                  <p className="text-[11px] text-[#718274]">
                    {formatCurrency(item.revenue)} total
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              icon={BarChart3}
              title={t('noReportsTitle')}
              description={t('noReportsDesc')}
              actionLabel={t('actionQuickSale')}
              onAction={onNavigateToSale}
              iconColorClass="bg-[#eaf4ea] text-[#1e6b38]"
            />
          </div>
        )}
      </div>
    </div>
  )
}
