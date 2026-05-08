"use client";

import { useMiniPay } from "@/hooks/useMiniPay";
import { CheckBadgeIcon } from "@heroicons/react/24/solid";

/**
 * MiniPay Badge Component
 * 
 * Displays a badge when the app is running in MiniPay environment
 * This helps users understand they're using MiniPay's optimized experience
 */
export default function MiniPayBadge() {
  const { isMiniPay } = useMiniPay();

  if (!isMiniPay) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-xs font-medium shadow-lg">
      <CheckBadgeIcon className="w-4 h-4" />
      <span>MiniPay</span>
    </div>
  );
}

