/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Academic Workbench: Age-of-Information-Aware Deep Reinforcement Learning for
 * Energy-Efficient Wireless Sensor Scheduling
 *
 * Candidate: Monisha
 * Degree: Master of Engineering (M.E.) in Communication Systems / Applied Electronics
 * Institution: Mailam Engineering College (Affiliated to Anna University, Tamil Nadu)
 * Department: Department of Electronics and Communication Engineering (ECE)
 */

import React, { useState } from 'react';
import { Header, NavTab } from './components/Header';
import { LiveSimulator } from './components/LiveSimulator';
import { BenchmarkComparison } from './components/BenchmarkComparison';
import { PyTorchCodeStudio } from './components/PyTorchCodeStudio';
import { ESP32HardwareDeployment } from './components/ESP32HardwareDeployment';
import { ThesisAndDefense } from './components/ThesisAndDefense';
import { runComparativeBenchmark, DEFAULT_PARAMS } from './lib/simulationEngine';
import { PolicyMetrics, SchedulingPolicy } from './types/simulation';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('simulation');
  const [isBenchmarking, setIsBenchmarking] = useState<boolean>(false);
  const [benchmarkData, setBenchmarkData] = useState<Record<SchedulingPolicy, PolicyMetrics>>(() =>
    runComparativeBenchmark(1000, DEFAULT_PARAMS)
  );

  const handleRunQuickBenchmark = () => {
    setIsBenchmarking(true);
    setTimeout(() => {
      const results = runComparativeBenchmark(1000, DEFAULT_PARAMS);
      setBenchmarkData(results);
      setIsBenchmarking(false);
      setActiveTab('benchmark');
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRunQuickBenchmark={handleRunQuickBenchmark}
        isBenchmarking={isBenchmarking}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulation' && (
          <LiveSimulator onSwitchToBenchmark={() => setActiveTab('benchmark')} />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkComparison initialResults={benchmarkData} />
        )}

        {activeTab === 'pytorch' && <PyTorchCodeStudio />}

        {activeTab === 'hardware' && <ESP32HardwareDeployment />}

        {activeTab === 'thesis' && <ThesisAndDefense />}
      </main>

      {/* Academic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>© 2026 Monisha</span>
            <span aria-hidden="true">·</span>
            <span>M.E. Communication Systems Thesis Research</span>
            <span aria-hidden="true">·</span>
            <span>Mailam Engineering College (Anna University)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
            <span>Phase 1: PyTorch DRL Simulation</span>
            <span aria-hidden="true" className="text-slate-700">/</span>
            <span>Phase 2: ESP32 UDP Star Network</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
