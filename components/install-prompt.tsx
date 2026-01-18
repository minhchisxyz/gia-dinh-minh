'use client'

import {useEffect, useState} from "react";
import {Button} from "@/components/ui/button";
import {Download, EyeOff} from "lucide-react";

const INSTALL_PROMPT_EXPIRATION_KEY = 'install-prompt-expiration'
const DAYS_TO_WAIT = 7

export default function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsIOS(
        /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

    const expirationDateStr = localStorage.getItem(INSTALL_PROMPT_EXPIRATION_KEY)
    if (expirationDateStr) {
      const expirationDate = new Date(expirationDateStr)
      if (new Date() < expirationDate) return
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      setIsVisible(true)
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const {outcome} = await deferredPrompt.userChoice
    console.log(`User choice was ${outcome}.`)
    setDeferredPrompt(null)
  }

  const handleHideClick = () => {
    localStorage.setItem(INSTALL_PROMPT_EXPIRATION_KEY, new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * DAYS_TO_WAIT).toISOString())
    setIsVisible(false)
  }

  if (isStandalone || !isVisible) {
    return null // Don't show install button if already installed
  }

  return (
      <div className={`w-64 absolute bottom-2 right-2 z-50 p-4 flex flex-col bg-white rounded-lg border border-gray-200 gap-2`}>
        <span>
          Tải app để tiện theo dõi hơn
        </span>
        <div className={`flex flex-row justify-between`}>
          {deferredPrompt && (
              <Button
                  onClick={handleInstallClick}
                  variant={`default`}
                  size={`sm`}
              >
                <Download/>
                Tải xuống
              </Button>
          )}
          {isIOS && (
              <p className="text-sm text-gray-600 mt-2">
                Để cài đặt: Nhấn vào nút <strong>Chia sẻ</strong> <span role="img" aria-label="share icon">⎋</span>
                sau đó chọn <strong>"Thêm vào MH chính"</strong> <span role="img" aria-label="plus icon">➕</span>.
              </p>
          )}
          <Button variant={`outline`}
                  size={`sm`}
                  onClick={handleHideClick}>
            <EyeOff/>
            Ẩn
          </Button>
        </div>
      </div>
  )
}
