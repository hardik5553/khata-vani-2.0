'use client'

import React, { useState, useEffect } from 'react'
import {
  Mic,
  MicOff,
  X,
  Check,
  AlertCircle,
  Volume2,
  Package,
  CircleDollarSign,
  ArrowDownToLine,
  RotateCcw,
} from 'lucide-react'
import { speechService, ParsedVoiceIntent } from '@/lib/voice/speech-service'
import { Product } from '@/lib/api/types'
import { useTranslation } from '@/lib/i18n'

interface VoiceCommandModalProps {
  isOpen: boolean
  onClose: () => void
  products: Product[]
  onExecuteSell: (product: Product, quantity: number) => Promise<void>
  onExecuteStockIn: (product: Product, quantity: number) => Promise<void>
  onViewLowStock: () => void
}

export function VoiceCommandModal({
  isOpen,
  onClose,
  products,
  onExecuteSell,
  onExecuteStockIn,
  onViewLowStock,
}: VoiceCommandModalProps) {
  const { lang, t } = useTranslation()
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [parsedIntent, setParsedIntent] = useState<ParsedVoiceIntent | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [statusText, setStatusText] = useState('Tap the microphone to speak / बोलने के लिए माइक दबाएँ')

  // Start listening automatically when opened
  useEffect(() => {
    if (isOpen) {
      setTranscript('')
      setParsedIntent(null)
      setErrorMessage(null)
      handleStartListening()
    } else {
      speechService.stopSpeaking()
      setIsListening(false)
    }
  }, [isOpen])

  const handleStartListening = () => {
    setErrorMessage(null)
    setParsedIntent(null)
    setTranscript('')
    setIsListening(true)
    setStatusText('Listening... बोलिए (उदा. "5 पैकेट बिस्किट बेचो" या "10 किलो चावल जोड़ो")')

    speechService.startListening(
      lang,
      (text, isFinal) => {
        setTranscript(text)
        if (isFinal) {
          processFinalTranscript(text)
        }
      },
      (err) => {
        setIsListening(false)
        setErrorMessage(err)
        setStatusText('Voice input stopped.')
      },
      () => {
        setIsListening(false)
      }
    )
  }

  const processFinalTranscript = (text: string) => {
    setIsListening(false)
    const intent = speechService.parseVoiceCommand(text, products)
    setParsedIntent(intent)

    if (intent.action === 'sell' && intent.matchedProduct && intent.quantity) {
      const speechMsg = `क्या आप ${intent.quantity} ${intent.unit} ${intent.matchedProduct.name} बेचना चाहते हैं?`
      speechService.speak(speechMsg, lang)
    } else if (intent.action === 'stock-in' && intent.matchedProduct && intent.quantity) {
      const speechMsg = `क्या आप ${intent.quantity} ${intent.unit} ${intent.matchedProduct.name} स्टॉक में जोड़ना चाहते हैं?`
      speechService.speak(speechMsg, lang)
    } else if (intent.action === 'check-low-stock') {
      const speechMsg = 'कम स्टॉक वाले सामान की सूची देख रहे हैं।'
      speechService.speak(speechMsg, lang)
    } else if (intent.action === 'check-stock' && intent.matchedProduct) {
      const speechMsg = `${intent.matchedProduct.name} का वर्तमान स्टॉक ${intent.matchedProduct.quantity} ${intent.matchedProduct.unit} है।`
      speechService.speak(speechMsg, lang)
    } else {
      speechService.speak('माफ़ कीजिए, हम समझ नहीं पाए। कृपया दोबारा बोलें।', lang)
    }
  }

  const handleConfirmIntent = async () => {
    if (!parsedIntent) return
    setIsProcessing(true)

    try {
      if (parsedIntent.action === 'sell' && parsedIntent.matchedProduct && parsedIntent.quantity) {
        await onExecuteSell(parsedIntent.matchedProduct, parsedIntent.quantity)
        speechService.speak('बिक्री सफलतापूर्वक दर्ज हो गई।', lang)
        onClose()
      } else if (parsedIntent.action === 'stock-in' && parsedIntent.matchedProduct && parsedIntent.quantity) {
        await onExecuteStockIn(parsedIntent.matchedProduct, parsedIntent.quantity)
        speechService.speak('स्टॉक जोड़ दिया गया।', lang)
        onClose()
      } else if (parsedIntent.action === 'check-low-stock') {
        onViewLowStock()
        onClose()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Operation failed.')
      speechService.speak('कार्य पूरा नहीं हो सका।', lang)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Voice command assistant"
        className="w-full max-w-md rounded-3xl border border-[#dce3d8] dark:border-[#2e3b32] bg-white dark:bg-[#1c2420] p-6 shadow-2xl transition-all"
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between border-b border-[#edf2ea] dark:border-[#28352b] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#eaf4ea] dark:bg-[#1d3523] text-[#1e6b38] dark:text-[#4ade80]">
              <Volume2 className="size-4.5" />
            </span>
            <span className="text-sm font-black text-[#1c2420] dark:text-white">
              Voice Assistant / आवाज़ सहायक
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-[#6b7c6e] hover:bg-[#f1f5ee] dark:hover:bg-[#28352b]"
            aria-label="Close voice assistant"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Live Status & Transcript */}
        <div className="mt-5 text-center">
          <p className="text-xs font-semibold text-[#5a6b5d] dark:text-[#99ad9d]">
            {statusText}
          </p>

          {/* Transcript Display */}
          <div className="mt-4 min-h-[56px] flex items-center justify-center rounded-2xl border border-dashed border-[#d8e0d4] dark:border-[#354338] bg-[#f9fbf8] dark:bg-[#161c18] p-3 text-sm font-bold text-[#1c2420] dark:text-[#e4efe6]">
            {transcript ? `"${transcript}"` : 'Listening for your command...'}
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 rounded-xl bg-[#fff2f2] dark:bg-[#331515] p-3 text-xs font-semibold text-[#b91c1c] dark:text-[#f87171]">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Large Central Microphone Button (56-64dp touch target with pulse) */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={isListening ? () => setIsListening(false) : handleStartListening}
              className={`relative grid size-20 place-items-center rounded-full transition-all ${
                isListening
                  ? 'bg-[#dc2626] text-white shadow-lg ring-8 ring-[#fee2e2] dark:ring-[#451818] animate-pulse'
                  : 'bg-[#1e6b38] text-white shadow-md hover:bg-[#18552d] active:scale-95'
              }`}
              aria-label={isListening ? 'Stop listening' : 'Start listening'}
            >
              {isListening ? <MicOff className="size-8" /> : <Mic className="size-8" />}
            </button>
          </div>
        </div>

        {/* Parsed Intent Confirmation Card */}
        {parsedIntent && parsedIntent.action !== 'unknown' && (
          <div className="mt-6 rounded-2xl border border-[#bbf7d0] dark:border-[#214c2d] bg-[#f0fdf4] dark:bg-[#142618] p-4 text-left">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534] dark:text-[#4ade80]">
                {parsedIntent.action === 'sell' && 'Confirm Sale / बिक्री की पुष्टि'}
                {parsedIntent.action === 'stock-in' && 'Confirm Stock-In / नया माल पुष्टि'}
                {parsedIntent.action === 'check-stock' && 'Stock Inquiry / स्टॉक जानकारी'}
                {parsedIntent.action === 'check-low-stock' && 'Low Stock Check / कम स्टॉक सूची'}
              </span>
            </div>

            <div className="mt-2 text-sm text-[#14532d] dark:text-[#c7ecd1]">
              {parsedIntent.matchedProduct ? (
                <div>
                  <p className="font-extrabold text-base text-[#0f3d20] dark:text-white">
                    {parsedIntent.matchedProduct.name}
                  </p>
                  <p className="text-xs">
                    Quantity: <strong>{parsedIntent.quantity} {parsedIntent.unit}</strong> • Selling Price: ₹{parsedIntent.matchedProduct.price * (parsedIntent.quantity || 1)}
                  </p>
                </div>
              ) : parsedIntent.action === 'check-low-stock' ? (
                <p className="font-semibold text-xs">
                  Reviewing items below reorder threshold.
                </p>
              ) : (
                <p className="text-xs text-[#dc2626]">
                  Could not confidently match a specific product in your inventory.
                </p>
              )}
            </div>

            {/* Confirmation Actions */}
            <div className="mt-4 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleStartListening}
                className="inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 text-xs font-bold text-[#627364] dark:text-[#9bb0a0] hover:bg-black/5"
              >
                <RotateCcw className="size-3.5" />
                <span>Try Again</span>
              </button>

              <button
                type="button"
                disabled={isProcessing || (parsedIntent.action !== 'check-low-stock' && !parsedIntent.matchedProduct)}
                onClick={handleConfirmIntent}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#1e6b38] px-5 text-sm font-bold text-white shadow-xs hover:bg-[#18552d] disabled:bg-[#a8baa9]"
              >
                <Check className="size-4.5" />
                <span>Confirm Action / पुष्टि करें</span>
              </button>
            </div>
          </div>
        )}

        {/* Suggested Spoken Phrases / Help */}
        <div className="mt-6 border-t border-[#edf2ea] dark:border-[#28352b] pt-3 text-[11px] text-[#718274] dark:text-[#889d8d]">
          <p className="font-bold">Example voice commands:</p>
          <ul className="mt-1 list-disc pl-4 space-y-0.5">
            <li>"5 biscuit becho" (Record Sale)</li>
            <li>"10 kilo chawal jodo" (Stock In)</li>
            <li>"Kaunsa maal mangwana hai?" (Low Stock)</li>
            <li>"Kitna tel bacha hai?" (Stock Check)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
