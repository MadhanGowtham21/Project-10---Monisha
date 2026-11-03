/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Live Discrete-Time AoI & Energy Simulator Workbench
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Zap,
  Activity,
  Radio,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Battery,
  Sliders,
} from 'lucide-react';
import {
  DiscreteTimeAoISimulator,
  DEFAULT_PARAMS,
  DEFAULT_NODES_CONFIG,
  SimulationParams,
} from '../lib/simulationEngine';
import { SchedulingPolicy, SimulationStepResult } from '../types/simulation';

interface LiveSimulatorProps {
  onSwitchToBenchmark: () => void;
}

export const LiveSimulator: React.FC<LiveSimulatorProps> = ({ onSwitchToBenchmark }) => {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [policy, setPolicy] = useState<SchedulingPolicy>('DQN');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(300); // 300ms per slot

  const simulatorRef = useRef<DiscreteTimeAoISimulator>(new DiscreteTimeAoISimulator(params, DEFAULT_NODES_CONFIG));
  const [slot, setSlot] = useState<number>(0);
  const [history, setHistory] = useState<SimulationStepResult[]>([]);
  const [nodes, setNodes] = useState(simulatorRef.current.getNodes());
  const [totalReward, setTotalReward] = useState<number>(0);
  const [lastStep, setLastStep] = useState<SimulationStepResult | null>(null);

  // Sync state from simulator
  const refreshUI = () => {
    setSlot(simulatorRef.current.getSlot());
    setHistory([...simulatorRef.current.getHistory()]);
    setNodes([...simulatorRef.current.getNodes()]);
    setTotalReward(simulatorRef.current.getTotalReward());
  };

  const handleStep = () => {
    const sim = simulatorRef.current;
    const action = sim.selectAction(policy);
    const result = sim.step(action);
    setLastStep(result);
    refreshUI();
  };

  const handleReset = () => {
    setIsRunning(false);
    simulatorRef.current.reset(DEFAULT_NODES_CONFIG);
    setLastStep(null);
    refreshUI();
  };

  // Continuous execution timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning) {
      timer = setInterval(() => {
        const sim = simulatorRef.current;
        const action = sim.selectAction(policy);
        const result = sim.step(action);
        setLastStep(result);
        refreshUI();
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, policy, speedMs]);

  // Total energy consumed so far
  const totalEnergySpent = nodes.reduce((acc, n) => acc + (n.totalTxEnergy + n.totalIdleEnergy), 0);
  const totalSuccesses = nodes.reduce((acc, n) => acc + n.successfulPackets, 0);
  const totalAttempts = nodes.reduce((acc, n) => acc + n.attemptedTransmissions, 0);
  const overallPdr = totalAttempts > 0 ? (totalSuccesses / totalAttempts) * 100 : 0;

  // Colors for each sensor node
  const nodeColors = ['#06b6d4', '#10b981', '#f59e0b']; // Cyan, Emerald, Amber

  // SVG Sawtooth Dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Build slice of recent 40 slots for sawtooth wave
  const recentHistory = history.slice(-40);
  const maxAoIInWindow = Math.max(
    25,
    ...recentHistory.flatMap((h) => h.nodes.map((n) => n.aoi))
  );

  return (
    <div className="space-y-6">
      {/* Top Console Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Policy Segmented Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Policy:
            </span>
            <div className="inline-flex rounded-lg bg-slate-950 p-1 border border-slate-800">
              <button
                onClick={() => setPolicy('DQN')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  policy === 'DQN'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                DQN Agent (Proposed)
              </button>
              <button
                onClick={() => setPolicy('GREEDY_MAX_AOI')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  policy === 'GREEDY_MAX_AOI'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Greedy Max-AoI
              </button>
              <button
                onClick={() => setPolicy('ROUND_ROBIN')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  policy === 'ROUND_ROBIN'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Round-Robin (RR)
              </button>
              <button
                onClick={() => setPolicy('RANDOM')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                  policy === 'RANDOM'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Random
              </button>
            </div>
          </div>

          {/* Execution Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                isRunning
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isRunning ? 'Pause' : 'Play Simulation'}</span>
            </button>

            <button
              onClick={handleStep}
              disabled={isRunning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Step 1 Slot</span>
            </button>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            {/* Speed Control */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs">
              <span className="text-slate-500 font-mono text-[11px]">Speed:</span>
              <button
                onClick={() => setSpeedMs(600)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${speedMs === 600 ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400'}`}
              >
                1x
              </button>
              <button
                onClick={() => setSpeedMs(250)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${speedMs === 250 ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400'}`}
              >
                2x
              </button>
              <button
                onClick={() => setSpeedMs(80)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${speedMs === 80 ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400'}`}
              >
                5x
              </button>
              <button
                onClick={() => setSpeedMs(25)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${speedMs === 25 ? 'bg-cyan-500/20 text-cyan-400 font-bold' : 'text-slate-400'}`}
              >
                Max
              </button>
            </div>
          </div>
        </div>

        {/* Global Key Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Current Slot</div>
            <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">t = {slot}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Last Action</div>
            <div className="text-sm font-semibold text-cyan-400 truncate">
              {lastStep ? lastStep.actionLabel : 'Ready (Slot 0)'}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Total Energy</div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {totalEnergySpent.toFixed(1)} <span className="text-xs text-slate-400 font-normal">mJ</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Delivery Ratio</div>
            <div className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {overallPdr.toFixed(1)} <span className="text-xs text-slate-400 font-normal">%</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Success / Attempts</div>
            <div className="text-sm font-mono text-slate-200 tabular-nums mt-1">
              {totalSuccesses} / {totalAttempts}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Cumulative Reward</div>
            <div className="text-xl font-bold font-mono text-rose-400 tabular-nums">
              {totalReward.toFixed(1)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Real-Time Sawtooth Waves and Sensor Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-Time Sawtooth AoI Waves */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide">
                  Instantaneous Age of Information Dynamics (Sawtooth Waveform)
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {DEFAULT_NODES_CONFIG.map((cfg, idx) => (
                  <div key={cfg.id} className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block"
                      style={{ backgroundColor: nodeColors[idx] }}
                    />
                    <span className="text-slate-300 font-mono text-[11px]">Node {cfg.id}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              AoI evolves as <span className="font-mono text-slate-300">Δ_i(t+1) = Δ_i(t) + 1</span> when idle or failed, and resets to <span className="font-mono text-slate-300">t + 1 - G_i(t)</span> on successful packet delivery.
            </p>

            {/* SVG Sawtooth Waveform */}
            <div className="w-full overflow-x-auto bg-slate-950/70 rounded-lg p-2 border border-slate-800">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto"
                style={{ minWidth: '600px' }}
              >
                {/* Horizontal Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding.top + plotHeight * (1 - ratio);
                  const aoiVal = Math.round(ratio * maxAoIInWindow);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={svgWidth - padding.right}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        fill="#64748b"
                        fontSize="10"
                        fontFamily="monospace"
                        textAnchor="end"
                      >
                        {aoiVal}
                      </text>
                    </g>
                  );
                })}

                {/* Y Axis Label */}
                <text
                  x={15}
                  y={padding.top + plotHeight / 2}
                  fill="#94a3b8"
                  fontSize="10"
                  fontFamily="monospace"
                  textAnchor="middle"
                  transform={`rotate(-90, 15, ${padding.top + plotHeight / 2})`}
                >
                  AoI (slots)
                </text>

                {/* Sawtooth Lines for each node */}
                {recentHistory.length > 1 &&
                  DEFAULT_NODES_CONFIG.map((_, nodeIdx) => {
                    const points = recentHistory.map((h, i) => {
                      const x = padding.left + (i / (recentHistory.length - 1)) * plotWidth;
                      const aoi = h.nodes[nodeIdx]?.aoi || 1;
                      const y = padding.top + (1 - aoi / maxAoIInWindow) * plotHeight;
                      return `${x},${y}`;
                    }).join(' ');

                    return (
                      <g key={nodeIdx}>
                        <polyline
                          fill="none"
                          stroke={nodeColors[nodeIdx]}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                      </g>
                    );
                  })}

                {/* X Axis slots indicators */}
                {recentHistory.length > 0 && (
                  <>
                    <text
                      x={padding.left}
                      y={svgHeight - 10}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      t = {recentHistory[0]?.slot}
                    </text>
                    <text
                      x={svgWidth - padding.right}
                      y={svgHeight - 10}
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      t = {recentHistory[recentHistory.length - 1]?.slot} (Latest)
                    </text>
                  </>
                )}
              </svg>
            </div>
          </div>

          {/* DQN Decision Explanation Callout */}
          <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
              <Zap className="w-3.5 h-3.5" />
              <span>DRL Decision Intelligence Insight</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {lastStep?.action === 0 ? (
                <>
                  Action <span className="font-mono text-cyan-300">a_t = 0 (Sleep)</span> selected. The DQN agent detected deep fades (PER=0.65) or empty queues on candidate sensors. By remaining idle, all nodes expend only <span className="font-mono text-emerald-400">1.5 mJ</span> instead of <span className="font-mono text-rose-400">16.0 mJ</span>, conserving battery while awaiting favorable Markov channel transitions.
                </>
              ) : lastStep ? (
                <>
                  Action <span className="font-mono text-cyan-300">a_t = {lastStep.action}</span> scheduled Node {lastStep.action}.
                  Link channel was in <span className={`font-semibold ${lastStep.activeChannelStateAtTx === 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{lastStep.activeChannelStateAtTx === 0 ? 'State 0 (Good, PER 0.05)' : 'State 1 (Deep Fade, PER 0.65)'}</span>.
                  Transmission status: <span className={`font-semibold ${lastStep.transmissionSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>{lastStep.transmissionSuccess ? 'SUCCESS (AoI Reset)' : 'FAILED / DROPPED (Penalty Incurred)'}</span>.
                </>
              ) : (
                'Press "Play Simulation" or "Step 1 Slot" to observe the real-time MDP scheduling decisions.'
              )}
            </p>
          </div>
        </div>

        {/* Right 1 Col: Gilbert-Elliott Channel State Visualizer */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Radio className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-200">
                Gilbert-Elliott Markov Fading Channels
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Two-state wireless link fading with Markov transition probabilities:
              <br />
              <span className="font-mono text-slate-300">P(Good → Bad) = 0.20</span>, <span className="font-mono text-slate-300">P(Bad → Good) = 0.40</span>.
            </p>

            <div className="space-y-3">
              {nodes.map((node, idx) => {
                const isGood = node.channelState === 0;
                return (
                  <div
                    key={node.id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: nodeColors[idx] }}
                        />
                        <span className="text-xs font-semibold text-slate-200">
                          {node.config.name}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {node.config.hardware} · {node.config.gpioPins}
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium ${
                          isGood
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {isGood ? 'State 0 (Good)' : 'State 1 (Deep Fade)'}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        PER: {isGood ? '5%' : '65%'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Markov Chain Theoretical Steady State Box */}
            <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                Theoretical Stationary Distribution:
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[11px]">
                <div>
                  π_Good = q / (p + q) = <span className="text-emerald-400 font-bold">66.7%</span>
                </div>
                <div>
                  π_Bad = p / (p + q) = <span className="text-rose-400 font-bold">33.3%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Want full 1,000-slot comparative proof?</span>
            <button
              onClick={onSwitchToBenchmark}
              className="text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
            >
              Open Benchmark Studio →
            </button>
          </div>
        </div>
      </div>

      {/* Sensor Node Telemetry Hardware Cards (3 Nodes) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {nodes.map((node, idx) => {
          const batteryPct = (node.batteryRemaining / params.initialBattery) * 100;
          const avgPeak =
            node.peakAoI.length > 0
              ? (node.peakAoI.reduce((a, b) => a + b, 0) / node.peakAoI.length).toFixed(1)
              : '--';

          return (
            <div
              key={node.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: nodeColors[idx] }}
              />

              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-mono text-slate-400">Node {node.id} Telemetry</div>
                  <h4 className="text-base font-bold text-slate-100">{node.config.name}</h4>
                  <div className="text-xs text-slate-400">{node.config.sensorType}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 uppercase font-mono">Weight w_{node.id}</div>
                  <div className="text-sm font-bold font-mono text-cyan-400">{node.config.weight}</div>
                </div>
              </div>

              {/* AoI Gauge */}
              <div className="my-4 p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-baseline justify-between">
                <div>
                  <div className="text-[11px] font-mono uppercase text-slate-400">Instantaneous AoI Δ_{node.id}(t)</div>
                  <div className="text-3xl font-extrabold font-mono text-slate-100 tabular-nums">
                    {node.currentAoI} <span className="text-sm text-slate-400 font-normal">slots</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-mono uppercase text-slate-400">Avg Peak AoI</div>
                  <div className="text-base font-bold font-mono text-amber-400 tabular-nums">
                    {avgPeak} <span className="text-xs text-slate-500 font-normal">slots</span>
                  </div>
                </div>
              </div>

              {/* LCFS Buffer & Arrival Rate */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-400">LCFS Single Buffer</div>
                  <div className="font-semibold mt-0.5">
                    {node.hasPacketInBuffer ? (
                      <span className="text-emerald-400">Fresh Packet (t={node.bufferPacketGenTime})</span>
                    ) : (
                      <span className="text-slate-500">Buffer Empty</span>
                    )}
                  </div>
                </div>
                <div className="p-2 bg-slate-950 rounded border border-slate-800">
                  <div className="text-[10px] uppercase font-mono text-slate-400">Arrival Rate λ_{node.id}</div>
                  <div className="font-mono text-slate-200 mt-0.5">{node.config.arrivalRate} pkts/slot</div>
                </div>
              </div>

              {/* Battery Monitor */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Battery className="w-3.5 h-3.5 text-amber-400" />
                    Battery Remaining:
                  </span>
                  <span className="font-bold tabular-nums">
                    {node.batteryRemaining.toFixed(1)} / {params.initialBattery} mJ ({batteryPct.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full transition-all duration-300 rounded-full ${
                      batteryPct > 50
                        ? 'bg-emerald-500'
                        : batteryPct > 20
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${batteryPct}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                  <span>Tx Spent: {node.totalTxEnergy.toFixed(1)} mJ</span>
                  <span>Idle Spent: {node.totalIdleEnergy.toFixed(1)} mJ</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Slot Event Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">
            Real-Time Slot-by-Slot Scheduler Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Displaying latest {recentHistory.length} discrete steps
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Slot t</th>
                <th className="py-2.5 px-3">Action Selected</th>
                <th className="py-2.5 px-3">Channel States [N1, N2, N3]</th>
                <th className="py-2.5 px-3">Tx Outcome</th>
                <th className="py-2.5 px-3">AoI [N1, N2, N3]</th>
                <th className="py-2.5 px-3">Energy (mJ)</th>
                <th className="py-2.5 px-3 text-right">Step Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentHistory.slice(-8).reverse().map((step) => (
                <tr key={step.slot} className="hover:bg-slate-800/40">
                  <td className="py-2 px-3 text-slate-300 font-bold">t = {step.slot}</td>
                  <td className="py-2 px-3">
                    <span className={step.action === 0 ? 'text-slate-400' : 'text-cyan-400 font-semibold'}>
                      {step.actionLabel}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="text-slate-300">
                      [{step.nodes.map((n) => (n.channelState === 0 ? 'G' : 'B')).join(', ')}]
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {step.transmissionAttempted ? (
                      step.transmissionSuccess ? (
                        <span className="text-emerald-400 font-semibold">Delivered (ACK)</span>
                      ) : (
                        <span className="text-rose-400">Dropped (Fade)</span>
                      )
                    ) : (
                      <span className="text-slate-500">Sleep (Idle)</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-slate-300">
                    [{step.nodes.map((n) => n.aoi).join(', ')}]
                  </td>
                  <td className="py-2 px-3 text-amber-400 tabular-nums">
                    {step.instantaneousEnergy.toFixed(1)} mJ
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-rose-400 tabular-nums">
                    {step.totalReward.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
