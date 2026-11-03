/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Academic Project: Age-of-Information-Aware Deep Reinforcement Learning for
 * Energy-Efficient Wireless Sensor Scheduling
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

export type ChannelState = 0 | 1; // 0 = Good, 1 = Bad (Deep Fade)

export interface SensorNodeConfig {
  id: number;
  name: string;
  sensorType: string;
  hardware: string;
  arrivalRate: number; // lambda_i
  weight: number; // w_i in multi-objective reward
  gpioPins: string;
  telemetryType: string;
}

export interface SensorNodeRuntime {
  id: number;
  config: SensorNodeConfig;
  currentAoI: number; // Delta_i(t)
  peakAoI: number[]; // History of PAoI values
  lastDeliveredGenTime: number; // U_i(t)
  hasPacketInBuffer: boolean; // LCFS buffer state (0 or 1)
  bufferPacketGenTime: number | null; // Generation timestamp of packet in buffer
  channelState: ChannelState; // Current Markov state (0 or 1)
  batteryRemaining: number; // B_i(t) in mJ (starts at 1000.0)
  totalTxEnergy: number; // Cumulative Tx energy in mJ
  totalIdleEnergy: number; // Cumulative Idle energy in mJ
  successfulPackets: number; // Delivered to sink
  failedPackets: number; // Dropped due to fading channel PER
  attemptedTransmissions: number; // Number of times scheduled
}

export interface SimulationStepResult {
  slot: number;
  action: number; // 0: Idle/Sleep, 1..3: Node 1..3 scheduled
  actionLabel: string;
  nodes: {
    id: number;
    aoi: number;
    channelState: ChannelState;
    hasPacket: boolean;
    battery: number;
  }[];
  transmissionAttempted: boolean;
  transmissionSuccess: boolean;
  txFailurePenalty: number;
  instantaneousEnergy: number; // Total energy consumed this slot (mJ)
  weightedAoIPenalty: number;
  energyPenalty: number;
  totalReward: number; // R(s_t, a_t)
  activeChannelStateAtTx?: ChannelState;
}

export interface PolicyMetrics {
  policyName: string;
  totalSlots: number;
  averageAoI: number;
  averagePeakAoI: number;
  packetDeliveryRatio: number; // PDR %
  averageLatencySlots: number; // (Delivery Time - Gen Time)
  energyPerSuccessfulUpdate: number; // mJ / successful update
  totalEnergyExpended: number; // mJ
  successfulUpdates: number;
  failedTransmissions: number;
  idleSlotsCount: number;
  batteryDepletionPercent: number;
  aoiTimeline: number[][]; // [slot][nodeIndex]
  rewardTimeline: number[];
}

export type SchedulingPolicy = 'DQN' | 'GREEDY_MAX_AOI' | 'ROUND_ROBIN' | 'RANDOM';
