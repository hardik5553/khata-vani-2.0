'use client'

import React from 'react'
import {
  Package,
  TrendingUp,
  AlertTriangle,
  CircleDollarSign,
  PlusCircle,
  ChevronRight,
  Clock,
  Sparkles,
  BarChart2,
} from 'lucide-react'
import { MetricCard } from '../common/MetricCard'
import { EmptyState } from '../common/EmptyState'
import { ListCardSkeleton } from '../common/LoadingSkeleton'
import { ErrorState } from '../common/ErrorState'
import { useTranslation } from '@/lib/i18n'
import { Product, SaleTransaction, ShopProfile, AuthUser } from '@/lib/api/types'
import { AppView } from '../layout/AppShell'

interface DashboardViewProps {
  onNavigate: (view: AppView) => void
  products: Product[]
  sales: SaleTransaction[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  user: AuthUser | null
  shop: ShopProfile | null
}

export function DashboardView({
  onNavigate,
  products,
  sales,
  isLoading,
  error,
  onRetry,
  user,
  shop,
}: DashboardViewProps) {
  const { t } = useTranslation()

  // Real data calculations (No invented / hardcoded business numbers)
  const lowStockProducts = products.filter((p) => p.quantity <= p.reorderLevel)
  const totalStockValue = products.reduce((acc, p) => acc + p.quantity * p.price, 0)
  
  // Real sales total
  const todaySalesTotal = sales.reduce((acc, s) => acc + s.amount, 0)

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`

  if (error) {
    return (
      <div className="py-8">
        <ErrorState
          title={t('errorTitle')}
          description={error}
          onRetry={onRetry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-7">
      {/* 1. Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e6b38]">
            {shop?.shopName || 'StockSprint'}
          </span>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
            {t('greetingMorning')}, {user?.name || t('greetingShopkeeper')}
          </h1>
          <p className="mt-1 text-xs text-[#6a7c6e] sm:text-sm">
            {t('shopSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('sale')}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1e6b38] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#18552d] focus-visible:ring-2 focus-visible:ring-[#1e6b38] focus-visible:ring-offset-2"
        >
          <PlusCircle className="size-5" />
          <span>{t('actionQuickSale')}</span>
        </button>
      </div>

      {/* 2. Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-3.5 sm:gap-5 xl:grid-cols-4">
        <MetricCard
          label={t('metricTotalProducts')}
          value={isLoading ? null : products.length}
          subtitle={t('metricTotalProductsSub')}
          icon={Package}
          isLoading={isLoading}
          accentColor="green"
        />
        <MetricCard
          label={t('metricTodaySales')}
          value={isLoading ? null : formatCurrency(todaySalesTotal)}
          subtitle={t('metricTodaySalesSub')}
          icon={TrendingUp}
          isLoading={isLoading}
          accentColor="green"
        />
        <MetricCard
          label={t('metricLowStock')}
          value={isLoading ? null : lowStockProducts.length}
          subtitle={t('metricLowStockSub')}
          icon={AlertTriangle}
          isLoading={isLoading}
          accentColor="amber"
        />
        <MetricCard
          label={t('metricStockValue')}
          value={isLoading ? null : formatCurrency(totalStockValue)}
          subtitle={t('metricStockValueSub')}
          icon={CircleDollarSign}
          isLoading={isLoading}
          accentColor="blue"
        />
      </div>

      {/* 3. Main Two Columns: Low Stock Alerts & Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Low Stock Alerts */}
        <section className="flex flex-col rounded-2xl border border-[#e2e8de] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#edf2ea] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#1c2420]">
                {t('sectionLowStock')}
              </h2>
              <p className="mt-0.5 text-xs text-[#6e8071]">
                {t('sectionLowStockSub')}
              </p>
            </div>
            {lowStockProducts.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('reorder')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1e6b38] hover:underline"
              >
                <span>{t('viewAllList')}</span>
                <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>

          <div className="mt-4 flex-1">
            {isLoading ? (
              <ListCardSkeleton count={2} />
            ) : lowStockProducts.length > 0 ? (
              <div className="space-y-2.5">
                {lowStockProducts.slice(0, 4).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-xl border border-[#fee2e2] bg-[#fffaf9] p-3 transition hover:bg-[#fff5f5]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-lg bg-[#fef2f2] text-[#dc2626]">
                        <Package className="size-4.5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#1c2420]">{p.name}</p>
                        <p className="text-[11px] text-[#718274]">
                          {p.category} • Reorder threshold: {p.reorderLevel} {p.unit}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-[#dc2626]">
                        {p.quantity} {p.unit}
                      </p>
                      <button
                        type="button"
                        onClick={() => onNavigate('stock-in')}
                        className="mt-0.5 text-[11px] font-bold text-[#1e6b38] hover:underline"
                      >
                        + Restock
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Sparkles}
                title={t('noLowStockTitle')}
                description={t('noLowStockDesc')}
                iconColorClass="bg-[#eaf4ea] text-[#1e6b38]"
              />
            )}
          </div>
        </section>

        {/* Right: Recent Transactions */}
        <section className="flex flex-col rounded-2xl border border-[#e2e8de] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#edf2ea] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#1c2420]">
                {t('sectionRecentSales')}
              </h2>
              <p className="mt-0.5 text-xs text-[#6e8071]">
                {t('sectionRecentSalesSub')}
              </p>
            </div>
            {sales.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1e6b38] hover:underline"
              >
                <span>{t('viewAllList')}</span>
                <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>

          <div className="mt-4 flex-1">
            {isLoading ? (
              <ListCardSkeleton count={2} />
            ) : sales.length > 0 ? (
              <div className="space-y-2.5">
                {sales.slice(0, 5).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between rounded-xl border border-[#edf2ea] bg-white p-3 hover:bg-[#f9fbf8]"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#1c2420]">
                        {s.productName || `Product #${s.productId}`}
                      </p>
                      <p className="text-[11px] text-[#718274]">
                        {s.quantity} {s.unit || 'units'} sold • {s.time}
                      </p>
                    </div>
                    <p className="text-xs font-black text-[#1e6b38]">
                      {formatCurrency(s.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Clock}
                title={t('noSalesTitle')}
                description={t('noSalesDesc')}
                actionLabel={t('actionQuickSale')}
                onAction={() => onNavigate('sale')}
                iconColorClass="bg-[#eaf4ea] text-[#1e6b38]"
              />
            )}
          </div>
        </section>
      </div>

      {/* 4. Sales Trends Container (Clean, no fabricated chart) */}
      <section className="rounded-2xl border border-[#e2e8de] bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#edf2ea] pb-4">
          <div>
            <h2 className="text-base font-bold text-[#1c2420]">
              {t('sectionSalesSummary')}
            </h2>
            <p className="mt-0.5 text-xs text-[#6e8071]">
              {t('sectionSalesSummarySub')}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#dce3d7] bg-[#fafbf9] py-12 text-center">
          <div className="grid size-12 place-items-center rounded-xl bg-[#eaf4ea] text-[#1e6b38]">
            <BarChart2 className="size-6" />
          </div>
          <p className="mt-3 text-xs font-semibold text-[#667768]">
            {t('noChartData')}
          </p>
        </div>
      </section>
    </div>
  )
}
