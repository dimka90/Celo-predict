"use client";

import { useEffect, useState } from 'react';
import { MINIPAY_CONFIG } from '@/config/minipay';

export default function MiniPayDetection() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if running in MiniPay browser
    const checkMiniPay = () => {
      const inMiniPay = MINIPAY_CONFIG.isInMiniPayBrowser();
      const available = MINIPAY_CONFIG.isMiniPayAvailable();
      
      setIsMiniPay(inMiniPay || available);
      setIsLoading(false);

      if (inMiniPay) {
        console.log('✅ MiniPay detected! Running in MiniPay browser');
        document.documentElement.classList.add('minipay-browser');
      } else if (available) {
        console.log('✅ MiniPay provider available');
        document.documentElement.classList.add('minipay-available');
      } else {
        console.log('ℹ️ MiniPay not available');
      }
    };

    // Check immediately
    checkMiniPay();

    // Also check after a short delay in case window.ethereum is injected later
    const timer = setTimeout(checkMiniPay, 500);
    
    // Listen for ethereum provider injection
    const handleEthereumInjection = () => {
      checkMiniPay();
    };
    
    window.addEventListener('ethereum#initialized', handleEthereumInjection);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('ethereum#initialized', handleEthereumInjection);
    };
  }, []);

  if (isLoading) {
    return null;
  }

  if (!isMiniPay) {
    return null;
  }

  // Show MiniPay badge when detected
  return (
    <div className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg flex items-center gap-2">
      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
      MiniPay Ready
    </div>
  );
}
