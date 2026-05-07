"use client";

import { useAccount } from 'wagmi';
import UserSlipsDisplay from '@/components/UserSlipsDisplay';

export default function MySlipsPage() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16">
              <h1 className="text-4xl font-bold text-white mb-4">My Slips</h1>
              <p className="text-gray-300 mb-8">Connect your wallet to view your prediction slips</p>
              <div className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Connect Wallet
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Mobile-responsive Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">My Slips</h1>
            <p className="text-sm sm:text-base text-gray-300">Track your prediction performance and history</p>
          </div>


          {/* User Slips */}
          <UserSlipsDisplay 
            userAddress={address!} 
            className="mb-8"
          />

        </div>
      </div>
    </div>
  );
}
