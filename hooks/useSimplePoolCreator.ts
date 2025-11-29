import { useAccount, useWriteContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESSES } from '@/config/wagmi';
import { toast } from 'react-hot-toast';

const SIMPLE_POOL_CREATOR_ABI = [
  {
    type: 'function',
    name: 'createPool',
    inputs: [
      { name: '_title', type: 'string' },
      { name: '_description', type: 'string' },
      { name: '_creatorStake', type: 'uint256' },
      { name: '_eventStartTime', type: 'uint256' },
      { name: '_eventEndTime', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'payable',
  },
] as const;

export function useSimplePoolCreator() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();

  const createPool = async (poolData: {
    title: string;
    description: string;
    creatorStake: bigint;
    eventStartTime: bigint;
    eventEndTime: bigint;
  }) => {
    try {
      if (!address) throw new Error('Wallet not connected');

      // Validate inputs
      if (poolData.creatorStake <= 0n) {
        throw new Error('Creator stake must be greater than 0');
      }

      // Ensure minimum stake of 1 CELO
      const minStake = 1n * 10n ** 18n; // 1 CELO
      if (poolData.creatorStake < minStake) {
        throw new Error(`Creator stake must be at least 1 CELO (${minStake.toString()})`);
      }

      const now = BigInt(Math.floor(Date.now() / 1000));
      if (poolData.eventStartTime <= now + 60n) {
        throw new Error('Event start time must be at least 60 seconds in the future');
      }

      if (poolData.eventEndTime <= poolData.eventStartTime) {
        throw new Error('Event end time must be after start time');
      }

      // SimplePoolCreator requires: stake + 0.01 CELO fee
      const creationFee = 1n * 10n ** 16n; // 0.01 CELO
      const totalValue = poolData.creatorStake + creationFee;

      console.log('Creating pool with validation:', {
        title: poolData.title,
        description: poolData.description,
        creatorStake: poolData.creatorStake.toString(),
        eventStartTime: new Date(Number(poolData.eventStartTime) * 1000).toISOString(),
        eventEndTime: new Date(Number(poolData.eventEndTime) * 1000).toISOString(),
        totalValue: totalValue.toString(),
        contractAddress: process.env.NEXT_PUBLIC_SIMPLE_POOL_CREATOR_ADDRESS,
      });

      // Use SimplePoolCreator address if available
      const contractAddress = (process.env.NEXT_PUBLIC_SIMPLE_POOL_CREATOR_ADDRESS || 
                               CONTRACT_ADDRESSES.POOL_CORE) as `0x${string}`;

      if (!contractAddress || contractAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error('SimplePoolCreator contract address not configured. Please set NEXT_PUBLIC_SIMPLE_POOL_CREATOR_ADDRESS in .env.local');
      }

      // Try with the contract address
      console.log('Attempting to call createPool on:', contractAddress);
      console.log('With args:', [
        poolData.title,
        poolData.description,
        poolData.creatorStake.toString(),
        poolData.eventStartTime.toString(),
        poolData.eventEndTime.toString(),
      ]);

      const txHash = await writeContractAsync({
        address: contractAddress,
        abi: SIMPLE_POOL_CREATOR_ABI,
        functionName: 'createPool',
        args: [
          poolData.title,
          poolData.description,
          poolData.creatorStake,
          poolData.eventStartTime,
          poolData.eventEndTime,
        ],
        value: totalValue,
        account: address,
      });

      console.log('Pool creation transaction submitted:', txHash);
      toast.success('Pool created successfully!');
      return txHash;
    } catch (error) {
      console.error('Error creating pool:', error);
      
      const errorMsg = error instanceof Error ? error.message : 'Failed to create pool';
      
      // Provide helpful error messages
      if (errorMsg.includes('divide by zero') || errorMsg.includes('BigInteger')) {
        toast.error('Contract error: The contract at this address may not be SimplePoolCreator. Please redeploy the contract or verify the address in .env.local');
      } else if (errorMsg.includes('not configured')) {
        toast.error(errorMsg);
      } else if (errorMsg.includes('Stake too low')) {
        toast.error('Creator stake must be at least 1 CELO');
      } else if (errorMsg.includes('60+ seconds')) {
        toast.error('Event start time must be at least 60 seconds in the future');
      } else if (errorMsg.includes('End time must be after')) {
        toast.error('Event end time must be after start time');
      } else if (errorMsg.includes('Incorrect CELO')) {
        toast.error('Incorrect CELO amount. Make sure you have enough balance for stake + 0.01 CELO fee');
      } else {
        toast.error(errorMsg);
      }
      
      throw error;
    }
  };

  return { createPool };
}
