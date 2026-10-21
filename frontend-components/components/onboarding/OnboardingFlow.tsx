'use client'

import React, { useState } from 'react'
import {
  Store,
  Languages,
  Volume2,
  Package,
  CircleDollarSign,
  ClipboardList,
  Camera,
  Mic,
  ArrowRight,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { BrandLogo } from '../common/BrandLogo'
import { AndroidDeviceFrame } from '../layout/AndroidDeviceFrame'
import { useTranslation, Language } from '@/lib/i18n'
import { speechService, LANGUAGE_SPEECH_MAP } from '@/lib/voice/speech-service'

interface OnboardingFlowProps {
  onComplete: () => void
  onLoginRequest: () => void
}

export function OnboardingFlow({ onComplete, onLoginRequest }: OnboardingFlowProps) {
  const { lang, setLang } = useTranslation()
  const [step, setStep] = useState<number>(1) // 1: Welcome, 2: Language, 3: Audio Tutorial, 4: Permissions

  const indianLanguages: { id: Language; name: string; nativeName: string }[] = [
    { id: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
    { id: 'en', name: 'English', nativeName: 'English' },
    { id: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
    { id: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
    { id: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
    { id: 'mr', name: 'Marathi', nativeName: 'मराठी' },
    { id: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
    { id: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
    { id: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    { id: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
    { id: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
    { id: 'ur', name: 'Urdu', nativeName: 'اردو' },
  ]

  const handlePreviewAudio = (e: React.MouseEvent, l: string) => {
    e.stopPropagation()
    speechService.playLanguagePreview(l)
  }

  const handlePlayTutorialAudio = () => {
    const tutorialText =
      'स्टॉकस्प्रिंट में आप बोलकर या छूकर माल बेच सकते हैं, नया स्टॉक जोड़ सकते हैं, और कम स्टॉक वाले सामान का अलर्ट पा सकते हैं।'
    speechService.speak(tutorialText, lang)
  }

  return (
    <AndroidDeviceFrame
      onBackPress={step > 1 ? () => setStep(step - 1) : onLoginRequest}
    >
      <div className="flex min-h-full flex-col justify-between bg-[#f7f8f4] dark:bg-[#121614] text-[#1c2420] dark:text-[#e4efe6] px-4 py-6 sm:px-6">
        {/* Top Bar with Step Indicators & Skip */}
        <div className="mx-auto flex w-full max-w-lg items-center justify-between">
        <BrandLogo compact />
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === step
                  ? 'w-6 bg-[#1e6b38] dark:bg-[#4ade80]'
                  : i < step
                  ? 'w-2 bg-[#829986]'
                  : 'w-2 bg-[#dce3d8] dark:bg-[#28352b]'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="text-xs font-bold text-[#5c6e60] dark:text-[#9bb0a0] hover:text-[#1c2420] dark:hover:text-white"
        >
          Skip / छोड़ें
        </button>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto w-full max-w-lg my-auto py-6">
        {/* Step 1: Welcome Screen with Kirana Illustration */}
        {step === 1 && (
          <div className="text-center space-y-6">
            {/* Simple Kirana Shop SVG Illustration */}
            <div className="mx-auto w-48 h-40 flex items-center justify-center">
              <svg viewBox="0 0 200 160" className="w-full h-full drop-shadow-sm" fill="none">
                {/* Shop Roof */}
                <polygon points="100,20 20,65 180,65" className="fill-[#1e6b38] dark:fill-[#2d8c4e]" />
                <rect x="25" y="60" width="150" height="10" rx="3" className="fill-[#d69e2e]" />
                {/* Building Walls */}
                <rect x="35" y="70" width="130" height="80" rx="4" className="fill-white dark:fill-[#1e2721] stroke-[#e2e8de] dark:stroke-[#334237]" strokeWidth="2" />
                {/* Door & Display Counter */}
                <rect x="80" y="95" width="40" height="55" rx="3" className="fill-[#8c7456] dark:fill-[#5c4933]" />
                <rect x="45" y="85" width="28" height="35" rx="2" className="fill-[#eaf4ea] dark:fill-[#25382b]" />
                <rect x="127" y="85" width="28" height="35" rx="2" className="fill-[#eaf4ea] dark:fill-[#25382b]" />
                {/* Signboard */}
                <rect x="60" y="45" width="80" height="16" rx="3" className="fill-white dark:fill-[#2c382f]" />
                <text x="100" y="57" textAnchor="middle" className="text-[10px] font-black fill-[#1e6b38] dark:fill-[#4ade80]">APNI DUKAAN</text>
              </svg>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf4ea] dark:bg-[#1a3821] px-3.5 py-1 text-xs font-bold text-[#1e6b38] dark:text-[#4ade80]">
                <Sparkles className="size-3.5" /> Made for Indian Kirana & Retail
              </span>
              <h1 className="mt-4 text-3xl font-black tracking-tight text-[#1c2420] dark:text-white">
                StockSprint
              </h1>
              <p className="mt-2 text-sm text-[#5f7062] dark:text-[#9fb2a4] max-w-sm mx-auto">
                No complex forms or typing. Speak or tap to manage your inventory, record sales, and keep shelves full.
              </p>
            </div>

            <div className="pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1e6b38] text-base font-bold text-white shadow-md hover:bg-[#18552d] active:scale-95 transition-all"
              >
                <span>Choose Language / भाषा चुनें</span>
                <ArrowRight className="size-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Language Selection with Speaker Preview */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#eaf4ea] dark:bg-[#1a3821] text-[#1e6b38] dark:text-[#4ade80]">
                <Languages className="size-6" />
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-[#1c2420] dark:text-white">
                Select Your Language
              </h2>
              <p className="mt-1 text-xs text-[#5f7062] dark:text-[#9fb2a4]">
                अपनी भाषा चुनें • Tap speaker icon to hear audio preview
              </p>
            </div>

            {/* Language Grid */}
            <div className="grid grid-cols-2 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
              {indianLanguages.map((l) => {
                const isSelected = lang === l.id
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => {
                      setLang(l.id)
                      speechService.playLanguagePreview(l.id)
                    }}
                    className={`flex min-h-[56px] items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                      isSelected
                        ? 'border-[#1e6b38] dark:border-[#4ade80] bg-[#eaf4ea] dark:bg-[#172e1e] shadow-xs'
                        : 'border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] hover:bg-[#f3f7f1] dark:hover:bg-[#253229]'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-extrabold text-[#1c2420] dark:text-white">
                        {l.nativeName}
                      </p>
                      <p className="text-[11px] text-[#6b7b6e] dark:text-[#8b9e90]">
                        {l.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handlePreviewAudio(e, l.id)}
                      className="grid size-9 place-items-center rounded-xl bg-black/5 dark:bg-white/10 text-[#1e6b38] dark:text-[#4ade80] hover:scale-105"
                      title={`Preview ${l.name} audio`}
                      aria-label={`Preview spoken ${l.name}`}
                    >
                      <Volume2 className="size-4" />
                    </button>
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              onClick={() => setStep(3)}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1e6b38] text-base font-bold text-white shadow-md hover:bg-[#18552d]"
            >
              <span>Continue / आगे बढ़ें</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        )}

        {/* Step 3: Audio Guided Tutorial */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-black text-[#1c2420] dark:text-white">
                How It Works / कैसे काम करता है
              </h2>
              <p className="mt-1 text-xs text-[#5f7062] dark:text-[#9fb2a4]">
                3 simple actions for everyday shopkeeper workflows
              </p>
              <button
                type="button"
                onClick={handlePlayTutorialAudio}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#eaf4ea] dark:bg-[#1a3821] px-4 py-1.5 text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] shadow-xs hover:scale-105 transition-transform"
              >
                <Volume2 className="size-4" />
                <span>Listen Audio Guide / आवाज़ सुनें</span>
              </button>
            </div>

            <div className="space-y-3">
              {/* Card 1 */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-4">
                <div className="grid size-12 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1d3523] text-[#1e6b38] dark:text-[#4ade80]">
                  <CircleDollarSign className="size-6" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-[#1c2420] dark:text-white">
                    1. Maal Becho (Sell Goods)
                  </p>
                  <p className="text-xs text-[#637566] dark:text-[#92a696]">
                    Tap product, choose quantity, confirm sale. Stock updates instantly.
                  </p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-4">
                <div className="grid size-12 place-items-center rounded-xl bg-[#eff6ff] dark:bg-[#17253b] text-[#2563eb] dark:text-[#60a5fa]">
                  <Package className="size-6" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-[#1c2420] dark:text-white">
                    2. Maal Jodo (Add / Receive Stock)
                  </p>
                  <p className="text-xs text-[#637566] dark:text-[#92a696]">
                    Take product photo or speak name to add items to shelves.
                  </p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="flex items-center gap-3.5 rounded-2xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-4">
                <div className="grid size-12 place-items-center rounded-xl bg-[#fff7ed] dark:bg-[#331c0e] text-[#ea580c] dark:text-[#fb923c]">
                  <ClipboardList className="size-6" />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-[#1c2420] dark:text-white">
                    3. Maal Khatam Hone Wala (Low Stock)
                  </p>
                  <p className="text-xs text-[#637566] dark:text-[#92a696]">
                    Clear visual shelf alerts warn you before goods run out.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1e6b38] text-base font-bold text-white shadow-md hover:bg-[#18552d]"
            >
              <span>Next: Device Permissions / आगे</span>
              <ArrowRight className="size-5" />
            </button>
          </div>
        )}

        {/* Step 4: Device Permissions Explanation */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <h2 className="text-2xl font-black text-[#1c2420] dark:text-white">
              Device Permissions
            </h2>
            <p className="text-xs text-[#5f7062] dark:text-[#9fb2a4] max-w-sm mx-auto">
              StockSprint uses your device camera and microphone only when you ask it to take a photo or listen to a command.
            </p>

            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3.5 rounded-2xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-4">
                <div className="grid size-10 place-items-center rounded-xl bg-[#eaf4ea] dark:bg-[#1d3523] text-[#1e6b38] dark:text-[#4ade80]">
                  <Mic className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1c2420] dark:text-white">Microphone (माइक)</p>
                  <p className="text-xs text-[#637566] dark:text-[#92a696]">Used to speak commands like "5 packet biscuit becho".</p>
                </div>
              </div>

              <div className="flex items-start gap-3.5 rounded-2xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-4">
                <div className="grid size-10 place-items-center rounded-xl bg-[#eff6ff] dark:bg-[#17253b] text-[#2563eb] dark:text-[#60a5fa]">
                  <Camera className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-sm text-[#1c2420] dark:text-white">Camera (कैमरा)</p>
                  <p className="text-xs text-[#637566] dark:text-[#92a696]">Used to capture product photos and scan barcodes.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="button"
                onClick={onComplete}
                className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[#1e6b38] text-base font-bold text-white shadow-md hover:bg-[#18552d]"
              >
                <Check className="size-5" />
                <span>Enter App Dashboard / दुकान शुरू करें</span>
              </button>

              <button
                type="button"
                onClick={onLoginRequest}
                className="text-xs font-bold text-[#1e6b38] dark:text-[#4ade80] hover:underline"
              >
                Already have a shop account? Log In →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Note */}
      <div className="mx-auto w-full max-w-lg text-center text-xs text-[#8a9b8d] dark:text-[#5f7163]">
        StockSprint • Zero-Literacy Android Retail Assistant
      </div>
    </div>
  </AndroidDeviceFrame>
  )
}
