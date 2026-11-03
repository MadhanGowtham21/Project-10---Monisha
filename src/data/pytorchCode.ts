/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PyTorch DRL Architecture & Training Implementation
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

export const PYTORCH_ENV_CODE = `"""
aoi_env.py
Gymnasium-compliant Discrete-Time Age-of-Information Wireless Sensor Scheduling Environment
Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
Affiliation: Department of ECE, Mailam Engineering College
"""

import gymnasium as gym
from gymnasium import spaces
import numpy as np

class AoIFadingSensorEnv(gym.Env):
    """
    Discrete-Time MDP for Age-of-Information Aware Sensor Scheduling
    under Gilbert-Elliott 2-State Markov Fading Channels.
    """
    metadata = {"render_modes": ["human"]}

    def __init__(
        self,
        num_nodes: int = 3,
        arrival_rates: list = [0.7, 0.5, 0.3],
        weights: list = [1.2, 1.0, 0.8],
        p_good_to_bad: float = 0.20,
        p_bad_to_good: float = 0.40,
        per_good: float = 0.05,
        per_bad: float = 0.65,
        e_tx: float = 15.0,        # mJ
        e_idle: float = 0.5,       # mJ
        initial_battery: float = 1000.0, # mJ
        beta: float = 0.15,
        zeta: float = 5.0,
        max_slots: int = 1000
    ):
        super(AoIFadingSensorEnv, self).__init__()
        self.num_nodes = num_nodes
        self.arrival_rates = np.array(arrival_rates, dtype=np.float32)
        self.weights = np.array(weights, dtype=np.float32)
        self.p_g2b = p_good_to_bad
        self.p_b2g = p_bad_to_good
        self.per_good = per_good
        self.per_bad = per_bad
        self.e_tx = e_tx
        self.e_idle = e_idle
        self.b0 = initial_battery
        self.beta = beta
        self.zeta = zeta
        self.max_slots = max_slots

        # Action Space: 0 = Sleep/Idle, 1..N = Schedule Sensor Node i
        self.action_space = spaces.Discrete(self.num_nodes + 1)

        # State Space: [norm_aoi(N), queue_status(N), channel_state(N), battery_ratio(N)] -> Dim 12
        # Bounds: [0, 1] for all normalized components
        self.observation_space = spaces.Box(
            low=0.0,
            high=1.0,
            shape=(self.num_nodes * 4,),
            dtype=np.float32
        )

        self.reset()

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        self.current_slot = 0
        self.aoi = np.ones(self.num_nodes, dtype=np.float32)
        self.lcfs_buffer_has_packet = np.zeros(self.num_nodes, dtype=np.int32)
        self.buffer_gen_time = np.full(self.num_nodes, -1, dtype=np.int32)
        # Steady state initialization for Gilbert-Elliott channel:
        # pi_bad = p_g2b / (p_g2b + p_b2g) = 0.20 / 0.60 = 0.333
        self.channel_state = (self.np_random.random(self.num_nodes) < (self.p_g2b / (self.p_g2b + self.p_b2g))).astype(np.int32)
        self.battery = np.full(self.num_nodes, self.b0, dtype=np.float32)
        self.peak_aoi_records = [[] for _ in range(self.num_nodes)]

        return self._get_obs(), {}

    def _get_obs(self):
        norm_aoi = np.clip(self.aoi / 50.0, 0.0, 1.0)
        queues = self.lcfs_buffer_has_packet.astype(np.float32)
        channels = self.channel_state.astype(np.float32)
        batteries = np.clip(self.battery / self.b0, 0.0, 1.0)
        return np.concatenate([norm_aoi, queues, channels, batteries]).astype(np.float32)

    def step(self, action: int):
        t = self.current_slot

        # 1. Packet Arrivals (LCFS buffer replacement)
        arrivals = self.np_random.random(self.num_nodes) < self.arrival_rates
        for i in range(self.num_nodes):
            if arrivals[i]:
                self.lcfs_buffer_has_packet[i] = 1
                self.buffer_gen_time[i] = t

        # 2. Wireless Channel Markov Transitions
        for i in range(self.num_nodes):
            if self.channel_state[i] == 0:  # Good
                if self.np_random.random() < self.p_g2b:
                    self.channel_state[i] = 1
            else:  # Bad
                if self.np_random.random() < self.p_b2g:
                    self.channel_state[i] = 0

        # 3. Action Execution and Energy Accounting
        tx_attempted = False
        tx_success = False
        instantaneous_energy = 0.0

        if action == 0:
            # Idle / Sleep: All nodes expend E_idle
            for i in range(self.num_nodes):
                spent = min(self.battery[i], self.e_idle)
                self.battery[i] -= spent
                instantaneous_energy += spent
        else:
            # Schedule Node i (1-indexed action)
            node_idx = action - 1

            # Energy consumption: scheduled node spends E_tx, others E_idle
            tx_spent = min(self.battery[node_idx], self.e_tx)
            self.battery[node_idx] -= tx_spent
            instantaneous_energy += tx_spent

            for i in range(self.num_nodes):
                if i != node_idx:
                    idle_spent = min(self.battery[i], self.e_idle)
                    self.battery[i] -= idle_spent
                    instantaneous_energy += idle_spent

            tx_attempted = True
            current_per = self.per_good if self.channel_state[node_idx] == 0 else self.per_bad
            packet_dropped = self.np_random.random() < current_per

            if not packet_dropped and self.lcfs_buffer_has_packet[node_idx] == 1:
                tx_success = True
                gen_time = self.buffer_gen_time[node_idx]
                self.peak_aoi_records[node_idx].append(self.aoi[node_idx])
                # AoI reset: Delta_i(t+1) = t + 1 - G_i(t)
                self.aoi[node_idx] = (t + 1) - gen_time
                self.lcfs_buffer_has_packet[node_idx] = 0
                self.buffer_gen_time[node_idx] = -1

        # 4. AoI evolution for unserved / failed nodes
        for i in range(self.num_nodes):
            if action != (i + 1) or not tx_success:
                self.aoi[i] += 1.0

        # 5. Multi-Objective Reward:
        # R(s_t, a_t) = - [ sum(w_i * Delta_i(t)) + beta * E_total(t) + zeta * 1_{Tx Failure} ]
        weighted_aoi = np.sum(self.weights * self.aoi)
        energy_cost = self.beta * instantaneous_energy
        failure_penalty = self.zeta if (tx_attempted and not tx_success) else 0.0
        reward = -(weighted_aoi + energy_cost + failure_penalty)

        self.current_slot += 1
        terminated = self.current_slot >= self.max_slots
        truncated = np.all(self.battery <= 0.0)

        info = {
            "tx_attempted": tx_attempted,
            "tx_success": tx_success,
            "instantaneous_energy": instantaneous_energy,
            "aoi": self.aoi.copy()
        }

        return self._get_obs(), reward, terminated, truncated, info
`;

export const PYTORCH_DQN_CODE = `"""
dqn_agent.py
Deep Q-Network (DQN) PyTorch Implementation for AoI Sensor Scheduling
Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
"""

import random
from collections import deque
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim

class QNetwork(nn.Module):
    """
    3-Layer Multi-Layer Perceptron (MLP) Approximator:
    Input (12) -> Linear(12, 64) -> ReLU -> Linear(64, 64) -> ReLU -> Linear(64, 4)
    """
    def __init__(self, state_dim: int = 12, action_dim: int = 4):
        super(QNetwork, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(state_dim, 64),
            nn.ReLU(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, action_dim)
        )

    def forward(self, state: torch.Tensor) -> torch.Tensor:
        return self.net(state)

class ReplayBuffer:
    """
    Uniform Experience Replay Memory with Capacity = 15,000 transitions
    """
    def __init__(self, capacity: int = 15000):
        self.buffer = deque(maxlen=capacity)

    def push(self, state, action, reward, next_state, done):
        self.buffer.append((state, action, reward, next_state, done))

    def sample(self, batch_size: int = 64):
        batch = random.sample(self.buffer, batch_size)
        states, actions, rewards, next_states, dones = zip(*batch)
        return (
            torch.tensor(np.array(states), dtype=torch.float32),
            torch.tensor(actions, dtype=torch.int64).unsqueeze(1),
            torch.tensor(rewards, dtype=torch.float32).unsqueeze(1),
            torch.tensor(np.array(next_states), dtype=torch.float32),
            torch.tensor(dones, dtype=torch.float32).unsqueeze(1)
        )

    def __len__(self):
        return len(self.buffer)

class DQNAgent:
    def __init__(
        self,
        state_dim: int = 12,
        action_dim: int = 4,
        lr: float = 0.002,
        gamma: float = 0.92,
        epsilon_start: float = 1.0,
        epsilon_min: float = 0.05,
        epsilon_decay: float = 0.985,
        target_update_freq: int = 40,
        buffer_capacity: int = 15000,
        batch_size: int = 64,
        device: str = "cuda" if torch.cuda.is_available() else "cpu"
    ):
        self.device = torch.device(device)
        self.action_dim = action_dim
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_min = epsilon_min
        self.epsilon_decay = epsilon_decay
        self.target_update_freq = target_update_freq
        self.batch_size = batch_size
        self.total_steps = 0

        self.q_net = QNetwork(state_dim, action_dim).to(self.device)
        self.target_net = QNetwork(state_dim, action_dim).to(self.device)
        self.target_net.load_state_dict(self.q_net.state_dict())
        self.target_net.eval()

        self.optimizer = optim.Adam(self.q_net.parameters(), lr=lr)
        self.criterion = nn.MSELoss()
        self.memory = ReplayBuffer(buffer_capacity)

    def select_action(self, state: np.ndarray, evaluate: bool = False) -> int:
        if not evaluate and random.random() < self.epsilon:
            return random.randrange(self.action_dim)

        state_tensor = torch.tensor(state, dtype=torch.float32).unsqueeze(0).to(self.device)
        with torch.no_grad():
            q_values = self.q_net(state_tensor)
        return int(torch.argmax(q_values).item())

    def update(self):
        if len(self.memory) < self.batch_size:
            return None

        states, actions, rewards, next_states, dones = self.memory.sample(self.batch_size)
        states = states.to(self.device)
        actions = actions.to(self.device)
        rewards = rewards.to(self.device)
        next_states = next_states.to(self.device)
        dones = dones.to(self.device)

        # Current Q-values: Q(s, a)
        q_current = self.q_net(states).gather(1, actions)

        # Target Q-values: r + gamma * max_a' Q_target(s', a') * (1 - done)
        with torch.no_grad():
            max_q_next = self.target_net(next_states).max(1)[0].unsqueeze(1)
            q_target = rewards + (1.0 - dones) * self.gamma * max_q_next

        loss = self.criterion(q_current, q_target)

        self.optimizer.zero_grad()
        loss.backward()
        nn.utils.clip_grad_norm_(self.q_net.parameters(), max_norm=1.0)
        self.optimizer.step()

        self.total_steps += 1
        if self.total_steps % self.target_update_freq == 0:
            self.target_net.load_state_dict(self.q_net.state_dict())

        return loss.item()

    def decay_epsilon(self):
        self.epsilon = max(self.epsilon_min, self.epsilon * self.epsilon_decay)
`;

export const PYTORCH_TRAIN_EVALUATE_CODE = `"""
train_evaluate.py
Training Pipeline, Baseline Benchmarking, and Publication Plot Generator
Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
"""

import numpy as np
import matplotlib.pyplot as plt
import torch
from aoi_env import AoIFadingSensorEnv
from dqn_agent import DQNAgent

def train_dqn(episodes: int = 400, slots_per_episode: int = 500):
    env = AoIFadingSensorEnv(max_slots=slots_per_episode)
    agent = DQNAgent()
    episode_rewards = []
    print("=" * 60)
    print("Initiating Deep Q-Network Training for AoI-Aware Scheduling")
    print("=" * 60)

    for ep in range(1, episodes + 1):
        state, _ = env.reset()
        total_ep_reward = 0.0

        for t in range(slots_per_episode):
            action = agent.select_action(state)
            next_state, reward, terminated, truncated, _ = env.step(action)
            done = terminated or truncated

            agent.memory.push(state, action, reward, next_state, float(done))
            agent.update()

            state = next_state
            total_ep_reward += reward

            if done:
                break

        agent.decay_epsilon()
        episode_rewards.append(total_ep_reward)

        if ep % 25 == 0:
            avg_rew = np.mean(episode_rewards[-25:])
            print(f"Episode {ep:03d}/{episodes} | Avg Reward (Last 25): {avg_rew:.2f} | Epsilon: {agent.epsilon:.4f}")

    # Save trained PyTorch model weights
    torch.save(agent.q_net.state_dict(), "aoi_dqn_weights.pt")
    print("Model weights successfully saved to 'aoi_dqn_weights.pt'.")
    return agent

def evaluate_baselines(agent: DQNAgent, eval_slots: int = 1000):
    baselines = ["DQN (Proposed)", "Greedy Max-AoI", "Round-Robin", "Random"]
    results = {}

    for name in baselines:
        env = AoIFadingSensorEnv(max_slots=eval_slots)
        state, _ = env.reset(seed=42)
        total_aoi_sum = 0.0
        successful_updates = 0
        failed_transmissions = 0
        total_energy = 0.0
        rr_pointer = 0

        for t in range(eval_slots):
            if name == "DQN (Proposed)":
                action = agent.select_action(state, evaluate=True)
            elif name == "Greedy Max-AoI":
                # Schedule sensor with highest weighted AoI having a packet
                node_idx = -1
                max_w_aoi = -1
                for i in range(env.num_nodes):
                    if env.lcfs_buffer_has_packet[i] and env.battery[i] >= env.e_tx:
                        w_aoi = env.weights[i] * env.aoi[i]
                        if w_aoi > max_w_aoi:
                            max_w_aoi = w_aoi
                            node_idx = i
                action = (node_idx + 1) if node_idx >= 0 else 0
            elif name == "Round-Robin":
                action = (rr_pointer % env.num_nodes) + 1
                rr_pointer += 1
            else:  # Random
                action = np.random.randint(0, env.num_nodes + 1)

            next_state, reward, terminated, truncated, info = env.step(action)
            total_aoi_sum += np.mean(info["aoi"])
            total_energy += info["instantaneous_energy"]

            if info["tx_attempted"]:
                if info["tx_success"]:
                    successful_updates += 1
                else:
                    failed_transmissions += 1

            state = next_state
            if terminated or truncated:
                break

        total_tx = successful_updates + failed_transmissions
        pdr = (successful_updates / total_tx * 100.0) if total_tx > 0 else 0.0
        energy_per_update = (total_energy / successful_updates) if successful_updates > 0 else 0.0

        results[name] = {
            "Avg AoI (slots)": total_aoi_sum / eval_slots,
            "PDR (%)": pdr,
            "Total Energy (mJ)": total_energy,
            "Energy / Update (mJ)": energy_per_update
        }

    print("\\n" + "=" * 68)
    print("COMPARATIVE RESEARCH PERFORMANCE SUMMARY (1000 EVALUATION SLOTS)")
    print("=" * 68)
    print(f"{'Method':<20} | {'Avg AoI':<10} | {'PDR (%)':<10} | {'Total Energy':<14} | {'mJ/Update':<10}")
    print("-" * 68)
    for k, v in results.items():
        print(f"{k:<20} | {v['Avg AoI']:<10.2f} | {v['PDR (%)']:<10.2f} | {v['Total Energy']:<14.2f} | {v['Energy / Update']:<10.2f}")
    print("=" * 68)

if __name__ == "__main__":
    trained_agent = train_dqn(episodes=200, slots_per_episode=500)
    evaluate_baselines(trained_agent, eval_slots=1000)
`;

export const PYTORCH_REQUIREMENTS = `# Requirements for AoI-DRL Wireless Sensor Scheduling
torch>=2.2.0
gymnasium>=0.29.1
numpy>=1.24.0
matplotlib>=3.8.0
`;
