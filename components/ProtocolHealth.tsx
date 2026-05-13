'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGasPrice } from 'wagmi';
import { formatUnits } from 'viem';
import { 
  HeartIcon, 
  BoltIcon, 
  SignalIcon, 
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

export default function ProtocolHealth() {
  const { data: gasPrice } = useGasPrice();
  const [lastCheck, setLastCheck] = useState<string>('');

  useEffect(() => {
    setLastCheck(new Date().toLocaleTimeString());
  }, [gasPrice]);

  const gasGwei = gasPrice ? Math.floor(Number(formatUnits(gasPrice, 9))) : 0;
  
  // Logic for health status based on gas and connectivity
  const getStatusColor = () => {
    if (gasGwei > 300) return 'text-orange-400';
    if (gasGwei > 0) return 'text-emerald-400';
    return 'text-slate-400';
  };

  const getStatusText = () => {
    if (gasGwei > 300) return 'CONGESTED';
    if (gasGwei > 0) return 'OPERATIONAL';
    return 'CONNECTING...';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 overflow-hidden relative group hover:border-blue-500/30 transition-all"
    >
      {/* Background Glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all rounded-full" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 rounded-2xl">
            <HeartIcon className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">PROTOCOL HEALTH</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">REAL-TIME MONITORING</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${getStatusColor().replace('text', 'bg')}`} />
          <span className={`text-[10px] font-black tracking-widest ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Gas Metric */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <BoltIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">NETWORK LOAD</span>
          </div>
          <p className="text-xl font-black text-white">
            {gasGwei} <span className="text-[10px] font-bold text-slate-500">GWEI</span>
          </p>
        </div>

        {/* Security Metric */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1">
            <ShieldCheckIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">PROTECTION</span>
          </div>
          <p className="text-xl font-black text-white">
            ELITE <span className="text-[10px] font-bold text-slate-500">LEVEL</span>
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <SignalIcon className="w-3 h-3 text-slate-500" />
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">LAST SYNC: {lastCheck}</span>
        </div>
        <span className="text-[9px] font-black text-blue-400/60 uppercase tracking-widest">CELO MAINNET</span>
      </div>
    </motion.div>
  );
}
