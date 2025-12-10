#!/usr/bin/env python3
"""
Raspberry Pi 2/3 Dot Matrix Display Controller

This script subscribes to MQTT topics and controls a dot matrix display
Compatible with Raspberry Pi 2, 3, 3B+, and similar boards

Required Libraries:
- paho-mqtt (pip install paho-mqtt)
- luma.led_matrix (pip install luma.led_matrix)

Hardware:
- MAX7219 Dot Matrix Display (8x8 or cascaded)
- Connected via SPI
"""

import paho.mqtt.client as mqtt
from luma.core.interface.serial import spi, noop
from luma.core.render import canvas
from luma.led_matrix.device import max7219
from luma.core.legacy import text, show_message
from luma.core.legacy.font import proportional, CP437_FONT, TINY_FONT, LCD_FONT
import time
import threading

# MQTT Configuration
MQTT_BROKER = "broker.hivemq.com"  # Or your local broker IP
MQTT_PORT = 1883
MQTT_CLIENT_ID = "RaspberryPi_DotMatrix"

# MQTT Topics
TOPIC_TEXT = "dotmatrix/display/text"
TOPIC_BRIGHTNESS = "dotmatrix/display/brightness"
TOPIC_STATUS = "dotmatrix/status"

# Display Configuration
# For cascaded displays: e.g., cascaded=4 for four 8x8 modules
serial = spi(port=0, device=0, gpio=noop())
device = max7219(serial, cascaded=4, block_orientation=0, rotate=0)

# Global variables
current_text = "Ready"
brightness_level = 5  # 0-15
display_lock = threading.Lock()


def on_connect(client, userdata, flags, rc):
    """Callback when connected to MQTT broker"""
    if rc == 0:
        print("Connected to MQTT broker")
        
        # Subscribe to topics
        client.subscribe(TOPIC_TEXT)
        client.subscribe(TOPIC_BRIGHTNESS)
        
        # Publish status
        client.publish(TOPIC_STATUS, "online", retain=True)
        
        print(f"Subscribed to topics:")
        print(f"  - {TOPIC_TEXT}")
        print(f"  - {TOPIC_BRIGHTNESS}")
    else:
        print(f"Failed to connect, return code {rc}")


def on_message(client, userdata, msg):
    """Callback when a message is received"""
    global current_text, brightness_level
    
    topic = msg.topic
    message = msg.payload.decode('utf-8')
    
    print(f"Received message: [{topic}] {message}")
    
    if topic == TOPIC_TEXT:
        with display_lock:
            current_text = message
            print(f"Display text updated: {current_text}")
    
    elif topic == TOPIC_BRIGHTNESS:
        try:
            # Convert 0-100 to 0-15 (luma brightness range)
            new_brightness = int(message)
            brightness_level = int((new_brightness / 100) * 15)
            brightness_level = max(0, min(15, brightness_level))  # Clamp 0-15
            
            with display_lock:
                device.contrast(brightness_level * 17)  # Convert to 0-255
            
            print(f"Brightness set to: {brightness_level}/15 ({new_brightness}%)")
        except ValueError:
            print(f"Invalid brightness value: {message}")


def display_scroll_thread():
    """Thread to continuously scroll the display text"""
    global current_text
    
    while True:
        with display_lock:
            text_to_display = current_text
        
        # Scroll the text
        show_message(
            device,
            text_to_display,
            fill="white",
            font=proportional(CP437_FONT),
            scroll_delay=0.05
        )
        
        time.sleep(0.1)


def heartbeat_thread(client):
    """Thread to send periodic heartbeat"""
    while True:
        time.sleep(30)
        client.publish(TOPIC_STATUS, "online")


def main():
    """Main function"""
    global brightness_level
    
    print("Raspberry Pi Dot Matrix Controller")
    print("===================================")
    
    # Set initial brightness
    device.contrast(brightness_level * 17)
    
    # Create MQTT client
    client = mqtt.Client(MQTT_CLIENT_ID)
    client.on_connect = on_connect
    client.on_message = on_message
    
    # Set last will and testament
    client.will_set(TOPIC_STATUS, "offline", retain=True)
    
    try:
        # Connect to broker
        print(f"Connecting to MQTT broker: {MQTT_BROKER}:{MQTT_PORT}")
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        
        # Start display thread
        display_thread = threading.Thread(target=display_scroll_thread, daemon=True)
        display_thread.start()
        
        # Start heartbeat thread
        heartbeat = threading.Thread(target=heartbeat_thread, args=(client,), daemon=True)
        heartbeat.start()
        
        # Start MQTT loop
        print("Starting MQTT loop...")
        client.loop_forever()
        
    except KeyboardInterrupt:
        print("\nShutting down...")
        client.publish(TOPIC_STATUS, "offline")
        client.disconnect()
        device.cleanup()
        print("Goodbye!")
    
    except Exception as e:
        print(f"Error: {e}")
        client.publish(TOPIC_STATUS, "offline")
        client.disconnect()
        device.cleanup()


if __name__ == "__main__":
    main()


"""
Wiring Guide for MAX7219 Dot Matrix with Raspberry Pi:

Raspberry Pi    MAX7219 Module
-------------------------------
5V          ->  VCC
GND         ->  GND
GPIO 10     ->  DIN (MOSI)
GPIO 11     ->  CLK (SCLK)
GPIO 8      ->  CS (CE0)

Installation Instructions:
1. Enable SPI on Raspberry Pi:
   sudo raspi-config
   -> Interface Options -> SPI -> Enable

2. Install required libraries:
   pip3 install paho-mqtt luma.led_matrix

3. Run the script:
   python3 raspberry_pi_mqtt.py

4. Run on boot (optional):
   sudo nano /etc/rc.local
   Add before 'exit 0':
   python3 /home/pi/raspberry_pi_mqtt.py &

For multiple cascaded displays, change the cascaded parameter:
device = max7219(serial, cascaded=4, block_orientation=0, rotate=0)
"""
