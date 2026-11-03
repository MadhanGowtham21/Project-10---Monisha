/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Academic Top Navigation Header adhering to the Top Bar Contract
 */

import React from 'react';
import { Play, Download, Sparkles } from 'lucide-react';
import { ACADEMIC_INFO } from '../data/thesisLiterature';

export type NavTab = 'simulation' | 'benchmark' | 'pytorch' | 'hardware' | 'thesis';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onRunQuickBenchmark: () => void;
  isBenchmarking: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  onRunQuickBenchmark,
  isBenchmarking,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              AoI
            </div>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                onSelectTab('simulation');
              }}
              className="text-base font-bold tracking-tight text-slate-100 hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
            >
              AoI-DRL Sensor Scheduler Workbench
            </a>
          </div>

          {/* Zone 2: 4-5 concise single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => onSelectTab('simulation')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'simulation'
                  ? 'border-cyan-400 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Live Simulator
            </button>
            <button
              onClick={() => onSelectTab('benchmark')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'benchmark'
                  ? 'border-cyan-400 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Benchmark Studio
            </button>
            <button
              onClick={() => onSelectTab('pytorch')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'pytorch'
                  ? 'border-cyan-400 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-300'
              }`}
            >
              PyTorch DRL Code
            </button>
            <button
              onClick={() => onSelectTab('hardware')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'hardware'
                  ? 'border-cyan-400 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Phase 2 ESP32
            </button>
            <button
              onClick={() => onSelectTab('thesis')}
              className={`hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 pb-0.5 border-b-2 ${
                activeTab === 'thesis'
                  ? 'border-cyan-400 text-cyan-400 font-semibold'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Thesis & Viva Voce
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onRunQuickBenchmark}
              disabled={isBenchmarking}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm transition-colors disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isBenchmarking ? 'Simulating 1,000 Slots...' : 'Run 1,000-Slot Benchmark'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-header academic thesis context ribbon (Clean unboxed text metadata) */}
      <div className="border-t border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-slate-400 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{ACADEMIC_INFO.candidateName}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{ACADEMIC_INFO.degree} ({ACADEMIC_INFO.specialization})</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{ACADEMIC_INFO.institution}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-500">{ACADEMIC_INFO.university}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
            <span>Gilbert-Elliott Fading Link</span>
            <span aria-hidden="true" className="text-slate-700">/</span>
            <span>LCFS Single Replacement</span>
            <span aria-hidden="true" className="text-slate-700">/</span>
            <span className="text-cyan-400 font-semibold">DQN ~24% Energy Savings</span>
          </div>
        </div>
      </div>
    </header>
  );
};
