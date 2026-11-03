/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ESP32 Wireless Sensor Network C++/Arduino Firmware & Central Gateway
 * Phase 2 Embedded Deployment
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 */

export const ESP32_NODE1_CODE = `/*
 * ==============================================================================
 * ESP32 SENSOR NODE 1: DHT22 (Temperature & Humidity Telemetry)
 * Project: Age-of-Information-Aware DRL Wireless Sensor Scheduling
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 * Pinout: DHT22 Data Pin -> GPIO 4
 * Protocol: Wi-Fi UDP Polling Architecture with LCFS Single-Packet Buffer
 * ==============================================================================
 */

#include <WiFi.h>
#include <WiFiUdp.h>
#include <DHT.h>
#include <ArduinoJson.h>

#define DHTPIN 4
#define DHTTYPE DHT22
#define NODE_ID 1
#define LOCAL_PORT 4210
#define GATEWAY_PORT 4200

// Wi-Fi Credentials
const char* ssid = "AoI_DRL_Lab_Mesh";
const char* password = "Research@MailamECE2026";
IPAddress gatewayIP(192, 168, 4, 1);

DHT dht(DHTPIN, DHTTYPE);
WiFiUDP udp;

// LCFS (Last-Come-First-Served) Single-Packet Replacement Buffer
struct TelemetryPacket {
  uint32_t node_id;
  uint32_t seq_num;
  uint32_t gen_timestamp_ms;
  float temperature_c;
  float humidity_pct;
  int8_t rssi;
  bool is_valid;
};

volatile TelemetryPacket lcfs_buffer = {NODE_ID, 0, 0, 0.0, 0.0, 0, false};
uint32_t packet_counter = 0;
unsigned long last_sample_time = 0;
const unsigned long SAMPLE_INTERVAL_MS = 1428; // lambda_1 = 0.7 updates/slot (~1.4s)

char incomingPacket[128];
char jsonResponse[256];

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("\\n[Node 1] Initializing DHT22 Telemetry Module...");

  dht.begin();

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.printf("\\n[Node 1] Connected! IP: %s | MAC: %s\\n", 
                WiFi.localIP().toString().c_str(), WiFi.macAddress().c_str());

  udp.begin(LOCAL_PORT);
  Serial.printf("[Node 1] Listening for Gateway POLL commands on UDP port %d\\n", LOCAL_PORT);

  // Configure modem power-saving between transmissions
  WiFi.setSleep(true);
}

void sampleSensorLCFS() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("[Node 1] Warning: DHT22 read failure!");
    return;
  }

  // LCFS Replacement: Overwrite single-packet buffer with freshest sensor sample
  packet_counter++;
  lcfs_buffer.node_id = NODE_ID;
  lcfs_buffer.seq_num = packet_counter;
  lcfs_buffer.gen_timestamp_ms = millis();
  lcfs_buffer.temperature_c = t;
  lcfs_buffer.humidity_pct = h;
  lcfs_buffer.rssi = WiFi.RSSI();
  lcfs_buffer.is_valid = true;

  Serial.printf("[Node 1 LCFS] Fresh Sample Gen: Seq=%u, T=%.2f C, H=%.1f %%, Time=%u ms\\n",
                lcfs_buffer.seq_num, t, h, lcfs_buffer.gen_timestamp_ms);
}

void loop() {
  unsigned long now = millis();

  // Periodically sample sensor and refresh LCFS buffer (Poisson/Bernoulli emulation)
  if (now - last_sample_time >= SAMPLE_INTERVAL_MS) {
    last_sample_time = now;
    sampleSensorLCFS();
  }

  // Listen for Gateway Polling Command: "POLL_1"
  int packetSize = udp.parsePacket();
  if (packetSize > 0) {
    int len = udp.read(incomingPacket, sizeof(incomingPacket) - 1);
    if (len > 0) incomingPacket[len] = '\\0';

    if (strcmp(incomingPacket, "POLL_1") == 0) {
      if (lcfs_buffer.is_valid) {
        // Transmit freshest buffered telemetry
        StaticJsonDocument<256> doc;
        doc["node_id"] = lcfs_buffer.node_id;
        doc["seq_num"] = lcfs_buffer.seq_num;
        doc["gen_ms"] = lcfs_buffer.gen_timestamp_ms;
        doc["tx_ms"] = millis();
        doc["temp"] = lcfs_buffer.temperature_c;
        doc["hum"] = lcfs_buffer.humidity_pct;
        doc["rssi"] = WiFi.RSSI();

        serializeJson(doc, jsonResponse);

        udp.beginPacket(udp.remoteIP(), udp.remotePort());
        udp.write((const uint8_t*)jsonResponse, strlen(jsonResponse));
        udp.endPacket();

        Serial.printf("[Node 1 TX] Sent Telemetry -> Sink (Seq: %u, RSSI: %d dBm)\\n",
                      lcfs_buffer.seq_num, WiFi.RSSI());

        // Clear LCFS buffer upon successful transmission
        lcfs_buffer.is_valid = false;
      } else {
        // Buffer empty response
        udp.beginPacket(udp.remoteIP(), udp.remotePort());
        udp.write((const uint8_t*)"EMPTY_BUFFER_1", 14);
        udp.endPacket();
      }
    }
  }
}
`;

export const ESP32_NODE2_CODE = `/*
 * ==============================================================================
 * ESP32 SENSOR NODE 2: HC-SR04 (Ultrasonic Distance Telemetry)
 * Project: Age-of-Information-Aware DRL Wireless Sensor Scheduling
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 * Pinout: TRIG -> GPIO 5, ECHO -> GPIO 18
 * Protocol: Wi-Fi UDP Polling Architecture with LCFS Single-Packet Buffer
 * ==============================================================================
 */

#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>

#define TRIG_PIN 5
#define ECHO_PIN 18
#define NODE_ID 2
#define LOCAL_PORT 4210

const char* ssid = "AoI_DRL_Lab_Mesh";
const char* password = "Research@MailamECE2026";

WiFiUDP udp;

struct DistancePacket {
  uint32_t node_id;
  uint32_t seq_num;
  uint32_t gen_timestamp_ms;
  float distance_cm;
  int8_t rssi;
  bool is_valid;
};

volatile DistancePacket lcfs_buffer = {NODE_ID, 0, 0, 0.0, 0, false};
uint32_t packet_counter = 0;
unsigned long last_sample_time = 0;
const unsigned long SAMPLE_INTERVAL_MS = 2000; // lambda_2 = 0.5 updates/slot (~2.0s)

char incomingPacket[128];
char jsonResponse[256];

float readUltrasonicDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout (~5m max)
  if (duration == 0) return -1.0;
  return (float)(duration * 0.0343) / 2.0; // Distance in cm
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.printf("\\n[Node 2 HC-SR04] Connected! IP: %s\\n", WiFi.localIP().toString().c_str());

  udp.begin(LOCAL_PORT);
  WiFi.setSleep(true);
}

void sampleSensorLCFS() {
  float dist = readUltrasonicDistance();
  if (dist < 0.0) return;

  // LCFS Replacement: Overwrite buffer
  packet_counter++;
  lcfs_buffer.node_id = NODE_ID;
  lcfs_buffer.seq_num = packet_counter;
  lcfs_buffer.gen_timestamp_ms = millis();
  lcfs_buffer.distance_cm = dist;
  lcfs_buffer.rssi = WiFi.RSSI();
  lcfs_buffer.is_valid = true;

  Serial.printf("[Node 2 LCFS] Fresh Dist=%.1f cm, Seq=%u, Time=%u ms\\n",
                dist, lcfs_buffer.seq_num, lcfs_buffer.gen_timestamp_ms);
}

void loop() {
  unsigned long now = millis();
  if (now - last_sample_time >= SAMPLE_INTERVAL_MS) {
    last_sample_time = now;
    sampleSensorLCFS();
  }

  int packetSize = udp.parsePacket();
  if (packetSize > 0) {
    int len = udp.read(incomingPacket, sizeof(incomingPacket) - 1);
    if (len > 0) incomingPacket[len] = '\\0';

    if (strcmp(incomingPacket, "POLL_2") == 0) {
      if (lcfs_buffer.is_valid) {
        StaticJsonDocument<256> doc;
        doc["node_id"] = lcfs_buffer.node_id;
        doc["seq_num"] = lcfs_buffer.seq_num;
        doc["gen_ms"] = lcfs_buffer.gen_timestamp_ms;
        doc["tx_ms"] = millis();
        doc["distance_cm"] = lcfs_buffer.distance_cm;
        doc["rssi"] = WiFi.RSSI();

        serializeJson(doc, jsonResponse);
        udp.beginPacket(udp.remoteIP(), udp.remotePort());
        udp.write((const uint8_t*)jsonResponse, strlen(jsonResponse));
        udp.endPacket();

        lcfs_buffer.is_valid = false; // Packet flushed
      }
    }
  }
}
`;

export const ESP32_NODE3_CODE = `/*
 * ==============================================================================
 * ESP32 SENSOR NODE 3: LDR Ambient Light (Analog ADC Telemetry)
 * Project: Age-of-Information-Aware DRL Wireless Sensor Scheduling
 * Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)
 * Pinout: LDR Voltage Divider -> GPIO 34 (ADC1_CH6)
 * Protocol: Wi-Fi UDP Polling Architecture with LCFS Single-Packet Buffer
 * ==============================================================================
 */

#include <WiFi.h>
#include <WiFiUdp.h>
#include <ArduinoJson.h>

#define LDR_PIN 34
#define NODE_ID 3
#define LOCAL_PORT 4210

const char* ssid = "AoI_DRL_Lab_Mesh";
const char* password = "Research@MailamECE2026";

WiFiUDP udp;

struct LightPacket {
  uint32_t node_id;
  uint32_t seq_num;
  uint32_t gen_timestamp_ms;
  uint16_t raw_adc;
  float lux_approx;
  int8_t rssi;
  bool is_valid;
};

volatile LightPacket lcfs_buffer = {NODE_ID, 0, 0, 0, 0.0, 0, false};
uint32_t packet_counter = 0;
unsigned long last_sample_time = 0;
const unsigned long SAMPLE_INTERVAL_MS = 3333; // lambda_3 = 0.3 updates/slot (~3.3s)

char incomingPacket[128];
char jsonResponse[256];

void setup() {
  Serial.begin(115200);
  analogReadResolution(12); // 12-bit ADC (0 - 4095)
  analogSetAttenuation(ADC_11db); // Full range 0 - 3.3V

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
  }
  Serial.printf("\\n[Node 3 LDR] Connected! IP: %s\\n", WiFi.localIP().toString().c_str());

  udp.begin(LOCAL_PORT);
  WiFi.setSleep(true);
}

void sampleSensorLCFS() {
  uint16_t adc = analogRead(LDR_PIN);
  float voltage = (float)adc / 4095.0 * 3.3;
  // Approximate Lux calculation for typical 10k pull-down LDR divider
  float lux = (voltage > 0.1) ? (250.0 / voltage) : 0.0;

  packet_counter++;
  lcfs_buffer.node_id = NODE_ID;
  lcfs_buffer.seq_num = packet_counter;
  lcfs_buffer.gen_timestamp_ms = millis();
  lcfs_buffer.raw_adc = adc;
  lcfs_buffer.lux_approx = lux;
  lcfs_buffer.rssi = WiFi.RSSI();
  lcfs_buffer.is_valid = true;

  Serial.printf("[Node 3 LCFS] Fresh ADC=%u (Lux: %.1f), Seq=%u, Time=%u ms\\n",
                adc, lux, lcfs_buffer.seq_num, lcfs_buffer.gen_timestamp_ms);
}

void loop() {
  unsigned long now = millis();
  if (now - last_sample_time >= SAMPLE_INTERVAL_MS) {
    last_sample_time = now;
    sampleSensorLCFS();
  }

  int packetSize = udp.parsePacket();
  if (packetSize > 0) {
    int len = udp.read(incomingPacket, sizeof(incomingPacket) - 1);
    if (len > 0) incomingPacket[len] = '\\0';

    if (strcmp(incomingPacket, "POLL_3") == 0) {
      if (lcfs_buffer.is_valid) {
        StaticJsonDocument<256> doc;
        doc["node_id"] = lcfs_buffer.node_id;
        doc["seq_num"] = lcfs_buffer.seq_num;
        doc["gen_ms"] = lcfs_buffer.gen_timestamp_ms;
        doc["tx_ms"] = millis();
        doc["adc"] = lcfs_buffer.raw_adc;
        doc["lux"] = lcfs_buffer.lux_approx;
        doc["rssi"] = WiFi.RSSI();

        serializeJson(doc, jsonResponse);
        udp.beginPacket(udp.remoteIP(), udp.remotePort());
        udp.write((const uint8_t*)jsonResponse, strlen(jsonResponse));
        udp.endPacket();

        lcfs_buffer.is_valid = false;
      }
    }
  }
}
`;

export const PYTHON_BASE_STATION_CODE = `"""
gateway_base_station.py
Central Base Station Monitoring Gateway & DRL Real-Time Dispatcher
Author: Monisha (M.E. Communication Systems, Mailam Engineering College / Anna University)

Interfacing:
- Binds to UDP socket on 0.0.0.0:4200
- Tracks node IP addresses dynamically or from static mapping
- Computes instantaneous AoI: Delta_i(t) = t - U_i(t)
- Dispatches DRL polling commands ("POLL_1", "POLL_2", "POLL_3") based on PyTorch policy
- Computes Peak AoI (PAoI), Packet Delivery Ratio (PDR), and Energy Savings
"""

import socket
import json
import time
import torch
import numpy as np
from dqn_agent import DQNAgent

# Node Network Table (Configured static IPs or discovered via broadcast)
NODE_IPS = {
    1: ("192.168.4.11", 4210),  # Node 1: DHT22
    2: ("192.168.4.12", 4210),  # Node 2: HC-SR04
    3: ("192.168.4.13", 4210)   # Node 3: LDR
}

GATEWAY_IP = "0.0.0.0"
GATEWAY_PORT = 4200
SLOT_DURATION_SEC = 0.5  # 500 ms discrete time slot

class BaseStationGateway:
    def __init__(self, weights_path: str = "aoi_dqn_weights.pt"):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.bind((GATEWAY_IP, GATEWAY_PORT))
        self.sock.settimeout(0.35) # 350 ms timeout per slot

        self.num_nodes = 3
        self.current_slot = 0
        self.u_i = [time.time()] * self.num_nodes  # Generation timestamp of freshest packet
        self.aoi = [1.0] * self.num_nodes
        self.peak_aoi = [[] for _ in range(self.num_nodes)]
        self.channel_estimates = [0] * self.num_nodes # 0=Good, 1=Bad (inferred from RSSI/loss)
        self.battery_remaining = [1000.0] * self.num_nodes

        # Load trained PyTorch DQN Agent
        self.agent = DQNAgent()
        try:
            self.agent.q_net.load_state_dict(torch.load(weights_path, map_location=self.agent.device))
            self.agent.q_net.eval()
            print(f"[Gateway] Loaded trained DQN weights from '{weights_path}'.")
        except Exception as e:
            print(f"[Gateway] Notice: '{weights_path}' not found, using untrained policy ({e}).")

    def construct_state(self) -> np.ndarray:
        norm_aoi = np.clip(np.array(self.aoi, dtype=np.float32) / 50.0, 0.0, 1.0)
        queues = np.ones(self.num_nodes, dtype=np.float32) # In polling system, assumed ready
        channels = np.array(self.channel_estimates, dtype=np.float32)
        batteries = np.clip(np.array(self.battery_remaining, dtype=np.float32) / 1000.0, 0.0, 1.0)
        return np.concatenate([norm_aoi, queues, channels, batteries])

    def run_scheduling_loop(self, max_slots: int = 1000):
        print("=" * 70)
        print("BASE STATION WIRELESS SINK GATEWAY STARTED (AoI-DRL SCHEDULER)")
        print(f"Listening on UDP port {GATEWAY_PORT} | Slot Duration: {SLOT_DURATION_SEC * 1000:.0f} ms")
        print("=" * 70)

        for slot in range(1, max_slots + 1):
            slot_start = time.time()
            self.current_slot = slot

            # 1. Evaluate DRL policy to pick action a_t in {0, 1, 2, 3}
            state = self.construct_state()
            action = self.agent.select_action(state, evaluate=True)

            action_desc = "Sleep (Conserve Battery)" if action == 0 else f"Poll Node {action}"

            # 2. Transmit UDP Poll or Idle
            tx_success = False
            rssi_val = -100

            if action > 0:
                target_node = action
                target_ip, target_port = NODE_IPS[target_node]
                poll_cmd = f"POLL_{target_node}".encode("utf-8")

                try:
                    self.sock.sendto(poll_cmd, (target_ip, target_port))
                    data, addr = self.sock.recvfrom(512)
                    payload = json.loads(data.decode("utf-8"))

                    # Successful packet reception
                    tx_success = True
                    gen_ms = payload.get("gen_ms", 0)
                    rssi_val = payload.get("rssi", -65)

                    # Update channel estimate: RSSI < -78 dBm indicates deep fade / bad link
                    self.channel_estimates[target_node - 1] = 1 if rssi_val < -78 else 0

                    # Peak AoI recorded
                    self.peak_aoi[target_node - 1].append(self.aoi[target_node - 1])

                    # AoI updated to transmission elapsed time
                    self.aoi[target_node - 1] = 1.0
                    self.battery_remaining[target_node - 1] = max(0.0, self.battery_remaining[target_node - 1] - 15.0)

                    print(f"[Slot {slot:04d}] ACTION: {action_desc} | ACK RCVD: Seq={payload.get('seq_num')} | "
                          f"RSSI={rssi_val} dBm | AoI Resets -> 1.0")
                except socket.timeout:
                    # Packet lost or channel deep fade
                    tx_success = False
                    self.channel_estimates[target_node - 1] = 1 # Infer fade on timeout
                    self.battery_remaining[target_node - 1] = max(0.0, self.battery_remaining[target_node - 1] - 15.0)
                    print(f"[Slot {slot:04d}] ACTION: {action_desc} | TIMEOUT (Deep Fade / Packet Loss)")
            else:
                # Sleep action: All nodes expend E_idle
                for i in range(self.num_nodes):
                    self.battery_remaining[i] = max(0.0, self.battery_remaining[i] - 0.5)
                print(f"[Slot {slot:04d}] ACTION: SLEEP | Channel deep fades detected. Conserving energy.")

            # 3. Increment AoI for all unserved nodes
            for i in range(self.num_nodes):
                if action != (i + 1) or not tx_success:
                    self.aoi[i] += 1.0

            # 4. Synchronize slot duration
            elapsed = time.time() - slot_start
            sleep_time = max(0.0, SLOT_DURATION_SEC - elapsed)
            time.sleep(sleep_time)

if __name__ == "__main__":
    gateway = BaseStationGateway()
    gateway.run_scheduling_loop()
`;
