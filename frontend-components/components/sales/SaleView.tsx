'use client'

import React, { useState } from 'react'
import {
  Search,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Package,
  CircleDollarSign,
  ShoppingCart,
} from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { useTranslation } from '@/lib/i18n'
import { Product } from '@/lib/api/types'
import { RecordSalePayload, RecordSaleResponse } from '@/lib/api/sales'

interface SaleViewProps {
  products: Product[]
  isLoading: boolean
  onRecordSale: (payload: RecordSalePayload) => Promise<RecordSaleResponse>
  onNavigateToStock: () => void
}

export function SaleView({
  products,
  isLoading,
  onRecordSale,
  onNavigateToStock,
}: SaleViewProps) {
  const { t } = useTranslation()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [saleQuantity, setSaleQuantity] = useState<number>(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN')}`

  const totalAmount = selectedProduct ? Number((selectedProduct.price * saleQuantity).toFixed(2)) : 0
  const isOutOfStock = selectedProduct ? selectedProduct.quantity <= 0 : false
  const exceedsStock = selectedProduct ? saleQuantity > selectedProduct.quantity : false

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setSaleQuantity(1)
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const handleQuantityAdjust = (delta: number) => {
    if (!selectedProduct) return
    const step = selectedProduct.unit === 'kg' || selectedProduct.unit === 'litre' ? 0.5 : 1
    const nextVal = Math.max(step, Number((saleQuantity + delta * step).toFixed(2)))
    setSaleQuantity(nextVal)
  }

  const handleConfirmSale = async () => {
    if (!selectedProduct) return
    setSuccessMessage(null)
    setErrorMessage(null)

    if (saleQuantity <= 0) {
      setErrorMessage(t('errorInvalidQty'))
      return
    }

    if (saleQuantity > selectedProduct.quantity) {
      setErrorMessage(t('errorInsufficientStock'))
      return
    }

    setIsSubmitting(true)
    try {
      // Authoritatively record sale on backend
      const res = await onRecordSale({
        productId: selectedProduct.id,
        quantity: saleQuantity,
        unitPrice: selectedProduct.price,
      })

      setSuccessMessage(
        `${selectedProduct.name} — ${saleQuantity} ${selectedProduct.unit} sale recorded.`
      )
      setSelectedProduct(null)
      setSaleQuantity(1)
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Failed to record sale. Please verify backend connection.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
          {t('saleTitle')}
        </h1>
        <p className="mt-1 text-xs text-[#6a7c6e] sm:text-sm">
          {t('saleSubtitle')}
        </p>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs font-bold text-[#166534]">
          <CheckCircle2 className="size-5 shrink-0 text-[#16a34a]" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-[#fed7aa] bg-[#fffaf5] p-4 text-xs font-bold text-[#9a3412]">
          <AlertCircle className="size-5 shrink-0 text-[#ea580c]" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Workflow Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Step 1: Select Product */}
        <section className="flex flex-col rounded-2xl border border-[#e2e8de] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#edf2ea] pb-3.5">
            <h2 className="text-sm font-bold text-[#1c2420]">
              {t('stepSelectProduct')}
            </h2>
            <span className="text-xs text-[#718274]">
              {products.length} products available
            </span>
          </div>

          {/* Search bar inside selection */}
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#8b9c8d]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="min-h-[44px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] pl-10 pr-4 text-xs font-medium text-[#1c2420] outline-none transition focus:border-[#1e6b38] focus:bg-white"
            />
          </div>

          <div className="mt-4 flex-1">
            {products.length === 0 ? (
              <EmptyState
                icon={Package}
                title={t('emptyStockTitle')}
                description="You need to add products into inventory before recording sales."
                actionLabel={t('btnAddProduct')}
                onAction={onNavigateToStock}
                iconColorClass="bg-[#eaf4ea] text-[#1e6b38]"
              />
            ) : filteredProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-[#718274]">
                {t('emptyStockSearchTitle')}
              </p>
            ) : (
              <div className="max-h-[380px] space-y-2 overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id
                  const isZero = p.quantity <= 0
                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isZero}
                      onClick={() => handleSelectProduct(p)}
                      className={`flex min-h-[52px] w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                        isSelected
                          ? 'border-[#1e6b38] bg-[#eaf4ea] shadow-2xs'
                          : isZero
                          ? 'cursor-not-allowed border-[#edf2ea] bg-[#f7f9f6] opacity-50'
                          : 'border-[#edf2ea] bg-white hover:border-[#ccd7c8] hover:bg-[#fafbf9]'
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-[#1c2420]">{p.name}</p>
                        <p className="text-[11px] text-[#6b7b6e]">
                          {formatCurrency(p.price)} / {p.unit} • {p.category}
                        </p>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-bold ${
                            isZero ? 'text-[#dc2626]' : 'text-[#1e6b38]'
                          }`}
                        >
                          {p.quantity} {p.unit}
                        </span>
                        <p className="text-[10px] text-[#839486]">
                          {isZero ? 'Out of stock' : t('qtyAvailable')}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Step 2: Quantity & Checkout Panel */}
        <section className="flex flex-col justify-between rounded-2xl border border-[#e2e8de] bg-white p-5 shadow-xs">
          <div>
            <div className="border-b border-[#edf2ea] pb-3.5">
              <h2 className="text-sm font-bold text-[#1c2420]">
                {t('stepSelectQty')}
              </h2>
            </div>

            {selectedProduct ? (
              <div className="mt-5 space-y-6">
                {/* Selected Product Summary */}
                <div className="rounded-2xl border border-[#dce3d8] bg-[#f9fbf8] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#1e6b38]">
                        Selected Item
                      </span>
                      <p className="text-base font-black text-[#1c2420]">
                        {selectedProduct.name}
                      </p>
                      <p className="text-xs text-[#6e7f71]">
                        {formatCurrency(selectedProduct.price)} per {selectedProduct.unit}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#eaf4ea] px-3 py-1 text-xs font-bold text-[#1e6b38]">
                      {selectedProduct.quantity} {selectedProduct.unit} in stock
                    </span>
                  </div>
                </div>

                {/* Large Thumb-Friendly Quantity Controls (min 48px) */}
                <div>
                  <label className="block text-xs font-bold text-[#3d4d40]">
                    Sale Quantity ({selectedProduct.unit})
                  </label>
                  <div className="mt-2 flex items-center justify-between rounded-2xl border border-[#d8e0d4] bg-[#fafbf9] p-2">
                    <button
                      type="button"
                      onClick={() => handleQuantityAdjust(-1)}
                      className="grid size-12 place-items-center rounded-xl bg-white text-[#1c2420] shadow-xs transition hover:bg-[#edf2ea] active:scale-95"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-5" />
                    </button>

                    <input
                      type="number"
                      step={selectedProduct.unit === 'kg' || selectedProduct.unit === 'litre' ? '0.1' : '1'}
                      min="0.1"
                      max={selectedProduct.quantity}
                      value={saleQuantity}
                      onChange={(e) => setSaleQuantity(Number(e.target.value))}
                      className="w-28 bg-transparent text-center text-3xl font-black text-[#1c2420] outline-none"
                      aria-label="Sale quantity input"
                    />

                    <button
                      type="button"
                      onClick={() => handleQuantityAdjust(1)}
                      className="grid size-12 place-items-center rounded-xl bg-[#1e6b38] text-white shadow-xs transition hover:bg-[#18552d] active:scale-95"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-5" />
                    </button>
                  </div>

                  {exceedsStock && (
                    <p className="mt-2 text-xs font-bold text-[#dc2626]">
                      {t('errorInsufficientStock')}
                    </p>
                  )}
                </div>

                {/* Total Billing Calculation */}
                <div className="rounded-2xl bg-[#f2f6f0] p-4.5">
                  <div className="flex items-center justify-between text-xs text-[#5e7062]">
                    <span>{t('unitPrice')}</span>
                    <span className="font-semibold">{formatCurrency(selectedProduct.price)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-[#5e7062]">
                    <span>Quantity</span>
                    <span className="font-semibold">{saleQuantity} {selectedProduct.unit}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-[#d8e2d4] pt-3">
                    <span className="text-sm font-bold text-[#1c2420]">{t('totalAmount')}</span>
                    <span className="text-2xl font-black text-[#1e6b38]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-[#7b8c7d]">
                <div className="grid size-12 place-items-center rounded-xl bg-[#f2f5f0] text-[#718274]">
                  <ShoppingCart className="size-6" />
                </div>
                <p className="mt-3 text-xs font-bold text-[#4c5c4e]">
                  {t('saleSelectPrompt')}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Button */}
          <div className="mt-6 border-t border-[#edf2ea] pt-4">
            <button
              type="button"
              disabled={!selectedProduct || isSubmitting || exceedsStock || saleQuantity <= 0}
              onClick={handleConfirmSale}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#1e6b38] text-base font-bold text-white shadow-xs transition hover:bg-[#18552d] disabled:cursor-not-allowed disabled:bg-[#a8baa9]"
            >
              <CircleDollarSign className="size-5" />
              <span>
                {isSubmitting ? t('btnRecordingSale') : `${t('btnConfirmSale')} (${formatCurrency(totalAmount)})`}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
