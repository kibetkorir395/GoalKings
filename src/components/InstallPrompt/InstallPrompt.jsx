import { useEffect, useState } from 'react';
import { FiX, FiDownload } from 'react-icons/fi';
import './InstallPrompt.scss';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                      window.navigator.standalone ||
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    if (standalone) return;

    // Check for iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const lastPrompt = localStorage.getItem('pwa-prompt-last-shown');
    const now = Date.now();

    // Show prompt again after 7 days if dismissed
    const shouldShowPrompt = !dismissed || (lastPrompt && now - parseInt(lastPrompt) > 7 * 24 * 60 * 60 * 1000);

    if (!shouldShowPrompt) return;

    // Listen for the beforeinstallprompt event (Android/Desktop)
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // For iOS, show prompt after a delay
    if (iOS) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
    localStorage.setItem('pwa-prompt-last-shown', Date.now().toString());
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="install-prompt">
      <div className="install-content">
        <button className="close-btn" onClick={handleDismiss} aria-label="Close">
          <FiX />
        </button>
        <div className="install-icon">
          <FiDownload />
        </div>
        <div className="install-text">
          <h3>Install Goal Kings</h3>
          <p>
            {isIOS
              ? 'Tap the share button and then "Add to Home Screen" for the best experience.'
              : 'Install our app for faster access, offline tips, and a better experience!'}
          </p>
        </div>
        {!isIOS && deferredPrompt && (
          <button className="install-btn" onClick={handleInstall}>
            Install Now
          </button>
        )}
        {isIOS && (
          <div className="ios-instructions">
            <span className="ios-step">1. Tap the share icon</span>
            <span className="ios-step">2. Select "Add to Home Screen"</span>
          </div>
        )}
      </div>
    </div>
  );
}
