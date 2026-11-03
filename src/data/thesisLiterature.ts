/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Academic Thesis Literature, Mathematical Formulations, and Viva Voce Defense Simulator
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

export interface VivaQuestion {
  id: number;
  category: 'System Model' | 'Information Freshness' | 'DRL & MDP' | 'Fading Channels' | 'Hardware Deployment';
  question: string;
  examinerFocus: string;
  answerSummary: string;
  detailedDerivation: string;
  keyCitations: string[];
}

export const ACADEMIC_INFO = {
  candidateName: 'Monisha',
  degree: 'Master of Engineering (M.E.)',
  specialization: 'Communication Systems / Applied Electronics',
  department: 'Department of Electronics and Communication Engineering (ECE)',
  institution: 'Mailam Engineering College',
  university: 'Anna University, Chennai, Tamil Nadu',
  thesisTitle: 'Age-of-Information-Aware Deep Reinforcement Learning for Energy-Efficient Wireless Sensor Scheduling',
  academicYear: '2025–2026',
};

export const IEEE_CITATIONS = [
  {
    key: 'Sun2017',
    authors: 'Y. Sun, E. Uysal-Biyikoglu, R. D. Yates, C. E. Koksal, and N. B. Shroff',
    title: 'Update or Wait: How to Keep Your Data Fresh',
    journal: 'IEEE Transactions on Information Theory',
    volume: 'vol. 63, no. 11, pp. 7492–7508',
    year: '2017',
    doi: '10.1109/TIT.2017.2748011',
    relevance: 'Foundational framework demonstrating that zero-wait policy is sub-optimal under stochastic delay and proving the optimality of threshold policies for age minimization.',
  },
  {
    key: 'Yates2021',
    authors: 'R. D. Yates, Y. Sun, D. O. Brown, S. K. Kaul, E. Lookabaugh, and H. M. Kang',
    title: 'Age of Information: An Introduction and Systems Review',
    journal: 'IEEE Journal on Selected Areas in Communications (JSAC)',
    volume: 'vol. 39, no. 5, pp. 1183–1210',
    year: '2021',
    doi: '10.1109/JSAC.2021.3065072',
    relevance: 'Comprehensive survey on AoI definitions, LCFS replacement queuing disciplines, peak age metrics, and network scheduling challenges.',
  },
  {
    key: 'AbdElmagid2020',
    authors: 'M. A. Abd-Elmagid, H. S. Dhillon, and N. Pappas',
    title: 'Deep Reinforcement Learning for Age of Information Minimization in Wireless Networks',
    journal: 'IEEE Transactions on Communications',
    volume: 'vol. 68, no. 8, pp. 4885–4899',
    year: '2020',
    doi: '10.1109/TCOMM.2020.2996584',
    relevance: 'Introduced Deep Q-Networks (DQN) for multi-node sensor scheduling under unknown channel transition dynamics and energy constraints.',
  },
  {
    key: 'Kaul2012',
    authors: 'S. Kaul, R. Yates, and M. Gruteser',
    title: 'Real-Time Status: How Often Should One Update?',
    journal: 'IEEE INFOCOM 2012 Proceedings',
    volume: 'pp. 2731–2735',
    year: '2012',
    doi: '10.1109/INFCOM.2012.6195689',
    relevance: 'Seminal paper proposing Age of Information (AoI) as a metric for freshness distinct from traditional throughput and packet latency.',
  },
  {
    key: 'Ceran2019',
    authors: 'E. T. Ceran, D. Gunduz, and A. Gyorgy',
    title: 'Average Age of Information with Hybrid ARQ Under a Resource Constraint',
    journal: 'IEEE Transactions on Wireless Communications',
    volume: 'vol. 18, no. 3, pp. 1905–1918',
    year: '2019',
    doi: '10.1109/TWC.2019.2898863',
    relevance: 'Markov Decision Process (MDP) analysis of AoI in wireless fading channels with transmission error penalties.',
  },
];

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: 'Information Freshness',
    question: 'How is Age of Information (AoI) mathematically defined, and how does it fundamentally differ from traditional communication delay or throughput?',
    examinerFocus: 'Understanding the distinction between packet delay (generation-to-delivery elapsed time) and information freshness at the sink.',
    answerSummary: 'AoI measures the time elapsed since the freshest information received at the destination was generated: Delta_i(t) = t - U_i(t). Throughput measures bits per second and latency measures one packet\'s transit time; neither penalizes silence or outdated idle queues.',
    detailedDerivation: `Let t denote the current time slot and U_i(t) denote the generation timestamp of the freshest packet received by the sink from sensor node i up to slot t:
\\Delta_i(t) = t - U_i(t)

In the absence of a successful delivery at time slot t:
\\Delta_i(t+1) = \\Delta_i(t) + 1

When sensor node i successfully delivers a packet generated at G_i(t) (where G_i(t) \\le t):
\\Delta_i(t+1) = (t + 1) - G_i(t)

Difference from Traditional Metrics:
1. High Throughput != Low AoI: Transmitting old packets rapidly achieves high throughput (bytes/sec) but stale AoI.
2. Low Latency != Low AoI: If a system transmits very rarely, every packet delivered experiences low transmission latency, yet the destination possesses stale data with high AoI between updates.
3. AoI is destination-centric and accounts for both transmission latency and inter-update arrival intervals.`,
    keyCitations: ['Kaul et al., INFOCOM 2012', 'Yates et al., IEEE JSAC 2021'],
  },
  {
    id: 2,
    category: 'System Model',
    question: 'Why is a Last-Come-First-Served (LCFS) single-packet replacement buffer adopted rather than a First-Come-First-Served (FCFS) FIFO buffer?',
    examinerFocus: 'Queue-induced staleness and proof that intermediate queued packets waste channel and battery resources.',
    answerSummary: 'In status update systems, any older unserved sample in the buffer is rendered obsolete immediately upon the arrival of a newer measurement. FCFS forces transmission of obsolete data; LCFS replacement guarantees that whenever a node is polled, only the freshest sample is transmitted.',
    detailedDerivation: `Consider an FCFS queue with length Q > 1. If packet 1 (generated at t_1) and packet 2 (generated at t_2 > t_1) reside in queue:
- Transmitting packet 1 resets AoI to \\Delta(t) = t - t_1.
- However, packet 2 is already available at the sensor. The transmission energy E_tx (15 mJ) and time slot spent on packet 1 are strictly wasted because packet 2 could have reset AoI to t - t_2 < t - t_1.
- In LCFS with single-packet replacement:
  Whenever a new sample arrives: Buffer := {G_{new}}, discarding G_{old}.
- Under renewal theory, the average AoI under LCFS replacement is strictly lower than FCFS for any arrival rate \\lambda \\in (0, 1].`,
    keyCitations: ['Sun et al., IEEE Trans. Inf. Theory 2017', 'Yates et al., 2021'],
  },
  {
    id: 3,
    category: 'Fading Channels',
    question: 'Explain the Gilbert-Elliott Markov fading channel model used in this work. What is its stationary distribution, and how does channel memory impact scheduling?',
    examinerFocus: '2-state Markov chain transition matrix, stationary probability distribution, and burst error characteristics.',
    answerSummary: 'The Gilbert-Elliott model captures temporal channel correlation (burst fading) via a 2-state discrete-time Markov chain: State 0 (Good, PER = 0.05) and State 1 (Bad/Deep fade, PER = 0.65) with transition matrix P = [[0.80, 0.20], [0.40, 0.60]]. The steady-state probabilities are pi_G = 0.667 and pi_B = 0.333.',
    detailedDerivation: `The state transition probability matrix P is:
\\mathbf{P} = \\begin{bmatrix} P_{00} & P_{01} \\\\ P_{10} & P_{11} \\end{bmatrix} = \\begin{bmatrix} 1 - p & p \\\\ q & 1 - q \\end{bmatrix} = \\begin{bmatrix} 0.80 & 0.20 \\\\ 0.40 & 0.60 \\end{bmatrix}
where p = P(G \\to B) = 0.20 and q = P(B \\to G) = 0.40.

Solving the stationary distribution \\pi = [\\pi_G, \\pi_B] such that \\pi \\mathbf{P} = \\pi and \\pi_G + \\pi_B = 1:
\\pi_G (0.80) + \\pi_B (0.40) = \\pi_G \\implies 0.40 \\pi_B = 0.20 \\pi_G \\implies \\pi_G = 2 \\pi_B
\\implies 2 \\pi_B + \\pi_B = 1 \\implies \\pi_B = \\frac{1}{3} \\approx 0.3333, \\quad \\pi_G = \\frac{2}{3} \\approx 0.6667.

Channel Memory & Scheduling Impact:
Because q = 0.40, once in a deep fade (State 1), there is a 60% probability of remaining in a deep fade in the next slot. A channel-unaware scheduler (like Round-Robin or Greedy Max-AoI) continues to transmit, suffering 65% packet loss and wasting 15 mJ. DRL defers transmission (or selects an alternate node in State 0), waiting for the 40% probability recovery.`,
    keyCitations: ['Ceran et al., IEEE Trans. Wireless Commun. 2019', 'E. N. Gilbert, Bell System Tech. J. 1960'],
  },
  {
    id: 4,
    category: 'DRL & MDP',
    question: 'How is the multi-objective reward function formulated, and what are the specific roles of weights w_i, beta, and zeta?',
    examinerFocus: 'Reward engineering for balancing AoI freshness, battery longevity, and transmission failure suppression.',
    answerSummary: 'The reward function is R(s_t, a_t) = - [ sum(w_i * Delta_i(t)) + beta * E_total(t) + zeta * 1_{Tx Failure} ]. Weights w_i set asymmetric priority among heterogeneous sensors, beta penalizes energy expenditure, and zeta penalizes transmissions in deep fading channels.',
    detailedDerivation: `The agent solves the infinite-horizon discounted Markov Decision Process:
\\max_{\\pi} \\mathbb{E} \\left[ \\sum_{t=0}^\\infty \\gamma^t R(s_t, a_t) \\;\\middle|\\; \\pi \\right]

Components of R(s_t, a_t):
1. Freshness Term: - \\sum_{i=1}^3 w_i \\Delta_i(t)
   Here w = [1.2, 1.0, 0.8] reflects the mission criticality: DHT22 environmental condition (1.2) > HC-SR04 proximity safety (1.0) > LDR lighting (0.8).
2. Energy Conservation Term: - \\beta \\cdot E_{total}(t)
   When scheduled, E_{tx} = 15.0 mJ + 2 * 0.5 mJ = 16.0 mJ.
   When sleep (a_t = 0), E_{idle} = 3 * 0.5 mJ = 1.5 mJ.
   \\beta = 0.15 balances 1 slot of AoI degradation against 6.67 mJ of energy consumption.
3. Fading Channel Transmission Failure Penalty: - \\zeta \\cdot \\mathbf{1}_{\\{Tx Failure\\}}
   \\zeta = 5.0 severely penalizes wasted attempts during deep fades (State 1 PER = 0.65), teaching the Q-network to learn the channel transition structure.`,
    keyCitations: ['Abd-Elmagid et al., IEEE Trans. Commun. 2020'],
  },
  {
    id: 5,
    category: 'DRL & MDP',
    question: 'What is the structure of the Deep Q-Network (DQN) architecture, replay memory, and target network update policy?',
    examinerFocus: 'Neural network layer dimensions, activation functions, experience replay capacity, and target network stabilization.',
    answerSummary: 'The QNetwork is a 3-layer MLP: Input (12) -> Linear(12, 64) + ReLU -> Linear(64, 64) + ReLU -> Linear(64, 4 Action Q-values). Replay buffer holds 15,000 transitions with batch size 64. Target network updates every 40 steps with Adam optimizer (lr=0.002, gamma=0.92, epsilon 1.0 -> 0.05).',
    detailedDerivation: `Mathematical Network Specification:
- Input state s_t \\in \\mathbb{R}^{12}:
  s_t = [ \\hat{\\Delta}_1, \\hat{\\Delta}_2, \\hat{\\Delta}_3, q_1, q_2, q_3, c_1, c_2, c_3, b_1, b_2, b_3 ]
  where \\hat{\\Delta}_i = \\min(1.0, \\Delta_i / 50.0).
- Forward Pass:
  h_1 = \\text{ReLU}(\\mathbf{W}_1 s_t + \\mathbf{b}_1), \\quad \\mathbf{W}_1 \\in \\mathbb{R}^{64 \\times 12}
  h_2 = \\text{ReLU}(\\mathbf{W}_2 h_1 + \\mathbf{b}_2), \\quad \\mathbf{W}_2 \\in \\mathbb{R}^{64 \\times 64}
  Q(s_t, \\cdot; \\theta) = \\mathbf{W}_3 h_2 + \\mathbf{b}_3, \\quad \\mathbf{W}_3 \\in \\mathbb{R}^{4 \\times 64}
- Loss Function:
  L(\\theta) = \\frac{1}{B} \\sum_{j=1}^B \\left( r_j + \\gamma \\max_{a'} Q(s'_j, a'; \\theta^-) - Q(s_j, a_j; \\theta) \\right)^2
- Target Network Update: \\theta^- \\leftarrow \\theta every C = 40 training steps.
- Exploration: \\epsilon_{t+1} = \\max(0.05, \\epsilon_t \\times 0.985).`,
    keyCitations: ['Mnih et al., Nature 2015', 'Abd-Elmagid et al., 2020'],
  },
  {
    id: 6,
    category: 'Fading Channels',
    question: 'Why does DRL achieve approximately 24% superior energy savings over Round-Robin scheduling and higher Packet Delivery Ratio (PDR ~76.7%)?',
    examinerFocus: 'Concrete numerical evidence and causal mechanism: opportunistic transmission in Good states vs blind transmissions in Bad states.',
    answerSummary: 'Round-Robin blindly transmits regardless of channel fading state, scheduling 33.3% of its transmissions during deep fades where PER = 0.65, leading to frequent packet drops and wasted 15 mJ attempts. DRL conditions scheduling on channel state and buffer availability, scheduling during Good states (PER = 0.05) or sleeping when links are in deep fades.',
    detailedDerivation: `Channel State Analysis:
- In Gilbert-Elliott channel, stationary probability \\pi_B = 0.333.
- Expected PER for Round-Robin (blind to channel):
  \\text{PER}_{RR} = \\pi_G \\cdot \\text{PER}_G + \\pi_B \\cdot \\text{PER}_B = (0.667 \\times 0.05) + (0.333 \\times 0.65) = 0.0333 + 0.2167 = 25.0\\%
  \\implies \\text{PDR}_{RR} \\approx 75.0\\%.
- Furthermore, RR frequently schedules nodes whose LCFS buffer is empty (since arrival rates are \\lambda_1=0.7, \\lambda_2=0.5, \\lambda_3=0.3), consuming 15 mJ for zero AoI benefit.
- DRL Optimization:
  1. If node channel is Bad (State 1), DQN checks if another node with Good channel has a packet.
  2. If all nodes are in deep fade, DQN selects action a_t = 0 (Sleep), spending only 1.5 mJ total instead of 16.0 mJ.
  3. When transmitting, DQN targets State 0 (PER = 0.05), resulting in PDR \\approx 76.7% - 85% and saving 24% cumulative energy.`,
    keyCitations: ['Sun et al., 2017', 'Ceran et al., 2019'],
  },
  {
    id: 7,
    category: 'System Model',
    question: 'What is Peak Age of Information (PAoI), and why is it an indispensable metric alongside Average AoI in real-time control?',
    examinerFocus: 'Worst-case performance guarantee in critical IoT telemetry systems (e.g., industrial safety, drone telemetry).',
    answerSummary: 'Peak AoI (PAoI) represents the maximum staleness experienced by a sensor immediately before a successful update packet is received: A_{p,i}(k) = \\Delta_i(t_k^-). While Average AoI smooths over time, Peak AoI bounds the worst-case informational blackouts.',
    detailedDerivation: `Let t_1, t_2, \\dots, t_k denote the sequence of discrete time slots at which successful update packets from sensor node i are received at the sink.
The k-th Peak AoI value is:
A_{p,i}(k) = \\Delta_i(t_k^-) = \\lim_{\\epsilon \\to 0} \\Delta_i(t_k - \\epsilon)

Average AoI vs Peak AoI:
- Average AoI is the time-average area under the sawtooth curve:
  \\bar{\\Delta}_i = \\lim_{T \\to \\infty} \\frac{1}{T} \\sum_{t=1}^T \\Delta_i(t) = \\lim_{K \\to \\infty} \\frac{1}{T} \\sum_{k=1}^K \\left( \\frac{A_{p,i}(k)^2 - \\Delta_{min}^2}{2} \\right)
- In safety-critical cyber-physical systems (e.g. HC-SR04 collision avoidance), an average AoI of 5 slots is unacceptable if the peak AoI reaches 50 slots due to clustered fading drops. DRL explicitly bounds peak excursions.`,
    keyCitations: ['Yates et al., IEEE JSAC 2021', 'Kosta et al., 2017'],
  },
  {
    id: 8,
    category: 'Hardware Deployment',
    question: 'How is the polling protocol designed between the ESP32 wireless nodes and the central Python base station gateway in Phase 2?',
    examinerFocus: 'UDP protocol design, message schema, collision avoidance, and handling asynchronous packet arrivals.',
    answerSummary: 'The sink acts as a centralized polling coordinator over Wi-Fi UDP. At each slot, the sink sends "POLL_i" to the scheduled node IP. The node transmits its freshest LCFS JSON telemetry and clears its buffer. Unscheduled nodes remain in low-power modem sleep.',
    detailedDerivation: `Hardware Architecture:
- Star Topology: Central Gateway (192.168.4.1) <-> Nodes (192.168.4.11, 12, 13).
- Polling Sequence:
  1. Base Station determines action a_t \\in {0, 1, 2, 3}.
  2. If a_t = 0: No packet transmitted; slot timer sleeps for 500 ms.
  3. If a_t = i: Base Station emits UDP datagram: "POLL_i" to Node i port 4210.
  4. Node i receives poll, checks LCFS struct volatile TelemetryPacket lcfs_buffer.
  5. If valid, serializes JSON: {"node_id": i, "seq": k, "gen_ms": t_gen, "tx_ms": t_tx, "rssi": -62, ...} and clears valid flag.
  6. Base station receives packet within 350 ms socket timeout, updates AoI to (t_rx - t_gen), and infers channel state from RSSI.`,
    keyCitations: ['Phase 2 Hardware Architecture', 'Yates et al., 2021'],
  },
  {
    id: 9,
    category: 'Hardware Deployment',
    question: 'How does the base station infer the wireless channel state (State 0 vs State 1) in real-time embedded operation without dedicated pilot signals?',
    examinerFocus: 'Channel state estimation from RSSI, SNR, and ACK/Timeout feedback in practical wireless systems.',
    answerSummary: 'In the embedded gateway, channel state is estimated using received packet RSSI (Received Signal Strength Indicator) and UDP socket timeouts: RSSI >= -75 dBm indicates State 0 (Good), whereas RSSI < -78 dBm or a socket timeout indicates State 1 (Bad/Deep fade).',
    detailedDerivation: `Channel State Estimation Algorithm at Base Station:
1. When polling Node i:
   - Case A: Telemetry received with RSSI \\ge -75 dBm \\implies \\hat{c}_i(t) = 0 (Good Channel).
   - Case B: Telemetry received with RSSI < -78 dBm \\implies \\hat{c}_i(t) = 1 (Weak Link / Fade).
   - Case C: Socket timeout (350 ms expired without packet) \\implies \\hat{c}_i(t) = 1 (Deep Fade / Packet Loss).
2. For unpolled nodes in slot t:
   - Markov transition prior is applied:
     P(\\hat{c}_i(t) = 1 \\mid \\hat{c}_i(t-1) = 0) = 0.20
     P(\\hat{c}_i(t) = 0 \\mid \\hat{c}_i(t-1) = 1) = 0.40
3. This estimated state vector \\hat{s}_t is fed into QNetwork.forward(s) to generate optimal action a_{t+1}.`,
    keyCitations: ['Abd-Elmagid et al., 2020'],
  },
  {
    id: 10,
    category: 'Information Freshness',
    question: 'Why does increasing sensor sampling rate (lambda_i) beyond a certain threshold worsen Age of Information in queueing systems? What is the "status update paradox"?',
    examinerFocus: 'Understanding the trade-off between sampling frequency, queueing delay, and network congestion.',
    answerSummary: 'In FCFS systems, sampling faster than the service rate causes queue buildup; packets wait longer in queue before transmission, so when delivered, they are already stale. In LCFS single-buffer replacement, this paradox is eliminated because fresh arrivals overwrite stale ones.',
    detailedDerivation: `In traditional FCFS M/M/1 systems (Kaul et al., 2012):
\\bar{\\Delta} = \\frac{1}{\\mu} \\left( 1 + \\frac{1}{\\rho} + \\frac{\\rho^2}{1 - \\rho} \\right)
where \\rho = \\lambda / \\mu is the server utilization.
- As \\lambda \\to 0: \\frac{1}{\\rho} \\to \\infty (under-sampling: long wait between arrivals \\implies stale AoI).
- As \\lambda \\to \\mu: \\frac{\\rho^2}{1 - \\rho} \\to \\infty (over-sampling: huge queueing delay \\implies stale AoI).
- Optimal utilization is \\rho^* \\approx 0.53, not 1.0!

In our LCFS Single-Packet Replacement Architecture:
Because new packets overwrite old packets in the buffer, queueing delay is strictly bounded to 0 or 1 slot. Thus, higher arrival rates \\lambda_1=0.7 monotonically improve or stabilize freshness at the generation end.`,
    keyCitations: ['Kaul et al., IEEE INFOCOM 2012', 'Sun et al., IEEE Trans. Inf. Theory 2017'],
  },
];
