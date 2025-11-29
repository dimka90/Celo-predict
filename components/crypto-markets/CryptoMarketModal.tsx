'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CryptoMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CryptoMarketData) => void;
  selectedAsset: { symbol: string; name: string; icon: string; currentPrice?: number } | null;
}

export interface CryptoMarketData {
  cryptoAsset: string;
  targetPrice: string;
  priceDirection: 'above' | 'below';
  timeFrame: string;
  creatorStake: string;
  odds: string;
}

const TIME_FRAMES = [
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '24h', label: '24 Hours' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export default function CryptoMarketModal({
  isOpen,
  onClose,
  onSubmit,
  selectedAsset,
}: CryptoMarketModalProps) {
  const [formData, setFormData] = useState<CryptoMarketData>({
    cryptoAsset: selectedAsset?.symbol || 'BTC',
    targetPrice: '',
    priceDirection: 'above',
    timeFrame: '24h',
    creatorStake: '1.0',
    odds: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form when asset changes
  useEffect(() => {
    if (selectedAsset) {
      setFormData(prev => ({
        ...prev,
        cryptoAsset: selectedAsset.symbol,
      }));
    }
  }, [selectedAsset]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.targetPrice || parseFloat(formData.targetPrice) <= 0) {
      newErrors.targetPrice = 'Target price must be greater than 0';
    }

    if (!formData.creatorStake || parseFloat(formData.creatorStake) < 1) {
      newErrors.creatorStake = 'Creator stake must be at least 1 CELO';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleInputChange = (field: keyof CryptoMarketData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!selectedAsset) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-3 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gray-900 rounded-lg w-full max-w-md max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden border border-gray-700"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800 p-4 sm:p-6 flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">{selectedAsset.icon}</span>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">{selectedAsset.symbol}</h2>
                  <p className="text-xs sm:text-sm text-gray-400">{selectedAsset.name}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Current Price Display */}
              {selectedAsset.currentPrice && (
                <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-400 mb-1">Current Price</p>
                  <p className="text-xl sm:text-2xl font-bold text-white">
                    ${selectedAsset.currentPrice.toLocaleString()}
                  </p>
                </div>
              )}

              {/* Target Price */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Target Price (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.targetPrice}
                  onChange={(e) => handleInputChange('targetPrice', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.targetPrice ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="e.g., 100000"
                />
                {errors.targetPrice && (
                  <p className="text-red-500 text-xs mt-1">{errors.targetPrice}</p>
                )}
              </div>

              {/* Price Direction */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Price Direction *
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInputChange('priceDirection', 'above')}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                      formData.priceDirection === 'above'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ↑ Above
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInputChange('priceDirection', 'below')}
                    className={`flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                      formData.priceDirection === 'below'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    ↓ Below
                  </button>
                </div>
              </div>

              {/* Time Frame */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Time Frame *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_FRAMES.map((timeFrame) => (
                    <button
                      key={timeFrame.value}
                      type="button"
                      onClick={() => handleInputChange('timeFrame', timeFrame.value)}
                      className={`py-2 px-2 sm:px-3 rounded-lg font-medium text-xs transition-colors ${
                        formData.timeFrame === timeFrame.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {timeFrame.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Stake */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Creator Stake (CELO) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={formData.creatorStake}
                  onChange={(e) => handleInputChange('creatorStake', e.target.value)}
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.creatorStake ? 'border-red-500' : 'border-gray-600'
                  }`}
                  placeholder="1.0"
                />
                {errors.creatorStake && (
                  <p className="text-red-500 text-xs mt-1">{errors.creatorStake}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Minimum: 1 CELO + 0.01 CELO fee</p>
              </div>

              {/* Summary */}
              <div className="bg-gray-800 rounded-lg p-3 sm:p-4 space-y-2">
                <h3 className="text-xs sm:text-sm font-semibold text-white">Market Summary</h3>
                <div className="space-y-1 text-xs sm:text-sm">
                  <div className="flex justify-between text-gray-400">
                    <span>Prediction:</span>
                    <span className="text-white font-medium">
                      {selectedAsset.symbol} will go {formData.priceDirection} ${formData.targetPrice || '?'}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Time Frame:</span>
                    <span className="text-white font-medium">
                      {TIME_FRAMES.find(t => t.value === formData.timeFrame)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Your Stake:</span>
                    <span className="text-white font-medium">{formData.creatorStake} CELO</span>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer Buttons */}
            <div className="border-t border-gray-700 bg-gray-800 p-4 sm:p-6 flex-shrink-0 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex-1 py-2 sm:py-3 px-3 sm:px-4 rounded-lg font-medium text-xs sm:text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
