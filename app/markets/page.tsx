'use client';

import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import Link from 'next/link';
import PlaceBetModal from '@/components/PlaceBetModal';

const SIMPLE_POOL_CREATOR_ABI = [
  {
    type: 'function',
    name: 'poolCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getPool',
    inputs: [{ name: '_poolId', type: 'uint256' }],
    outputs: [
      {
        components: [
          { name: 'creator', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'creatorStake', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'eventStartTime', type: 'uint256' },
          { name: 'eventEndTime', type: 'uint256' },
          { name: 'settled', type: 'bool' },
          { name: 'outcome', type: 'string' },
        ],
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
  },
] as const;

export default function MarketsPage() {
  const publicClient = usePublicClient();
  const [pools, setPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPool, setSelectedPool] = useState<any>(null);
  const [isBetModalOpen, setIsBetModalOpen] = useState(false);

  useEffect(() => {
    const fetchPools = async () => {
      if (!publicClient) {
        console.log('Public client not ready yet');
        return;
      }

      try {
        console.log('Fetching pools from contract:', CONTRACT_ADDRESSES.POOL_CORE);
        
        // Get pool count
        const poolCount = (await publicClient.readContract({
          address: CONTRACT_ADDRESSES.POOL_CORE as `0x${string}`,
          abi: SIMPLE_POOL_CREATOR_ABI,
          functionName: 'poolCount',
        })) as bigint;

        console.log('Pool count:', poolCount.toString());

        // Fetch all pools
        const poolsData: any[] = [];
        for (let i = 0; i < Number(poolCount); i++) {
          try {
            const pool = (await publicClient.readContract({
              address: CONTRACT_ADDRESSES.POOL_CORE as `0x${string}`,
              abi: SIMPLE_POOL_CREATOR_ABI,
              functionName: 'getPool',
              args: [BigInt(i)],
            })) as any;

            poolsData.push({
              poolId: i,
              creator: pool.creator,
              title: pool.title,
              description: pool.description,
              creatorStake: (BigInt(pool.creatorStake) / BigInt(10 ** 18)).toString(),
              createdAt: Number(pool.createdAt),
              eventStartTime: Number(pool.eventStartTime),
              eventEndTime: Number(pool.eventEndTime),
              settled: pool.settled,
              outcome: pool.outcome,
            });
          } catch (poolError) {
            console.error(`Error fetching pool ${i}:`, poolError);
          }
        }

        console.log('Fetched pools:', poolsData);
        setPools(poolsData.reverse()); // Show newest first
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching pools:', error);
        setIsLoading(false);
      }
    };

    // Fetch immediately and set up polling
    fetchPools();
    const interval = setInterval(fetchPools, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [publicClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="text-center text-white">Loading markets...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-gray-400">Total markets: {pools.length}</p>
        </div>

        {pools.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">No markets created yet</p>
            <Link
              href="/create-prediction"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Market
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {pools.map((pool) => (
              <div
                key={pool.poolId}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-slate-600 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{pool.title}</h2>
                    <p className="text-gray-400 text-sm">{pool.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Pool #{pool.poolId}</p>
                    {pool.settled && (
                      <p className="text-sm text-green-400 font-semibold">Settled</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Creator Stake</p>
                    <p className="text-white font-semibold">{pool.creatorStake} CELO</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Event Start</p>
                    <p className="text-white text-sm">
                      {new Date(pool.eventStartTime * 1000).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <p className="text-white text-sm">{pool.settled ? 'Settled' : 'Active'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Creator</p>
                    <p className="text-white text-sm font-mono">
                      {pool.creator.slice(0, 6)}...{pool.creator.slice(-4)}
                    </p>
                  </div>
                </div>

                {pool.settled && pool.outcome && (
                  <div className="bg-slate-700 rounded p-3 mb-4">
                    <p className="text-xs text-gray-400">Outcome</p>
                    <p className="text-white">{pool.outcome}</p>
                  </div>
                )}

                {!pool.settled && (
                  <button
                    onClick={() => {
                      setSelectedPool(pool);
                      setIsBetModalOpen(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                  >
                    Place Bet
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <PlaceBetModal
          poolId={selectedPool?.poolId || 0}
          poolTitle={selectedPool?.title || ''}
          isOpen={isBetModalOpen}
          onClose={() => setIsBetModalOpen(false)}
          onSuccess={() => {
            // Refresh pools after successful bet
            setIsLoading(true);
          }}
        />
      </div>
    </div>
  );
}
