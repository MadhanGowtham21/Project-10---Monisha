/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PyTorch DRL Code Studio & Neural Network Architecture Explorer
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  Layers,
  Cpu,
  Terminal,
  FileCode,
  Sparkles,
} from 'lucide-react';
import {
  PYTORCH_ENV_CODE,
  PYTORCH_DQN_CODE,
  PYTORCH_TRAIN_EVALUATE_CODE,
  PYTORCH_REQUIREMENTS,
} from '../data/pytorchCode';

export const PyTorchCodeStudio: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'env' | 'dqn' | 'train' | 'req'>('env');
  const [copied, setCopied] = useState<boolean>(false);

  const fileMap = {
    env: { name: 'aoi_env.py', code: PYTORCH_ENV_CODE, desc: 'Gymnasium MDP Simulation Environment with Markov Fading' },
    dqn: { name: 'dqn_agent.py', code: PYTORCH_DQN_CODE, desc: 'PyTorch 3-Layer MLP, Replay Buffer (15k), & Target Network' },
    train: { name: 'train_evaluate.py', code: PYTORCH_TRAIN_EVALUATE_CODE, desc: 'Training Loop & Comparative Baseline Benchmarking' },
    req: { name: 'requirements.txt', code: PYTORCH_REQUIREMENTS, desc: 'Python Dependencies for Local or Colab Execution' },
  };

  const current = fileMap[activeFile];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = current.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Architecture Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              PyTorch DRL Core Architecture
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              Production-Grade Deep Q-Network for Fading-Aware AoI Scheduling
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Complete, syntax-validated Python 3.10+ / PyTorch implementation. Fully compatible with Gymnasium, CUDA GPU acceleration, and Google Colab for Monisha's M.E. Communication Systems thesis submission.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {current.name}</span>
            </button>
          </div>
        </div>

        {/* Neural Network Dimensions Visual Representation */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2 font-mono">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>QNetwork Layer Dimensions & Hyperparameter Specifications</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Input State Vector</div>
              <div className="text-sm font-bold text-cyan-400 mt-0.5">Dim: 12 Features</div>
              <div className="text-[10px] text-slate-500 mt-1">
                AoI [3], Queues [3], Channels [3], Batteries [3]
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Hidden Layer MLP</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">64 ReLU → 64 ReLU</div>
              <div className="text-[10px] text-slate-500 mt-1">
                Kaiming normal initialization, clip norm 1.0
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Output Action Q-Values</div>
              <div className="text-sm font-bold text-amber-400 mt-0.5">Dim: 4 Actions</div>
              <div className="text-[10px] text-slate-500 mt-1">
                a=0 (Sleep), a=1 (Node 1), a=2 (Node 2), a=3 (Node 3)
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
              <div className="text-slate-400 text-[10px] uppercase">Hyperparameters</div>
              <div className="text-sm font-bold text-purple-400 mt-0.5">Adam lr=0.002, γ=0.92</div>
              <div className="text-[10px] text-slate-500 mt-1">
                Replay: 15k, Batch: 64, Target Sync: 40 steps
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Code Editor / Viewer */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* File Tabs */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1">
            {(['env', 'dqn', 'train', 'req'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveFile(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-t transition-colors cursor-pointer ${
                  activeFile === key
                    ? 'bg-slate-900 text-cyan-400 font-bold border-t-2 border-t-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{fileMap[key].name}</span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            {current.desc}
          </span>
        </div>

        {/* Code Content Container */}
        <div className="p-4 bg-slate-950/90 overflow-x-auto max-h-[580px] font-mono text-xs text-slate-300 leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
          <pre className="tab-size-4">
            <code>{current.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
