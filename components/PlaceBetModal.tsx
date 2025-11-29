'use client';

import { useState } from 'react';
import { useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { toast } from 'react-hot-toast';
import { parseEther } from 'viem';

const SIMPLE_POOL_CREATOR_ABI = [
  {
    type: 'function',
    name: 'placeBet',
    inputs: [
      { name: '_poolId', type: 'uint256' },
      { name: '_amount', type: 'uint256' },
    ],
    stateMutability: 'payable',
  },
] as const;

interface PlaceBetModalProps {
  poolId: number;
  poolTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PlaceBetModal({
  poolId,
  poolTitle,
  isOpen,
  onClose,
  onSuccess,
}: PlaceBetModalProps) {
  const [betAmount, setBetAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const handlePlaceBet = async () => {
    try {
      if (!betAmount || parseFloat(betAmount) <= 0) {
        toast.error('Please enter a valid bet amount');
        return;
      }

      setIsLoading(true);

      const amount = parseEther(betAmount);

      console.log('Placing bet:', {
        poolId,
        amount: amount.toString(),
        betAmount,
      });

      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.POOL_CORE,
        abi: SIMPLE_POOL_CREATOR_ABI,
        functionName: 'placeBet',
        args: [BigInt(poolId), amount],
        value: amount,
      });

      toast.loading('Confirming bet...', { id: 'bet-confirm' });

      // Wait for confirmation
      if (publicClient) {
        await publicClient.waitForTransactionReceipt({ hash: txHash });
      }

      toast.dismiss('bet-confirm');
      toast.success('Bet placed successfully!');
      setBetAmount('');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-2">Place Bet</h2>
        <p className="text-gray-400 mb-6">{poolTitle}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount (CELO)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="bg-slate-700 rounded-lg p-4">
            <p className="text-sm text-gray-400">You will bet</p>
            <p className="text-2xl font-bold text-white">
              {betAmount || '0'} CELO
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePlaceBet}
              disabled={isLoading || !betAmount}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
            >
              {isLoading ? 'Placing...' : 'Place Bet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
