'use client'

import {useEffect, useState} from "react";

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const {outcome} = await deferredPrompt.userChoice
    console.log(`User response to install prompt: ${outcome}`)
    setDeferredPrompt(null)
  }

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  return (
      <div className={`absolute bottom-0 right-0 z-50 p-4`}>
        {deferredPrompt && (
            <button
                onClick={handleInstallClick}
                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
            >
              Install App
            </button>
        )}
        {isIOS && (
            <p className="text-sm text-gray-600">
              To install: Tap the <strong>Share</strong> button <span role="img">⎋</span>
              and select <strong>"Add to Home Screen"</strong> <span role="img">➕</span>.
            </p>
        )}
      </div>
  )
}
