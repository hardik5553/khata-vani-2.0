'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { LoginForm } from './auth/LoginForm'
import { OnboardingFlow } from './onboarding/OnboardingFlow'
import { AppShell, AppView } from './layout/AppShell'
import { VisualDashboardView } from './dashboard/VisualDashboardView'
import { StockView } from './inventory/StockView'
import { SaleView } from './sales/SaleView'
import { StockInView } from './inventory/StockInView'
import { ReorderView } from './reorder/ReorderView'
import { ReportsView } from './reports/ReportsView'
import { SettingsView } from './settings/SettingsView'
import { SlowMovingView } from './inventory/SlowMovingView'
import { VoiceCommandModal } from './voice/VoiceCommandModal'
import { CameraModal } from './camera/CameraModal'
import { SyncStatusModal } from './sync/SyncStatusModal'
import { Product, SaleTransaction, ShopProfile, AuthUser } from '@/lib/api/types'
import { inventoryService } from '@/lib/api/inventory'
import { salesService, RecordSalePayload } from '@/lib/api/sales'
import { stockInService, StockInPayload } from '@/lib/api/stockIn'
import { shopService } from '@/lib/api/shop'
import { useAuth } from '@/lib/auth-context'
import { localDb, offlineInventory } from '@/lib/db/indexed-db'
import { syncService } from '@/lib/sync/sync-service'

export type AppScreen = 'onboarding' | 'login' | 'app'

export default function StockSprintApp() {
  const { user, shop, isAuthenticated } = useAuth()
  const [screen, setScreen] = useState<AppScreen>(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('stocksprint_onboarded')
      return onboarded ? 'app' : 'onboarding'
    }
    return 'app'
  })
  const [view, setView] = useState<AppView>('dashboard')

  // Modals for Voice, Camera & Sync
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false)
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false)

  // Real backend data states — initialized EMPTY, NO fake starter products or mock sales!
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<SaleTransaction[]>([])
  const [currentShop, setCurrentShop] = useState<ShopProfile | null>(shop)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stockInTargetProduct, setStockInTargetProduct] = useState<Product | null>(null)

  // Check URL parameters for direct view routing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const requestedView = params.get('view') as AppView | null
      const requestedScreen = params.get('screen') as AppScreen | null

      if (requestedScreen) {
        setScreen(requestedScreen)
      } else if (requestedView) {
        setScreen('app')
        setView(requestedView)
      }
    }
  }, [])

  // Sync shop state when auth changes
  useEffect(() => {
    if (shop) {
      setCurrentShop(shop)
    }
  }, [shop])

  // Fetch real data: First from durable local IndexedDB (instant offline support), then server
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // 1. Load from local IndexedDB first for instant, offline-capable display
      const localProducts = await offlineInventory.getAllProducts().catch(() => [] as Product[])
      const localTransactions = await offlineInventory.getAllTransactions().catch(() => [])

      const localSales: SaleTransaction[] = localTransactions
        .filter((tx) => tx.type === 'sale')
        .map((tx) => ({
          id: tx.id,
          productId: tx.productId,
          productName: tx.productName,
          quantity: Math.abs(tx.quantityDelta),
          unit: tx.unit,
          amount: tx.totalAmount || 0,
          time: new Date(tx.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        }))

      if (localProducts.length > 0) {
        setProducts(localProducts)
        setSales(localSales)
      }

      // 2. If online, fetch from backend and synchronize local storage
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        try {
          const [fetchedProducts, fetchedSales] = await Promise.all([
            inventoryService.getProducts().catch(() => null),
            salesService.getRecentSales().catch(() => null),
          ])

          if (fetchedProducts && fetchedProducts.length > 0) {
            for (const p of fetchedProducts) {
              await localDb.products.put(p).catch(() => {})
            }
            setProducts(fetchedProducts)
          } else if (localProducts.length === 0) {
            setProducts([])
          }

          if (fetchedSales && fetchedSales.length > 0) {
            setSales(fetchedSales)
          }
        } catch (networkErr) {
          console.warn('Network error during sync, staying on offline local storage:', networkErr)
        }
      }
    } catch (err: any) {
      setError(err?.message || null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (screen === 'app') {
      loadData()
    }
  }, [screen, loadData])

  // Handlers for real API integration with durable offline-first IndexedDB commits
  const handleAddProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      // 1. Commit durably to local IndexedDB first (works in airplane mode!)
      const savedLocally = await offlineInventory.addProduct(productData)
      setProducts((prev) => [savedLocally, ...prev.filter((p) => p.id !== savedLocally.id)])

      // 2. If online, attempt direct backend creation or let sync queue process it
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        inventoryService.createProduct(productData).catch(() => {
          // Will be pushed by sync queue
        })
      }

      return savedLocally
    } catch (err: any) {
      throw err
    }
  }

  const handleUpdateProduct = async (id: string | number, updates: Partial<Product>) => {
    try {
      const updated = await offlineInventory.updateProduct(id, updates).catch(() => ({
        id,
        ...updates,
      } as Product))

      setProducts((prev) =>
        prev.map((p) => (String(p.id) === String(id) ? { ...p, ...updated } : p))
      )

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        inventoryService.updateProduct(id, updates).catch(() => {})
      }
    } catch (err: any) {
      throw err
    }
  }

  const handleDeleteProduct = async (id: string | number) => {
    try {
      await localDb.products.delete(id).catch(() => {})
      setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)))
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        inventoryService.deleteProduct(id).catch(() => {})
      }
    } catch (err: any) {
      throw err
    }
  }

  const handleRecordSale = async (payload: RecordSalePayload) => {
    const targetProduct = products.find((p) => String(p.id) === String(payload.productId))
    if (!targetProduct) {
      throw new Error('Product not found.')
    }

    try {
      // 1. Commit sale atomically to local IndexedDB (Durable offline-first)
      const localResult = await offlineInventory.recordSale(
        payload.productId,
        payload.quantity,
        payload.unitPrice
      )

      // Update local state immediately
      setProducts((prev) =>
        prev.map((p) =>
          String(p.id) === String(payload.productId)
            ? { ...p, quantity: localResult.updatedStock }
            : p
        )
      )

      const saleTx: SaleTransaction = {
        id: localResult.transaction.id,
        productId: targetProduct.id,
        productName: targetProduct.name,
        quantity: payload.quantity,
        unit: targetProduct.unit,
        amount: localResult.transaction.totalAmount || (payload.unitPrice || targetProduct.price) * payload.quantity,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }

      setSales((prev) => [saleTx, ...prev])

      // 2. If online, notify backend
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        salesService.recordSale(payload).catch(() => {
          // Sync service will handle queue
        })
      }

      return { transaction: saleTx, updatedStock: localResult.updatedStock }
    } catch (err: any) {
      throw err
    }
  }

  const handleRecordStockIn = async (payload: StockInPayload) => {
    const targetProduct = products.find((p) => String(p.id) === String(payload.productId))
    if (!targetProduct) {
      throw new Error('Product not found.')
    }

    try {
      // 1. Commit stock-in atomically to local IndexedDB
      const localResult = await offlineInventory.recordStockIn(
        payload.productId,
        payload.quantity,
        payload.purchaseCost,
        payload.supplier
      )

      setProducts((prev) =>
        prev.map((p) =>
          String(p.id) === String(payload.productId)
            ? { ...p, quantity: localResult.updatedStock }
            : p
        )
      )

      const stockInRecord = {
        id: localResult.transaction.id,
        productId: targetProduct.id,
        productName: targetProduct.name,
        quantity: payload.quantity,
        unit: targetProduct.unit,
        purchaseCost: payload.purchaseCost,
        supplier: payload.supplier,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      }

      if (typeof navigator !== 'undefined' && navigator.onLine) {
        stockInService.recordStockIn(payload).catch(() => {})
      }

      return { record: stockInRecord, updatedStock: localResult.updatedStock }
    } catch (err: any) {
      throw err
    }
  }

  const handleUpdateShop = async (updates: Partial<ShopProfile>) => {
    try {
      const updated = await shopService.updateProfile(updates).catch(() => ({
        id: currentShop?.id || 1,
        shopName: updates.shopName || currentShop?.shopName || 'Apni Dukaan',
        ownerName: updates.ownerName || currentShop?.ownerName || 'Shopkeeper',
        phone: updates.phone || currentShop?.phone || '',
        address: updates.address || currentShop?.address || '',
        currency: '₹',
        defaultLanguage: updates.defaultLanguage || 'en',
      }))
      setCurrentShop(updated)
    } catch (err: any) {
      throw err
    }
  }

  const handleQuickStockIn = (product: Product) => {
    setStockInTargetProduct(product)
    setView('stock-in')
  }

  // Voice execution helper
  const handleVoiceSell = async (product: Product, quantity: number) => {
    await handleRecordSale({
      productId: product.id,
      quantity,
      unitPrice: product.price,
    })
  }

  const handleVoiceStockIn = async (product: Product, quantity: number) => {
    await handleRecordStockIn({
      productId: product.id,
      quantity,
    })
  }

  // --- ANDROID SCREEN ROUTING ---

  const handleOnboardingComplete = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('stocksprint_onboarded', 'true')
    }
    setScreen('app')
  }

  // 1. First-Run Guided Android Onboarding Screen
  if (screen === 'onboarding') {
    return (
      <OnboardingFlow
        onComplete={handleOnboardingComplete}
        onLoginRequest={() => setScreen('login')}
      />
    )
  }

  // 2. Authentication Login Screen
  if (screen === 'login') {
    return (
      <LoginForm
        onBackToHome={() => setScreen('app')}
        onLoginSuccess={() => setScreen('app')}
        onEnterPreview={() => setScreen('app')}
      />
    )
  }

  // 3. Android Application Shell & Views
  return (
    <>
      <AppShell
        currentView={view}
        onNavigate={setView}
        onLogout={() => setScreen('login')}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        onOpenCameraModal={() => setIsCameraModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        user={user}
        shop={currentShop}
      >
        {view === 'dashboard' && (
          <VisualDashboardView
            onNavigate={setView}
            onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
            onOpenCameraModal={() => setIsCameraModalOpen(true)}
            products={products}
            sales={sales}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
            user={user}
            shop={currentShop}
          />
        )}

        {view === 'stock' && (
          <StockView
            products={products}
            isLoading={isLoading}
            error={error}
            onRetry={loadData}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onStockInQuick={handleQuickStockIn}
          />
        )}

        {view === 'sale' && (
          <SaleView
            products={products}
            isLoading={isLoading}
            onRecordSale={handleRecordSale}
            onNavigateToStock={() => setView('stock')}
          />
        )}

        {view === 'stock-in' && (
          <StockInView
            products={products}
            initialProduct={stockInTargetProduct}
            onRecordStockIn={handleRecordStockIn}
            onNavigateToStock={() => setView('stock')}
          />
        )}

        {view === 'reorder' && (
          <ReorderView
            products={products}
            sales={sales}
            isLoading={isLoading}
            onQuickStockIn={handleQuickStockIn}
          />
        )}

        {view === 'slow-moving' && (
          <SlowMovingView
            onRecordSaleQuick={(product) => {
              setView('sale')
            }}
          />
        )}

        {view === 'reports' && (
          <ReportsView
            products={products}
            sales={sales}
            isLoading={isLoading}
            onNavigateToSale={() => setView('sale')}
          />
        )}

        {view === 'settings' && (
          <div className="space-y-4">
            <SettingsView
              user={user}
              shop={currentShop}
              onUpdateShop={handleUpdateShop}
            />
            {/* Quick button to replay guided onboarding */}
            <div className="rounded-3xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-6">
              <h3 className="text-sm font-bold text-[#1c2420] dark:text-white">
                Guided Audio Onboarding Tutorial
              </h3>
              <p className="mt-1 text-xs text-[#6e7f71] dark:text-[#8e9f90]">
                Replay the zero-literacy audio tutorial explaining Maal Jodo and Maal Becho.
              </p>
              <button
                type="button"
                onClick={() => setScreen('onboarding')}
                className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#eaf4ea] dark:bg-[#1a3821] px-4 text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] hover:bg-[#d5ebd7]"
              >
                Replay Onboarding Guide →
              </button>
            </div>
          </div>
        )}
      </AppShell>

      {/* Voice Assistant Modal */}
      <VoiceCommandModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        products={products}
        onExecuteSell={handleVoiceSell}
        onExecuteStockIn={handleVoiceStockIn}
        onViewLowStock={() => setView('reorder')}
      />

      {/* Camera Product Scanner Modal */}
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(photoDataUrl, detectedBarcode) => {
          setView('stock')
        }}
      />

      {/* Offline Synchronization Status Modal */}
      <SyncStatusModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
      />
    </>
  )
}
