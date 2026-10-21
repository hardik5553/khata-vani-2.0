'use client'

import React, { useState } from 'react'
import {
  Search,
  Plus,
  ArrowDownToLine,
  Settings2,
  Package,
  X,
  Trash2,
} from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { TableRowSkeleton } from '../common/LoadingSkeleton'
import { ErrorState } from '../common/ErrorState'
import { useTranslation } from '@/lib/i18n'
import { Product, ProductUnit } from '@/lib/api/types'

interface StockViewProps {
  products: Product[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onAddProduct: (product: Omit<Product, 'id'>) => Promise<void>
  onUpdateProduct: (id: string | number, updates: Partial<Product>) => Promise<void>
  onDeleteProduct?: (id: string | number) => Promise<void>
  onStockInQuick: (product: Product) => void
}

export function StockView({
  products,
  isLoading,
  error,
  onRetry,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onStockInQuick,
}: StockViewProps) {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock'>('all')
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Filter products by search and status
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())

    const isLow = p.quantity <= p.reorderLevel
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'low_stock'
        ? isLow
        : !isLow

    return matchesSearch && matchesStatus
  })

  const formatCurrency = (val?: number) =>
    val !== undefined ? `₹${val.toLocaleString('en-IN')}` : '—'

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
            {t('stockTitle')}
          </h1>
          <p className="mt-1 text-xs text-[#6a7c6e] sm:text-sm">
            {t('stockSubtitle')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProduct(null)
            setShowDialog(true)
          }}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-[#1e6b38] px-5 text-sm font-bold text-white shadow-xs transition hover:bg-[#18552d] focus-visible:ring-2 focus-visible:ring-[#1e6b38] focus-visible:ring-offset-2"
        >
          <Plus className="size-4.5" />
          <span>{t('btnAddProduct')}</span>
        </button>
      </div>

      {/* 2. Search & Filters Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b9c8d]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-white pl-10 pr-4 text-sm font-medium text-[#1c2420] outline-none transition focus:border-[#1e6b38] focus:ring-2 focus:ring-[#1e6b38]/15"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-[#dce3d8] bg-white p-1">
          {(
            [
              { id: 'all', label: t('filterAll') },
              { id: 'in_stock', label: t('filterInStock') },
              { id: 'low_stock', label: t('filterLowStock') },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`min-h-[36px] rounded-lg px-3 text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-[#1e6b38] text-white shadow-2xs'
                  : 'text-[#5b6c5e] hover:bg-[#f1f5ee]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Error State */}
      {error && (
        <ErrorState
          title={t('errorTitle')}
          description={error}
          onRetry={onRetry}
        />
      )}

      {/* 4. Products Mobile Cards View (Large touch targets, zero horizontal scroll) */}
      {!error && (
        <div className="rounded-3xl border border-[#e2e8de] dark:border-[#28352b] bg-white dark:bg-[#1c2420] shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <TableRowSkeleton columns={6} />
              <TableRowSkeleton columns={6} />
              <TableRowSkeleton columns={6} />
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="divide-y divide-[#edf2ea] dark:divide-[#28352b]">
              {filteredProducts.map((p) => {
                const isLow = p.quantity <= p.reorderLevel
                return (
                  <div key={p.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-bold text-[#1c2420] dark:text-white">{p.name}</p>
                        <p className="text-xs text-[#718274] dark:text-[#8b9e90]">{p.category}</p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                          isLow
                            ? 'bg-[#fee2e2] dark:bg-[#381a1a] text-[#dc2626] dark:text-[#f87171]'
                            : 'bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]'
                        }`}
                      >
                        {isLow ? t('statusLowStock') : t('statusInStock')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[#718274] dark:text-[#8b9e90]">Available: </span>
                        <span className="font-bold text-[#1c2420] dark:text-white">
                          {p.quantity} {p.unit}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#718274] dark:text-[#8b9e90]">Price: </span>
                        <span className="font-bold text-[#1e6b38] dark:text-[#4ade80]">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => onStockInQuick(p)}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#d6e0d2] dark:border-[#2e3b32] bg-white dark:bg-[#161c18] px-3.5 py-1.5 text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] hover:bg-[#f3f7f1] active:scale-95 transition-transform"
                      >
                        <ArrowDownToLine className="size-3.5" />
                        <span>+ Stock In</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProduct(p)
                          setShowDialog(true)
                        }}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#d6e0d2] dark:border-[#2e3b32] bg-white dark:bg-[#161c18] px-3.5 py-1.5 text-xs font-bold text-[#4c5d4f] dark:text-[#9bb0a0] hover:bg-[#f1f5ee] active:scale-95 transition-transform"
                      >
                        <Settings2 className="size-3.5" />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8">
              {searchQuery || statusFilter !== 'all' ? (
                <EmptyState
                  icon={Search}
                  title={t('emptyStockSearchTitle')}
                  description={t('emptyStockSearchDesc')}
                  actionLabel="Clear Filters"
                  onAction={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                  }}
                  iconColorClass="bg-[#f1f5ee] text-[#4d5e50]"
                />
              ) : (
                <EmptyState
                  icon={Package}
                  title={t('emptyStockTitle')}
                  description={t('emptyStockDesc')}
                  actionLabel={t('btnAddProduct')}
                  onAction={() => {
                    setEditingProduct(null)
                    setShowDialog(true)
                  }}
                  iconColorClass="bg-[#eaf4ea] text-[#1e6b38]"
                />
              )}
            </div>
          )}
        </div>
      )}

      {/* 5. Add / Edit Product Modal Dialog */}
      {showDialog && (
        <ProductDialog
          product={editingProduct}
          onClose={() => setShowDialog(false)}
          onSave={async (formData) => {
            if (editingProduct) {
              await onUpdateProduct(editingProduct.id, formData)
            } else {
              await onAddProduct(formData)
            }
            setShowDialog(false)
          }}
        />
      )}
    </div>
  )
}

interface ProductDialogProps {
  product: Product | null
  onClose: () => void
  onSave: (data: Omit<Product, 'id'>) => Promise<void>
}

function ProductDialog({ product, onClose, onSave }: ProductDialogProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(product?.name || '')
  const [category, setCategory] = useState(product?.category || 'Staples')
  const [unit, setUnit] = useState<ProductUnit>(product?.unit || 'kg')
  const [quantity, setQuantity] = useState<number | string>(product?.quantity ?? 0)
  const [purchaseCost, setPurchaseCost] = useState<number | string>(product?.purchaseCost ?? '')
  const [price, setPrice] = useState<number | string>(product?.price ?? '')
  const [reorderLevel, setReorderLevel] = useState<number | string>(product?.reorderLevel ?? 5)
  const [leadTimeDays, setLeadTimeDays] = useState<number | string>(product?.leadTimeDays ?? 2)
  const [safetyStock, setSafetyStock] = useState<number | string>(product?.safetyStock ?? 2)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!name.trim()) {
      setValidationError(t('fieldName') + ' is required.')
      return
    }

    const numPrice = Number(price)
    if (isNaN(numPrice) || numPrice <= 0) {
      setValidationError('Please enter a valid positive selling price.')
      return
    }

    const numQty = Number(quantity)
    if (isNaN(numQty) || numQty < 0) {
      setValidationError('Please enter a valid initial stock quantity.')
      return
    }

    setIsSubmitting(true)
    try {
      await onSave({
        name: name.trim(),
        category: category.trim() || 'General',
        unit,
        quantity: numQty,
        price: numPrice,
        purchaseCost: purchaseCost !== '' ? Number(purchaseCost) : undefined,
        reorderLevel: Number(reorderLevel) || 0,
        leadTimeDays: Number(leadTimeDays) || 1,
        safetyStock: Number(safetyStock) || 0,
      })
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save product.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-2xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-lg rounded-3xl border border-[#e2e8de] bg-white p-6 shadow-xl sm:p-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-[#edf2ea] pb-4">
          <h2 id="dialog-title" className="text-lg font-black text-[#1c2420]">
            {product ? t('dialogEditTitle') : t('dialogAddTitle')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-[#728374] hover:bg-[#f1f5ee]"
            aria-label="Close dialog"
          >
            <X className="size-4.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {validationError && (
            <div className="rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-3 text-xs text-[#9a3412]">
              {validationError}
            </div>
          )}

          {/* Product Name */}
          <div>
            <label className="block text-xs font-bold text-[#3d4d40]">
              {t('fieldName')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('fieldNamePlaceholder')}
              required
              className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white focus:ring-2 focus:ring-[#1e6b38]/15"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldCategory')}
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={t('fieldCategoryPlaceholder')}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldUnit')}
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as ProductUnit)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              >
                <option value="kg">kg (Kilogram)</option>
                <option value="packet">packet (Packet)</option>
                <option value="piece">piece (Piece)</option>
                <option value="litre">litre (Litre)</option>
                <option value="dozen">dozen (Dozen)</option>
                <option value="meter">meter (Meter)</option>
              </select>
            </div>
          </div>

          {/* Quantity & Reorder Threshold */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldQuantity')} ({unit}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldReorderLevel')} ({unit})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>
          </div>

          {/* Pricing: Purchase Cost & Selling Price */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldCost')}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="Optional"
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldPrice')} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="mt-1.5 min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#edf2ea]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="min-h-[44px] rounded-xl px-4 text-xs font-bold text-[#627364] hover:bg-[#f1f5ee]"
            >
              {t('btnCancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1e6b38] px-5 text-xs font-bold text-white shadow-xs hover:bg-[#18552d] disabled:cursor-not-allowed disabled:bg-[#a3b8a7]"
            >
              {isSubmitting ? t('btnSaving') : t('btnSaveProduct')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
