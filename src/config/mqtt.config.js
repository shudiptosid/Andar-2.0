// MQTT Configuration
// Update these values according to your setup

export const MQTT_CONFIG = {
  // Public MQTT broker for testing (you can use your own broker)
  BROKER_URL: 'mqtt://broker.hivemq.com:1883',

  // For local ESP32/Raspberry Pi, use:
  // BROKER_URL: 'mqtt://192.168.1.100:1883', // Replace with your device IP

  // Connection options
  USERNAME: '', // Leave empty if no authentication
  PASSWORD: '', // Leave empty if no authentication

  // Topics
  TOPICS: {
    DISPLAY_TEXT: 'dotmatrix/display/text',
    BRIGHTNESS: 'dotmatrix/display/brightness',
    STATUS: 'dotmatrix/status',
  },

  // Connection settings
  OPTIONS: {
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 4000,
  },
};
