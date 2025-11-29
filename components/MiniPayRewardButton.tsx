"use client";

import { useState } from "react";
import { useMiniPayRewards } from "@/hooks/useMiniPay";
import { GiftIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import Button from "./button";

interface MiniPayRewardButtonProps {
  recipient: string;
  amount: string;
  contractAddress: string;
  encodedData: string;
  currency?: 'cUSD' | 'cEUR' | 'CELO';
  onSuccess?: (txHash: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * MiniPay Reward Button Component
 * 
 * Enables seamless, low-cost reward distribution via MiniPay
 * Perfect for in-app rewards, prediction winnings, etc.
 */
export default function MiniPayRewardButton({
  recipient,
  amount,
  contractAddress,
  encodedData,
  currency = 'cUSD',
  onSuccess,
  disabled = false,
  className = "",
}: MiniPayRewardButtonProps) {
  const { sendPredictionWinnings, canReceiveRewards } = useMiniPayRewards();
  const [isSending, setIsSending] = useState(false);

  const handleSendReward = async () => {
    if (!canReceiveRewards) {
      toast.error('MiniPay is not available. Please use MiniPay to receive rewards.');
      return;
    }

    setIsSending(true);
    try {
      const txHash = await sendPredictionWinnings(recipient, amount, contractAddress, encodedData, currency);
      
      toast.success(`Reward sent successfully! 🎉`, {
        duration: 5000,
        icon: '✅',
      });
      
      onSuccess?.(txHash);
    } catch (error) {
      console.error('Failed to send reward:', error);
      toast.error('Failed to send reward. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Button
      onClick={handleSendReward}
      disabled={disabled || isSending || !canReceiveRewards}
      className={`flex items-center gap-2 ${className}`}
    >
      <GiftIcon className="w-5 h-5" />
      {isSending ? 'Sending...' : `Send ${amount} ${currency}`}
    </Button>
  );
}

