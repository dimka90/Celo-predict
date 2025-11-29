import { useEffect, useState, useCallback } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';

interface RecentBet {
  id: number;
  poolId: string;
  bettorAddress: string;
  amount: string;
  amountFormatted: string;
  isForOutcome: boolean;
  createdAt: string;
  timeAgo: string;
  eventType: 'bet' | 'pool_created' | 'liquidity_added';
  action: string;
  icon: string;
  odds: number;
  currency: string;
  pool: {
    predictedOutcome: string;
    league: string;
    category: string;
    homeTeam: string;
    awayTeam: string;
    title: string;
    usePrix: boolean;
    odds: number;
    creatorAddress: string;
  };
}

const SIMPLE_POOL_CREATOR_ABI = [
  {
    type: 'event',
    name: 'BetPlacedWithDetails',
    inputs: [
      { name: 'poolId', type: 'uint256', indexed: true },
      { name: 'bettor', type: 'address', indexed: true },
      { name: 'amount', type: 'uint256', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'PoolCreated',
    inputs: [
      { name: 'poolId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'title', type: 'string', indexed: false },
      { name: 'creatorStake', type: 'uint256', indexed: false },
      { name: 'eventStartTime', type: 'uint256', indexed: false },
    ],
  },
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

export function useRecentBets() {
  const publicClient = usePublicClient();
  const [bets, setBets] = useState<RecentBet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const formatTimeAgo = (timestamp: number): string => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const fetchBets = useCallback(async () => {
    if (!publicClient) {
      console.log('Public client not available');
      return;
    }

    try {
      setIsLoading(true);
      const recentBets: RecentBet[] = [];
      let betId = 1;

      console.log('Fetching bets from contract:', CONTRACT_ADDRESSES.POOL_CORE);

      // Get pool count
      const poolCountABI = [
        {
          type: 'function',
          name: 'poolCount',
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
        },
      ] as const;

      const poolCount = (await publicClient.readContract({
        address: CONTRACT_ADDRESSES.POOL_CORE as `0x${string}`,
        abi: poolCountABI,
        functionName: 'poolCount',
      })) as bigint;

      console.log('Pool count:', poolCount.toString());

      // Get total bets for each pool
      const totalBetsABI = [
        {
          type: 'function',
          name: 'totalBets',
          inputs: [{ name: '', type: 'uint256' }],
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view',
        },
      ] as const;

      // Check last 20 pools for bets
      const startPool = Math.max(0, Number(poolCount) - 20);
      
      for (let i = startPool; i < Number(poolCount); i++) {
        try {
          const totalBet = (await publicClient.readContract({
            address: CONTRACT_ADDRESSES.POOL_CORE as `0x${string}`,
            abi: totalBetsABI,
            functionName: 'totalBets',
            args: [BigInt(i)],
          })) as bigint;

          if (totalBet > 0n) {
            // Fetch pool details
            let poolTitle = `Pool #${i}`;
            let poolCreatedAt = Math.floor(Date.now() / 1000);
            
            try {
              const pool = (await publicClient.readContract({
                address: CONTRACT_ADDRESSES.POOL_CORE as `0x${string}`,
                abi: SIMPLE_POOL_CREATOR_ABI,
                functionName: 'getPool',
                args: [BigInt(i)],
              })) as any;
              poolTitle = pool.title || `Pool #${i}`;
              poolCreatedAt = Number(pool.createdAt);
            } catch (e) {
              console.error(`Error fetching pool ${i}:`, e);
            }

            const betAmount = (Number(totalBet) / 1e18).toFixed(2);
            const timeAgo = formatTimeAgo(poolCreatedAt);

            recentBets.push({
              id: betId++,
              poolId: i.toString(),
              bettorAddress: '0x' + 'x'.repeat(40),
              amount: totalBet.toString(),
              amountFormatted: betAmount,
              isForOutcome: true,
              createdAt: new Date(poolCreatedAt * 1000).toISOString(),
              timeAgo,
              eventType: 'bet',
              action: 'Placed bet',
              icon: '🎯',
              odds: 100,
              currency: 'CELO',
              pool: {
                predictedOutcome: 'Market Prediction',
                league: 'Celo',
                category: 'prediction',
                homeTeam: '',
                awayTeam: '',
                title: poolTitle,
                usePrix: false,
                odds: 100,
                creatorAddress: '',
              },
            });
          }
        } catch (error) {
          console.error(`Error fetching bets for pool ${i}:`, error);
        }
      }

      console.log('Fetched bets:', recentBets);
      setBets(recentBets.reverse().slice(0, 10)); // Show last 10
    } catch (error) {
      console.error('Error fetching recent bets:', error);
      setBets([]);
    } finally {
      setIsLoading(false);
    }
  }, [publicClient]);

  useEffect(() => {
    fetchBets();
    const interval = setInterval(fetchBets, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [fetchBets]);

  return { bets, isLoading };
}
