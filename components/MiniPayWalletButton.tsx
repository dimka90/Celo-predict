"use client";

import { useEffect, useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { MINIPAY_CONFIG } from '@/config/minipay';
import { toast } from 'react-hot-toast';

export default function MiniPayWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const [isMiniPayAvailable, setIsMiniPayAvailable] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if MiniPay is available
    const checkMiniPay = () => {
      const available = MINIPAY_CONFIG.isMiniPayAvailable();
      setIsMiniPayAvailable(available);
      
      if (available) {
        console.log('✅ MiniPay wallet is available for connection');
      }
    };

    checkMiniPay();

    // Check again after a delay
    const timer = setTimeout(checkMiniPay, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleMiniPayConnect = async () => {
    try {
      setIsConnecting(true);
      
      // Get the injected connector (which MiniPay uses)
      const injectedConnector = connectors.find(
        (connector) => connector.id === 'injected'
      );

      if (!injectedConnector) {
        toast.error('Injected wallet connector not found');
        return;
      }

      // Connect using the injected connector
      connect({ connector: injectedConnector });
      
      toast.success('Connecting to MiniPay...');
    } catch (error) {
      console.error('MiniPay connection error:', error);
      toast.error('Failed to connect to MiniPay');
    } finally {
      setIsConnecting(false);
    }
  };

  // Don't show button if not available or already connected
  if (!isMiniPayAvailable || isConnected) {
    return null;
  }

  return (
    <button
      onClick={handleMiniPayConnect}
      disabled={isConnecting}
      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
    >
      <span className="text-xl">💳</span>
      <span>{isConnecting ? 'Connecting...' : 'Connect with MiniPay'}</span>
    </button>
  );
}
