'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChartPieIcon, 
  ArrowTrendingUpIcon,
  TrophyIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

export default function MarketIntelligence() {
  const trends = [
    { name: 'Sports', growth: '+24%', color: 'text-emerald-400', icon: TrophyIcon, activity: 'High' },
    { name: 'Crypto', growth: '+12%', color: 'text-blue-400', icon: BanknotesIcon, activity: 'Medium' },
    { name: 'Social', growth: '+8%', color: 'text-purple-400', icon: ChartPieIcon, activity: 'Medium' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl p-6 overflow-hidden relative group hover:border-emerald-500/30 transition-all h-full"
    >
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-emerald-500/5 blur-3xl group-hover:bg-emerald-500/10 transition-all rounded-full" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 rounded-2xl">
            <ArrowTrendingUpIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">MARKET INTELLIGENCE</h3>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">SECTOR ANALYSIS</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {trends.map((trend, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-all">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-slate-900/50 ${trend.color.replace('text', 'text')}`}>
                <trend.icon className={`w-4 h-4 ${trend.color}`} />
              </div>
              <span className="text-sm font-bold text-white">{trend.name}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`text-xs font-black ${trend.color}`}>{trend.growth}</span>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">ACTIVITY: {trend.activity}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/50">
        <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-slate-500">
          <span className="uppercase">AGGREGATED SENTIMENT</span>
          <span className="text-emerald-400 uppercase">BULLISH</span>
        </div>
      </div>
    </motion.div>
  );
}
