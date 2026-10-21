'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock, User, ArrowLeft, AlertCircle, Info } from 'lucide-react'
import { BrandLogo } from '../common/BrandLogo'
import { LanguageSelector } from '../common/LanguageSelector'
import { AndroidDeviceFrame } from '../layout/AndroidDeviceFrame'
import { useTranslation } from '@/lib/i18n'
import { authService } from '@/lib/api/auth'

interface LoginFormProps {
  onBackToHome: () => void
  onLoginSuccess: () => void
  onEnterPreview?: () => void
}

export function LoginForm({ onBackToHome, onLoginSuccess, onEnterPreview }: LoginFormProps) {
  const { t } = useTranslation()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!identifier.trim()) {
      setErrorMessage(t('loginIdentifierLabel') + ' is required.')
      return
    }

    if (!password) {
      setErrorMessage(t('loginPasswordLabel') + ' is required.')
      return
    }

    setIsLoading(true)

    try {
      // Connect to real auth service interface
      const res = await authService.login({
        identifier,
        password,
        rememberMe,
      })

      if (res && res.token) {
        onLoginSuccess()
      }
    } catch (err: any) {
      // Backend not connected or failed authentication
      setErrorMessage(
        err.message ||
          'Authentication service is ready, but no live backend responded. Please connect the backend auth service.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AndroidDeviceFrame onBackPress={onBackToHome}>
      <div className="flex min-h-full flex-col justify-between bg-[#f7f8f4] dark:bg-[#121614] px-4 py-8 text-[#1c2420] dark:text-[#e4efe6] sm:px-6">
        {/* Top Bar */}
        <div className="mx-auto flex w-full max-w-md items-center justify-between">
        <button
          type="button"
          onClick={onBackToHome}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl text-xs font-bold text-[#5e6f62] transition hover:text-[#1c2420]"
        >
          <ArrowLeft className="size-4" />
          <span>{t('loginBackHome')}</span>
        </button>

        <LanguageSelector />
      </div>

      {/* Main Login Card */}
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-[#e2e8de] bg-white p-7 shadow-xs sm:p-9">
          <div className="flex flex-col items-center text-center">
            <BrandLogo showTagline={false} />
            <h1 className="mt-5 text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
              {t('loginWelcome')}
            </h1>
            <p className="mt-1.5 text-xs text-[#687a6b]">
              {t('loginSubtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-4.5">
            {/* Error Message */}
            {errorMessage && (
              <div
                className="flex items-start gap-2.5 rounded-xl border border-[#fed7aa] bg-[#fffaf5] p-3 text-xs text-[#9a3412]"
                role="alert"
              >
                <AlertCircle className="size-4 shrink-0 text-[#ea580c] mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Identifier (Phone or Email) */}
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-[#3d4d40]"
              >
                {t('loginIdentifierLabel')}
              </label>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88998b]">
                  <User className="size-4" />
                </span>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('loginIdentifierPlaceholder')}
                  autoComplete="username"
                  required
                  className="min-h-[48px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] pl-10 pr-4 text-sm font-medium text-[#1c2420] outline-none transition focus:border-[#1e6b38] focus:bg-white focus:ring-2 focus:ring-[#1e6b38]/20"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-[#3d4d40]"
                >
                  {t('loginPasswordLabel')}
                </label>
                <span
                  className="cursor-pointer text-xs font-semibold text-[#1e6b38] hover:underline"
                  title="Password reset endpoint integration point"
                >
                  {t('loginForgotPassword')}
                </span>
              </div>
              <div className="relative mt-1.5">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#88998b]">
                  <Lock className="size-4" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('loginPasswordPlaceholder')}
                  autoComplete="current-password"
                  required
                  className="min-h-[48px] w-full rounded-xl border border-[#d8e0d4] bg-[#fafbf9] pl-10 pr-11 text-sm font-medium text-[#1c2420] outline-none transition focus:border-[#1e6b38] focus:bg-white focus:ring-2 focus:ring-[#1e6b38]/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#88998b] hover:text-[#1c2420]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-[#d8e0d4] text-[#1e6b38] focus:ring-[#1e6b38]"
              />
              <label
                htmlFor="rememberMe"
                className="ml-2.5 text-xs font-medium text-[#5f7162]"
              >
                {t('loginRememberMe')}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-[#1e6b38] text-sm font-bold text-white shadow-xs transition hover:bg-[#18552d] disabled:cursor-not-allowed disabled:bg-[#a3b8a7]"
            >
              {isLoading ? t('loginLoading') : t('loginSubmit')}
            </button>
          </form>

          {/* Backend Status Disclaimer */}
          <div className="mt-6 flex items-start gap-2 rounded-xl bg-[#f2f6f0] p-3 text-xs text-[#526455]">
            <Info className="size-4 shrink-0 text-[#1e6b38] mt-0.5" />
            <span>{t('loginBackendNotice')}</span>
          </div>

          {/* Direct Frontend UI Inspection Link (Clean, No Fake Data) */}
          {onEnterPreview && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onEnterPreview}
                className="text-xs font-bold text-[#1e6b38] hover:underline"
              >
                Proceed to App UI Structure (Inspect Skeletons & Empty States) →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="mx-auto w-full max-w-md text-center text-xs text-[#8d9e90]">
        StockSprint • Smart Stock. Faster Business.
      </div>
    </div>
  </AndroidDeviceFrame>
  )
}
