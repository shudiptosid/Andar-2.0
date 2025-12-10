# Device Setup Guide

This folder contains example code for ESP32-S3 and Raspberry Pi microcontrollers to receive MQTT commands from the React Native app and control a dot matrix display.

## Hardware Options

### Option 1: ESP32-S3 (or ESP32)

- **Advantages**: Low power, built-in WiFi, easy programming
- **Use**: `ESP32_MQTT_Example.ino`
- **IDE**: Arduino IDE or PlatformIO

### Option 2: Raspberry Pi 2/3

- **Advantages**: More processing power, Linux-based, Python support
- **Use**: `raspberry_pi_mqtt.py`
- **OS**: Raspberry Pi OS (formerly Raspbian)

## Dot Matrix Display

Both examples support MAX7219-based dot matrix displays:

- Single 8x8 module
- Cascaded modules (4x8x8, 8x8x8, etc.)
- Common on Amazon/AliExpress as "MAX7219 Dot Matrix Module"

## Setup Instructions

### ESP32-S3 Setup

1. **Install Arduino IDE**

   - Download from: https://www.arduino.cc/en/software

2. **Install ESP32 Board Support**

   - File -> Preferences
   - Add to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Tools -> Board -> Boards Manager -> Search "ESP32" -> Install

3. **Install Required Libraries**

   - Sketch -> Include Library -> Manage Libraries
   - Install:
     - `PubSubClient` by Nick O'Leary
     - `MD_Parola` by majicDesigns
     - `MD_MAX72XX` by majicDesigns

4. **Configure and Upload**

   - Open `ESP32_MQTT_Example.ino`
   - Update WiFi credentials:
     ```cpp
     const char* ssid = "YOUR_WIFI_SSID";
     const char* password = "YOUR_WIFI_PASSWORD";
     ```
   - Update MQTT broker (if using local):
     ```cpp
     const char* mqtt_server = "192.168.1.XXX";
     ```
   - Select board: Tools -> Board -> ESP32 Arduino -> ESP32S3 Dev Module
   - Select port: Tools -> Port -> COMx (Windows) or /dev/ttyUSBx (Linux)
   - Click Upload

5. **Wiring**
   ```
   ESP32-S3    MAX7219
   --------    -------
   5V      ->  VCC
   GND     ->  GND
   GPIO 23 ->  DIN
   GPIO 18 ->  CLK
   GPIO 5  ->  CS
   ```

### Raspberry Pi Setup

1. **Enable SPI**

   ```bash
   sudo raspi-config
   ```

   - Interface Options -> SPI -> Enable
   - Reboot

2. **Install Python Dependencies**

   ```bash
   sudo apt update
   sudo apt install python3-pip
   pip3 install paho-mqtt luma.led_matrix
   ```

3. **Configure and Run**

   - Edit `raspberry_pi_mqtt.py`
   - Update MQTT broker (if using local):
     ```python
     MQTT_BROKER = "192.168.1.XXX"
     ```
   - Run:
     ```bash
     python3 raspberry_pi_mqtt.py
     ```

4. **Wiring**

   ```
   Raspberry Pi    MAX7219
   ------------    -------
   5V (Pin 2)  ->  VCC
   GND (Pin 6) ->  GND
   GPIO 10     ->  DIN (MOSI)
   GPIO 11     ->  CLK (SCLK)
   GPIO 8      ->  CS (CE0)
   ```

5. **Run on Boot (Optional)**
   ```bash
   sudo nano /etc/rc.local
   ```
   Add before `exit 0`:
   ```bash
   python3 /home/pi/raspberry_pi_mqtt.py &
   ```

## MQTT Broker Options

### Public Broker (Testing Only)

- `broker.hivemq.com:1883`
- No authentication required
- **Not secure** - for testing only!

### Local Broker (Recommended)

#### Install Mosquitto on Raspberry Pi

```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

#### Install Mosquitto on Windows

- Download: https://mosquitto.org/download/
- Install and run as service

#### Install Mosquitto on Linux

```bash
sudo apt install mosquitto mosquitto-clients
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

## Testing MQTT Connection

### Subscribe to topics

```bash
mosquitto_sub -h broker.hivemq.com -t "dotmatrix/#" -v
```

### Publish test message

```bash
mosquitto_pub -h broker.hivemq.com -t "dotmatrix/display/text" -m "Hello World"
mosquitto_pub -h broker.hivemq.com -t "dotmatrix/display/brightness" -m "75"
```

## Troubleshooting

### ESP32 won't connect to WiFi

- Double-check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)
- Check WiFi signal strength

### Can't connect to MQTT broker

- Verify broker IP address
- Check firewall settings
- Test with mosquitto_sub/pub commands
- Ensure broker is running

### Display shows nothing

- Check wiring connections
- Verify power supply (5V, sufficient current)
- Test with simple Arduino/Python examples first
- Adjust brightness setting

### Display shows garbled text

- Check SPI connections
- Verify correct HARDWARE_TYPE in code
- Try different block_orientation settings

## Next Steps

1. Set up your hardware (ESP32 or Raspberry Pi + display)
2. Configure WiFi and MQTT settings
3. Upload/run the code
4. Use the React Native app to control the display
5. Customize the code for your specific needs

## Support

For additional help:

- ESP32: https://docs.espressif.com/
- Raspberry Pi: https://www.raspberrypi.org/documentation/
- MQTT: https://mqtt.org/
- MAX7219 Library: https://github.com/MajicDesigns/MD_MAX72XX
