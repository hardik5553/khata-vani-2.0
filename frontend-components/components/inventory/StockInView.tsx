'use client'

import React, { useState } from 'react'
import { ArrowDownToLine, CheckCircle2, AlertCircle, Package } from 'lucide-react'
import { EmptyState } from '../common/EmptyState'
import { useTranslation } from '@/lib/i18n'
import { Product } from '@/lib/api/types'
import { StockInPayload, StockInResponse } from '@/lib/api/stockIn'

interface StockInViewProps {
  products: Product[]
  initialProduct?: Product | null
  onRecordStockIn: (payload: StockInPayload) => Promise<StockInResponse>
  onNavigateToStock: () => void
}

export function StockInView({
  products,
  initialProduct,
  onRecordStockIn,
  onNavigateToStock,
}: StockInViewProps) {
  const { t } = useTranslation()
  const [selectedProductId, setSelectedProductId] = useState<string | number>(
    initialProduct?.id || ''
  )
  const [quantity, setQuantity] = useState<number | string>(1)
  const [purchaseCost, setPurchaseCost] = useState<number | string>('')
  const [supplier, setSupplier] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedProduct = products.find((p) => String(p.id) === String(selectedProductId))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage(null)
    setErrorMessage(null)

    if (!selectedProduct) {
      setErrorMessage('Please choose a product to receive.')
      return
    }

    const numQty = Number(quantity)
    if (isNaN(numQty) || numQty <= 0) {
      setErrorMessage('Please enter a valid positive quantity received.')
      return
    }

    setIsSubmitting(true)
    try {
      await onRecordStockIn({
        productId: selectedProduct.id,
        quantity: numQty,
        purchaseCost: purchaseCost !== '' ? Number(purchaseCost) : undefined,
        supplier: supplier.trim() || undefined,
        notes: notes.trim() || undefined,
      })

      setSuccessMessage(
        `${numQty} ${selectedProduct.unit} of ${selectedProduct.name} added to stock.`
      )
      setQuantity(1)
      setPurchaseCost('')
      setSupplier('')
      setNotes('')
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to record stock shipment.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
          {t('stockInTitle')}
        </h1>
        <p className="mt-1 text-xs text-[#6a7c6e] sm:text-sm">
          {t('stockInSubtitle')}
        </p>
      </div>

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

      <div className="mx-auto max-w-2xl rounded-3xl border border-[#e2e8de] bg-white p-6 shadow-xs sm:p-8">
        {products.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('emptyStockTitle')}
            description="Add products to your catalog before registering received stock."
            actionLabel={t('btnAddProduct')}
            onAction={onNavigateToStock}
            iconColorClass="bg-[#eaf4ea] text-[#1e6b38]"
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('dialogAddTitle')} (Select Product) *
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              >
                <option value="">{t('selectProductPrompt')}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — Current stock: {p.quantity} {p.unit}
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <div className="rounded-xl border border-[#e5ebe1] bg-[#f7f9f6] p-3 text-xs text-[#5d6f60]">
                Current stock: <strong className="text-[#1c2420]">{selectedProduct.quantity} {selectedProduct.unit}</strong> | Category: {selectedProduct.category}
              </div>
            )}

            {/* Quantity Received */}
            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldQtyReceived')} {selectedProduct ? `(${selectedProduct.unit})` : ''} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>

            {/* Supplier / Distributor */}
            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                {t('fieldSupplier')}
              </label>
              <input
                type="text"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder={t('fieldSupplierPlaceholder')}
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>

            {/* Purchase Cost per unit */}
            <div>
              <label className="block text-xs font-bold text-[#3d4d40]">
                Purchase Cost per Unit (₹) (Optional)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                placeholder="Optional supplier unit cost"
                className="mt-1.5 min-h-[48px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] px-3.5 text-sm font-medium outline-none transition focus:border-[#1e6b38] focus:bg-white"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={!selectedProduct || isSubmitting}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1e6b38] text-sm font-bold text-white shadow-xs transition hover:bg-[#18552d] disabled:cursor-not-allowed disabled:bg-[#a8baa9]"
              >
                <ArrowDownToLine className="size-4.5" />
                <span>{isSubmitting ? 'Saving...' : t('btnSaveStockIn')}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
