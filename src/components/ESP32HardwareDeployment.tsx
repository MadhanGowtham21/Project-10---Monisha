/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Phase 2 ESP32 Embedded Hardware Deployment & Gateway Studio
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

import React, { useState } from 'react';
import {
  Cpu,
  Wifi,
  Terminal,
  Download,
  Copy,
  Check,
  Radio,
  FileCode,
  HardDrive,
  Info,
} from 'lucide-react';
import {
  ESP32_NODE1_CODE,
  ESP32_NODE2_CODE,
  ESP32_NODE3_CODE,
  PYTHON_BASE_STATION_CODE,
} from '../data/esp32Code';

export const ESP32HardwareDeployment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'node1' | 'node2' | 'node3' | 'gateway'>('node1');
  const [copied, setCopied] = useState<boolean>(false);

  const tabData = {
    node1: {
      name: 'node1_dht22.ino',
      title: 'Node 1: ESP32 + DHT22',
      sensor: 'Temperature & Humidity (λ₁ = 0.7)',
      pinout: 'DATA: GPIO 4, VCC: 3.3V, GND: GND (4.7kΩ pull-up)',
      code: ESP32_NODE1_CODE,
    },
    node2: {
      name: 'node2_hcsr04.ino',
      title: 'Node 2: ESP32 + HC-SR04',
      sensor: 'Ultrasonic Distance (λ₂ = 0.5)',
      pinout: 'TRIG: GPIO 5, ECHO: GPIO 18 (via 1k/2k voltage divider for 3.3V logic)',
      code: ESP32_NODE2_CODE,
    },
    node3: {
      name: 'node3_ldr.ino',
      title: 'Node 3: ESP32 + LDR Analog',
      sensor: 'Ambient Light Intensity (λ₃ = 0.3)',
      pinout: 'ANALOG: GPIO 34 (ADC1_CH6) with 10kΩ pull-down resistor',
      code: ESP32_NODE3_CODE,
    },
    gateway: {
      name: 'gateway_base_station.py',
      title: 'Base Station Central Sink',
      sensor: 'DRL Polling Coordinator & Real-Time Monitor',
      pinout: 'Host PC / Raspberry Pi with UDP Socket on 0.0.0.0:4200',
      code: PYTHON_BASE_STATION_CODE,
    },
  };

  const current = tabData[activeTab];

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
      {/* Hardware Architecture Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              Phase 2 Embedded Deployment Architecture
            </div>
            <h3 className="text-base font-bold text-slate-100 mt-1">
              3-Node ESP32 Wireless Sensor Network & Base Station Polling Protocol
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Real-world embedded prototype implementing Last-Come-First-Served (LCFS) single-packet replacement buffers, Wi-Fi UDP polling commands, and non-blocking modem power saving.
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

        {/* Embedded Star Network Topology Diagram */}
        <div className="mt-5 pt-4 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center gap-2 font-mono">
            <Wifi className="w-4 h-4 text-cyan-400" />
            <span>Wireless Polling Star Topology (UDP Port 4200 ↔ 4210)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            {/* Base Station Gateway */}
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/40 rounded-lg">
              <div className="text-cyan-400 font-bold uppercase text-[10px]">Central Sink Gateway</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">Python PC Base Station</div>
              <div className="text-[11px] text-slate-300 mt-1">IP: 192.168.4.1:4200</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Evaluates PyTorch DQN policy, emits <span className="text-cyan-300">"POLL_i"</span>, measures AoI & RSSI.
              </div>
            </div>

            {/* Node 1 */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-emerald-400 font-bold uppercase text-[10px]">Node 1 (DHT22)</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">ESP32 DevKit V1</div>
              <div className="text-[11px] text-slate-300 mt-1">IP: 192.168.4.11:4210</div>
              <div className="text-[10px] text-slate-400 mt-1">
                GPIO 4 DATA · λ₁ = 0.7 pkts/slot · LCFS Buffer
              </div>
            </div>

            {/* Node 2 */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-emerald-400 font-bold uppercase text-[10px]">Node 2 (HC-SR04)</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">ESP32 DevKit V1</div>
              <div className="text-[11px] text-slate-300 mt-1">IP: 192.168.4.12:4210</div>
              <div className="text-[10px] text-slate-400 mt-1">
                GPIO 5 TRIG, 18 ECHO · λ₂ = 0.5 pkts/slot
              </div>
            </div>

            {/* Node 3 */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
              <div className="text-emerald-400 font-bold uppercase text-[10px]">Node 3 (LDR)</div>
              <div className="text-sm font-bold text-slate-100 mt-0.5">ESP32 DevKit V1</div>
              <div className="text-[11px] text-slate-300 mt-1">IP: 192.168.4.13:4210</div>
              <div className="text-[10px] text-slate-400 mt-1">
                GPIO 34 ADC1_CH6 · λ₃ = 0.3 pkts/slot
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Specs & Pinout Info Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <span className="text-slate-400">Target Module:</span>{' '}
            <strong className="text-cyan-400">{current.title}</strong>
          </div>
          <div>
            <span className="text-slate-400">Sensor Type:</span>{' '}
            <span className="text-slate-200">{current.sensor}</span>
          </div>
        </div>
        <div className="pt-2 text-slate-300 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Wiring & Pinout: {current.pinout}</span>
        </div>
      </div>

      {/* Code Editor */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-1">
            {(['node1', 'node2', 'node3', 'gateway'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono rounded-t transition-colors cursor-pointer ${
                  activeTab === key
                    ? 'bg-slate-900 text-cyan-400 font-bold border-t-2 border-t-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{tabData[key].name}</span>
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            Production C++ / Python UDP Socket Code
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 bg-slate-950/90 overflow-x-auto max-h-[580px] font-mono text-xs text-slate-300 leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
          <pre className="tab-size-4">
            <code>{current.code}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
