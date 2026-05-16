'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ScaleIcon, 
  ChatBubbleLeftRightIcon, 
  UserGroupIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import AnimatedTitle from '@/components/AnimatedTitle';

interface Proposal {
  id: string;
  title: string;
  status: 'Active' | 'Closed' | 'Passed' | 'Rejected';
  votesFor: number;
  votesAgainst: number;
  endTime: string;
  category: 'Protocol' | 'Treasury' | 'Markets';
}

const SAMPLE_PROPOSALS: Proposal[] = [
  {
    id: 'PIP-001',
    title: 'Implement Tiered Fee Structure for High-Volume Markets',
    status: 'Active',
    votesFor: 450000,
    votesAgainst: 12000,
    endTime: '2025-05-15',
    category: 'Protocol'
  },
  {
    id: 'PIP-002',
    title: 'Strategic Partnership with MiniPay Ecosystem Builders',
    status: 'Passed',
    votesFor: 1200000,
    votesAgainst: 5000,
    endTime: '2025-05-08',
    category: 'Treasury'
  }
];

export default function GovernancePage() {
  const [proposals] = useState<Proposal[]>(SAMPLE_PROPOSALS);

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6"
          >
            <ScaleIcon className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Protocol Governance</span>
          </motion.div>
          <AnimatedTitle size="xl" className="mb-6">
            THE FUTURE IS <span className="text-blue-400">COMMUNITY OWNED</span>
          </AnimatedTitle>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Stake PRIX to participate in decision making, propose new markets, and shape the evolution of the Predinex ecosystem.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: 'Total PRIX Staked', value: '12.4M', icon: CheckBadgeIcon },
            { label: 'Active Proposals', value: '1', icon: ChatBubbleLeftRightIcon },
            { label: 'Governance Power', value: 'High', icon: ShieldCheckIcon },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl"
            >
              <stat.icon className="w-8 h-8 text-blue-400 mb-4" />
              <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Proposals List (Left) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <UserGroupIcon className="w-6 h-6 text-emerald-400" />
                Active Proposals
              </h2>
              <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-blue-600/20">
                Create Proposal
              </button>
            </div>

            {proposals.map((proposal, i) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative bg-slate-900/40 border border-slate-800 hover:border-blue-500/30 p-6 rounded-3xl transition-all cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono text-blue-400">{proposal.id}</span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        proposal.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {proposal.status}
                      </span>
                      <span className="text-xs text-slate-500">• {proposal.category}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{proposal.title}</h3>
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> Ends {proposal.endTime}</span>
                    </div>
                  </div>

                  <div className="md:w-48 space-y-3">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-1">
                      <span className="text-emerald-400">For</span>
                      <span className="text-slate-400">{((proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Activity Feed (Right) */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-blue-400" />
                Governance Stream
              </h3>
              
              <div className="space-y-6">
                {[
                  { user: '0x3862...88E6', action: 'Voted FOR PIP-001', amount: '45,000 PRIX', time: '2m ago' },
                  { user: '0x1F55...0C4D', action: 'Locked Stake', amount: '120,000 PRIX', time: '14m ago' },
                  { user: '0x23fB...563d', action: 'Voted FOR PIP-001', amount: '12,500 PRIX', time: '28m ago' },
                  { user: '0x2076...afC9', action: 'Voted FOR PIP-001', amount: '8,200 PRIX', time: '1h ago' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex gap-4 items-start"
                  >
                    <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono text-blue-400 mb-1">{item.user}</p>
                      <p className="text-sm font-bold text-white mb-0.5">{item.action}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.amount}</span>
                        <span className="text-[10px] text-slate-600 font-medium">{item.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Network Status</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Governance Sync</span>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
