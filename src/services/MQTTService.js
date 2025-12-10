import mqtt from 'mqtt/dist/mqtt';

class MQTTService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.connectionListeners = [];
    this.messageListeners = [];
  }

  /**
   * Connect to MQTT broker
   * @param {string} brokerUrl - MQTT broker URL (e.g., 'mqtt://broker.hivemq.com:1883')
   * @param {object} options - Connection options
   */
  connect(brokerUrl, options = {}) {
    const defaultOptions = {
      clientId: `dotmatrix_${Math.random().toString(16).substr(2, 8)}`,
      clean: true,
      connectTimeout: 4000,
      reconnectPeriod: 1000,
      ...options,
    };

    try {
      this.client = mqtt.connect(brokerUrl, defaultOptions);

      this.client.on('connect', () => {
        console.log('MQTT Connected');
        this.isConnected = true;
        this.notifyConnectionListeners(true);
      });

      this.client.on('error', error => {
        console.error('MQTT Error:', error);
        this.isConnected = false;
        this.notifyConnectionListeners(false);
      });

      this.client.on('close', () => {
        console.log('MQTT Connection closed');
        this.isConnected = false;
        this.notifyConnectionListeners(false);
      });

      this.client.on('offline', () => {
        console.log('MQTT Offline');
        this.isConnected = false;
        this.notifyConnectionListeners(false);
      });

      this.client.on('message', (topic, message) => {
        const msg = message.toString();
        console.log('Received message:', topic, msg);
        this.notifyMessageListeners(topic, msg);
      });
    } catch (error) {
      console.error('Connection error:', error);
      this.isConnected = false;
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect() {
    if (this.client) {
      this.client.end();
      this.isConnected = false;
      this.notifyConnectionListeners(false);
    }
  }

  /**
   * Subscribe to a topic
   * @param {string} topic - Topic to subscribe to
   */
  subscribe(topic) {
    if (this.client && this.isConnected) {
      this.client.subscribe(topic, err => {
        if (err) {
          console.error('Subscribe error:', err);
        } else {
          console.log('Subscribed to:', topic);
        }
      });
    }
  }

  /**
   * Publish a message to a topic
   * @param {string} topic - Topic to publish to
   * @param {string} message - Message to publish
   */
  publish(topic, message) {
    if (this.client && this.isConnected) {
      this.client.publish(topic, message, { qos: 1 }, err => {
        if (err) {
          console.error('Publish error:', err);
        } else {
          console.log('Published to:', topic, message);
        }
      });
    } else {
      console.warn('Not connected, cannot publish');
    }
  }

  /**
   * Send display text to the device
   * @param {string} text - Text to display
   */
  sendDisplayText(text) {
    this.publish('dotmatrix/display/text', text);
  }

  /**
   * Send brightness value to the device
   * @param {number} brightness - Brightness value (0-100)
   */
  sendBrightness(brightness) {
    this.publish('dotmatrix/display/brightness', brightness.toString());
  }

  /**
   * Add connection status listener
   * @param {function} callback - Callback function (receives boolean)
   */
  addConnectionListener(callback) {
    this.connectionListeners.push(callback);
  }

  /**
   * Remove connection status listener
   * @param {function} callback - Callback function to remove
   */
  removeConnectionListener(callback) {
    this.connectionListeners = this.connectionListeners.filter(
      listener => listener !== callback,
    );
  }

  /**
   * Notify all connection listeners
   * @param {boolean} status - Connection status
   */
  notifyConnectionListeners(status) {
    this.connectionListeners.forEach(listener => listener(status));
  }

  /**
   * Add message listener
   * @param {function} callback - Callback function (receives topic, message)
   */
  addMessageListener(callback) {
    this.messageListeners.push(callback);
  }

  /**
   * Remove message listener
   * @param {function} callback - Callback function to remove
   */
  removeMessageListener(callback) {
    this.messageListeners = this.messageListeners.filter(
      listener => listener !== callback,
    );
  }

  /**
   * Notify all message listeners
   * @param {string} topic - Topic
   * @param {string} message - Message
   */
  notifyMessageListeners(topic, message) {
    this.messageListeners.forEach(listener => listener(topic, message));
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }
}

// Singleton instance
export default new MQTTService();
