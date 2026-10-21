'use client'

import React from 'react'
import Image from 'next/image'
import {
  Package,
  CircleDollarSign,
  AlertTriangle,
  ClipboardList,
  BarChart3,
  Wifi,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Store,
  Layers,
  Smartphone,
} from 'lucide-react'
import { BrandLogo } from '../common/BrandLogo'
import { LanguageSelector } from '../common/LanguageSelector'
import { ThemeToggle } from '../common/ThemeToggle'
import { useTranslation } from '@/lib/i18n'

interface LandingPageProps {
  onLoginClick: () => void
  onGetStarted: () => void
  onOpenApp?: () => void
}

export function LandingPage({ onLoginClick, onGetStarted, onOpenApp }: LandingPageProps) {
  const { t } = useTranslation()

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const features = [
    {
      icon: Package,
      title: t('featureStockTitle'),
      description: t('featureStockDesc'),
      color: 'bg-[#eaf4ea] text-[#1e6b38]',
    },
    {
      icon: CircleDollarSign,
      title: t('featureSaleTitle'),
      description: t('featureSaleDesc'),
      color: 'bg-[#eaf4ea] text-[#1e6b38]',
    },
    {
      icon: AlertTriangle,
      title: t('featureAlertsTitle'),
      description: t('featureAlertsDesc'),
      color: 'bg-[#fff3e5] text-[#c27021]',
    },
    {
      icon: ClipboardList,
      title: t('featureReorderTitle'),
      description: t('featureReorderDesc'),
      color: 'bg-[#eaf4ea] text-[#1e6b38]',
    },
    {
      icon: BarChart3,
      title: t('featureReportsTitle'),
      description: t('featureReportsDesc'),
      color: 'bg-[#ebf4ff] text-[#2563eb]',
    },
    {
      icon: Wifi,
      title: t('featureOfflineTitle'),
      description: t('featureOfflineDesc'),
      color: 'bg-[#f1f5ee] text-[#4b5b4e]',
    },
  ]

  const steps = [
    {
      step: '01',
      title: t('step1Title'),
      desc: t('step1Desc'),
      icon: Layers,
    },
    {
      step: '02',
      title: t('step2Title'),
      desc: t('step2Desc'),
      icon: CircleDollarSign,
    },
    {
      step: '03',
      title: t('step3Title'),
      desc: t('step3Desc'),
      icon: Package,
    },
    {
      step: '04',
      title: t('step4Title'),
      desc: t('step4Desc'),
      icon: ClipboardList,
    },
  ]

  return (
    <div className="min-h-screen bg-[#f7f8f4] text-[#1c2420]">
      {/* 0. Android PWA Banner */}
      <div className="bg-[#1e6b38] px-4 py-2 text-center text-xs font-bold text-white flex items-center justify-center gap-3">
        <Smartphone className="size-4 shrink-0" />
        <span>Android-Ready Kirana App: Works offline in airplane mode & renders in Android phone format</span>
        {onOpenApp && (
          <button
            type="button"
            onClick={onOpenApp}
            className="rounded-lg bg-white px-2.5 py-0.5 text-xs font-black text-[#1e6b38] hover:bg-[#eaf4ea] transition-all"
          >
            Launch Phone App →
          </button>
        )}
      </div>

      {/* 1. Header */}
      <header className="sticky top-0 z-30 border-b border-[#e2e8de] bg-[#f7f8f4]/95 px-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between">
          <BrandLogo />

          {/* Nav Links */}
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#5a6a5d] md:flex">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="transition hover:text-[#1e6b38]"
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="transition hover:text-[#1e6b38]"
            >
              {t('navFeatures')}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="transition hover:text-[#1e6b38]"
            >
              {t('navHowItWorks')}
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="transition hover:text-[#1e6b38]"
            >
              {t('navAbout')}
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <ThemeToggle variant="compact" />
            <LanguageSelector />
            <button
              onClick={onLoginClick}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#1e6b38] px-5 text-sm font-bold text-white shadow-xs transition hover:bg-[#18552d] focus-visible:ring-2 focus-visible:ring-[#1e6b38] focus-visible:ring-offset-2"
            >
              {t('navLogin')}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden border-b border-[#e5ebe0] py-20 sm:py-28 lg:py-32">
        {/* Subtle Background Image with strict 4% opacity + heavy cream overlay */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <Image
            src="/images/kirana-hero-bg.jpg"
            alt="Indian retail kirana background"
            fill
            className="object-cover opacity-[0.04] saturate-50"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f7f8f4]/90 via-[#f7f8f4]/95 to-[#f7f8f4]" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d6e0d3] bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#1e6b38] shadow-xs">
            <Store className="size-3.5" />
            <span>Designed for Indian Kirana & Retail Dukaan</span>
          </div>

          <h1 className="mt-6 text-4xl font-black tracking-tight text-[#1c2420] sm:text-5xl md:text-6xl">
            {t('heroHeadline')}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-[#57685a] sm:text-lg">
            {t('heroSubtitle')}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3.5 sm:flex-row">
            {onOpenApp && (
              <button
                onClick={onOpenApp}
                className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] px-7 text-base font-bold text-white shadow-sm transition hover:bg-[#1d4ed8] sm:w-auto"
              >
                <Smartphone className="size-4.5" />
                <span>Launch Android App (सीधे ऐप खोलें)</span>
              </button>
            )}
            <button
              onClick={onGetStarted}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#1e6b38] px-8 text-base font-bold text-white shadow-sm transition hover:bg-[#18552d] sm:w-auto"
            >
              <span>{t('heroCtaPrimary')}</span>
              <ArrowRight className="size-4" />
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border border-[#d3ded0] bg-white px-7 text-base font-bold text-[#354338] shadow-2xs transition hover:bg-[#f2f6f0] sm:w-auto"
            >
              {t('heroCtaSecondary')}
            </button>
          </div>

          {/* Quick value badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#687a6b]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#1e6b38]" /> No complicated training needed
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#1e6b38]" /> Works on mobile & desktop
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-[#1e6b38]" /> Clean Indian retail units (kg, pkt, litre)
            </span>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#1e6b38]">
              {t('brandTagline')}
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#1c2420] sm:text-4xl">
              {t('navFeatures')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#617264] sm:text-base">
              Every tool in StockSprint is designed around real counter workflows at small stores.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="group flex flex-col justify-between rounded-2xl border border-[#e2e8de] bg-white p-6 shadow-xs transition hover:border-[#ccd7c8] hover:shadow-md"
                >
                  <div>
                    <div className={`grid size-12 place-items-center rounded-xl ${feat.color}`}>
                      <Icon className="size-6" />
                    </div>
                    <h3 className="mt-5 text-lg font-bold text-[#1c2420]">
                      {feat.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#627365]">
                      {feat.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-[#e2e8de] bg-[#f1f5ee] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-black tracking-tight text-[#1c2420] sm:text-4xl">
              {t('howItWorksTitle')}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-[#5d6e60] sm:text-base">
              {t('howItWorksSubtitle')}
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((st, i) => {
              const Icon = st.icon
              return (
                <div
                  key={i}
                  className="relative rounded-2xl border border-[#dce3d7] bg-white p-6 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-[#1e6b38]/30">
                      {st.step}
                    </span>
                    <div className="grid size-10 place-items-center rounded-xl bg-[#eaf4ea] text-[#1e6b38]">
                      <Icon className="size-5" />
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-[#1c2420]">
                    {st.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#667769]">
                    {st.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. About Section */}
      <section id="about" className="scroll-mt-20 border-t border-[#e2e8de] py-18 sm:py-22">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf4ea] text-[#1e6b38]">
            <ShieldCheck className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-black tracking-tight text-[#1c2420] sm:text-3xl">
            Built for Local Retailers
          </h2>
          <p className="mt-4 text-base leading-relaxed text-[#5e7061]">
            StockSprint replaces paper registers and complex enterprise software with a clean,
            dependable tool that works smoothly on everyday smartphones and counter computers.
            No fake promises, no confusing menus—just pure inventory and sales control.
          </p>
          <div className="mt-8">
            <button
              onClick={onGetStarted}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#1e6b38] px-7 text-sm font-bold text-white shadow-xs transition hover:bg-[#18552d]"
            >
              <span>{t('heroCtaPrimary')}</span>
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-[#e2e8de] bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="max-w-sm">
              <BrandLogo />
              <p className="mt-3 text-xs leading-relaxed text-[#68796b]">
                {t('footerDescription')}
              </p>
            </div>

            <div className="flex flex-wrap gap-12 text-sm">
              <div>
                <p className="font-bold text-[#1c2420]">{t('footerQuickLinks')}</p>
                <div className="mt-3 flex flex-col gap-2 text-xs text-[#5f7162]">
                  <button onClick={() => scrollToSection('features')} className="text-left hover:text-[#1e6b38]">
                    {t('navFeatures')}
                  </button>
                  <button onClick={() => scrollToSection('how-it-works')} className="text-left hover:text-[#1e6b38]">
                    {t('navHowItWorks')}
                  </button>
                  <button onClick={onLoginClick} className="text-left hover:text-[#1e6b38]">
                    {t('navLogin')}
                  </button>
                </div>
              </div>

              <div>
                <p className="font-bold text-[#1c2420]">{t('footerLegal')}</p>
                <div className="mt-3 flex flex-col gap-2 text-xs text-[#8c9c8f]">
                  <span className="cursor-not-allowed">{t('footerPrivacy')}</span>
                  <span className="cursor-not-allowed">{t('footerTerms')}</span>
                </div>
              </div>

              <div>
                <p className="font-bold text-[#1c2420]">Language / भाषा</p>
                <div className="mt-3">
                  <LanguageSelector variant="inline" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-[#edf2ea] pt-6 text-center text-xs text-[#8c9c8f]">
            © {new Date().getFullYear()} StockSprint. {t('footerRights')}
          </div>
        </div>
      </footer>
    </div>
  )
}
