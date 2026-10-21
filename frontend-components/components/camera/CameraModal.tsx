'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Camera,
  X,
  RotateCcw,
  Check,
  Barcode,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
} from 'lucide-react'

interface CameraModalProps {
  isOpen: boolean
  onClose: () => void
  onCapture: (photoDataUrl: string, detectedBarcode?: string) => void
}

export function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [detectedBarcode, setDetectedBarcode] = useState<string | null>(null)
  const [permissionError, setPermissionError] = useState<string | null>(null)
  const [isScanningBarcode, setIsScanningBarcode] = useState(false)

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      setCapturedPhoto(null)
      setDetectedBarcode(null)
      setPermissionError(null)
    }
    return () => {
      stopCamera()
    }
  }, [isOpen])

  const [currentFacingMode, setCurrentFacingMode] = useState<'environment' | 'user'>('environment')

  const startCamera = async () => {
    setPermissionError(null)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionError('Camera API is not supported in this browser environment. Use photo upload below.')
      return
    }

    try {
      let mediaStream: MediaStream | null = null
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentFacingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        })
      } catch (constraintErr) {
        // Fallback to basic video constraint (essential for desktop webcams)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })
      }

      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(console.warn)
        }
      }
      initBarcodeScanner(mediaStream)
    } catch (err: any) {
      console.warn('Camera access error:', err)
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError(
          'कैमरा अनुमति अस्वीकृत है / Camera permission was denied. Please allow camera in browser or use the file upload below.'
        )
      } else {
        setPermissionError('वेबकैम शुरू नहीं हो सका / Could not start camera on this device. (Use instant buttons or photo upload)')
      }
    }
  }

  const toggleFacingMode = () => {
    stopCamera()
    setCurrentFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }

  const initBarcodeScanner = (mediaStream: MediaStream) => {
    if (typeof window === 'undefined' || !('BarcodeDetector' in window)) {
      return // Barcode detector not supported natively
    }

    setIsScanningBarcode(true)
    const detector = new (window as any).BarcodeDetector({
      formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
    })

    const interval = setInterval(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) return
      try {
        const barcodes = await detector.detect(videoRef.current)
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue
          setDetectedBarcode(code)
          clearInterval(interval)

          // Auto-click and capture frame automatically
          const canvas = document.createElement('canvas')
          canvas.width = videoRef.current.videoWidth || 640
          canvas.height = videoRef.current.videoHeight || 480
          const ctx = canvas.getContext('2d')
          let photoUrl = ''
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
            photoUrl = canvas.toDataURL('image/jpeg', 0.85)
          }

          stopCamera()
          onCapture(photoUrl, code)
          onClose()
        }
      } catch {
        // Continuous detection pass
      }
    }, 400)

    return () => clearInterval(interval)
  }

  const handleTakePhoto = () => {
    if (!videoRef.current) return
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth || 640
    canvas.height = videoRef.current.videoHeight || 480
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
      setCapturedPhoto(dataUrl)
      stopCamera()
    }
  }

  const handleRetake = () => {
    setCapturedPhoto(null)
    setDetectedBarcode(null)
    startCamera()
  }

  const handleConfirm = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto, detectedBarcode || undefined)
      onClose()
    }
  }

  // Fallback file input for Android devices where getUserMedia might be restricted
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setCapturedPhoto(result)
        stopCamera()
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Camera scanner"
        className="w-full max-w-md rounded-3xl border border-[#354338] bg-[#161c18] text-white p-5 shadow-2xl flex flex-col justify-between max-h-[92vh] overflow-hidden"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between border-b border-[#28352b] pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-8 place-items-center rounded-lg bg-[#25382b] text-[#4ade80]">
              <Camera className="size-4.5" />
            </span>
            <span className="text-sm font-bold">
              Product Camera & Barcode
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-xl text-[#9bb0a0] hover:bg-[#28352b]"
            aria-label="Close camera"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Viewfinder / Preview Screen */}
        <div className="relative mt-4 flex-1 min-h-[300px] overflow-hidden rounded-2xl bg-black flex items-center justify-center">
          {permissionError ? (
            <div className="p-6 text-center text-xs text-[#f87171] space-y-4">
              <AlertCircle className="mx-auto size-8 text-[#ef4444]" />
              <p>{permissionError}</p>
              {/* Native file upload fallback */}
              <div>
                <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-2 rounded-xl bg-[#2e3b32] px-4 py-2 text-xs font-bold text-white hover:bg-[#3d4e41]">
                  <ImageIcon className="size-4" />
                  <span>Choose Photo from Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : capturedPhoto ? (
            <img
              src={capturedPhoto}
              alt="Captured product"
              className="w-full h-full object-contain"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Viewfinder crosshairs */}
              <div className="pointer-events-none absolute inset-6 border-2 border-dashed border-white/50 rounded-2xl flex items-center justify-center">
                <span className="bg-black/50 px-3 py-1 rounded-full text-[11px] text-white/80">
                  Align product / barcode here
                </span>
              </div>
            </>
          )}

          {/* Barcode badge if detected */}
          {detectedBarcode && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#166534] px-3 py-1 text-xs font-bold text-white shadow-lg">
              <Barcode className="size-3.5" />
              <span>Barcode: {detectedBarcode}</span>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="mt-4 pt-3 border-t border-[#28352b] flex items-center justify-between">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#28352b] px-4 text-xs font-bold text-white hover:bg-[#344638]"
              >
                <RotateCcw className="size-4" />
                <span>Retake / दोबारा लें</span>
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex min-h-[48px] items-center gap-2 rounded-xl bg-[#1e6b38] px-6 text-sm font-bold text-white shadow-md hover:bg-[#18552d]"
              >
                <Check className="size-5" />
                <span>Use Photo / इस्तेमाल करें</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center gap-6">
              {/* Native Gallery Upload */}
              <label
                className="grid size-12 place-items-center rounded-2xl bg-[#28352b] text-[#c4d6c7] cursor-pointer hover:bg-[#344638]"
                title="Select from gallery"
                aria-label="Upload photo from phone gallery"
              >
                <ImageIcon className="size-5" />
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>

              {/* Shutter Button (56-64dp touch target) */}
              <button
                type="button"
                onClick={handleTakePhoto}
                disabled={Boolean(permissionError)}
                className="grid size-16 place-items-center rounded-full bg-white text-[#1c2420] shadow-xl ring-4 ring-white/20 active:scale-95 transition-transform disabled:opacity-50"
                aria-label="Take photo"
              >
                <div className="size-12 rounded-full border-2 border-black" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
