# Hardware Schematic Notes (Drawing Room)

This document provides the conceptual pin mapping and wiring logic for simulating the Drawing Room devices (2 fans, 3 lights) on an ESP32.

## Pin Mapping Table

| Device | ESP32 Pin | Component |
|---|---|---|
| Fan 1 | GPIO 18 | Relay Module IN1 |
| Fan 2 | GPIO 19 | Relay Module IN2 |
| Light 1 | GPIO 21 | Relay Module IN3 (or N-Channel MOSFET Gate) |
| Light 2 | GPIO 22 | Relay Module IN4 (or N-Channel MOSFET Gate) |
| Light 3 | GPIO 23 | Relay Module IN5 (or N-Channel MOSFET Gate) |
| Hardware Switch | GPIO 32 | Push button (INPUT_PULLUP) |

## Connection Logic & Reasoning

- **Fans (High Current/Voltage)**: Fans typically require significant AC or DC current, meaning the ESP32 (which outputs 3.3V at ~40mA max per pin) cannot drive them directly without risking destruction of the microcontroller. We use a 5V relay module. The ESP32 GPIO pin connects to the relay module's signal (IN) pin. The relay coil uses an internal flyback diode to prevent reverse voltage spikes from damaging the ESP32 when the coil de-energizes.
- **Lights (LEDs)**: If these are high-power LED strips (e.g., 12V), they also need relays or logic-level N-channel MOSFETs. A MOSFET provides faster switching and PWM dimming capabilities compared to a mechanical relay.
- **Reporting State**: The ESP32 maintains an internal state machine. When a state changes (either triggered internally by a simulator loop or externally via a physical button press on GPIO 32), the ESP32 sends an HTTP POST request to the Node.js backend to update the database. This event-driven approach is preferred over having the backend continuously poll the ESP32, as it provides instantaneous updates to the real-time dashboard and reduces unnecessary network traffic.
