/**
 * Dot Matrix Controller App
 * Control ESP32/Raspberry Pi dot matrix display via MQTT
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MQTTService from './src/services/MQTTService';
import { MQTT_CONFIG } from './src/config/mqtt.config';

function App(): React.JSX.Element {
  const [displayText, setDisplayText] = useState('');
  const [brightness, setBrightness] = useState(50);
  const [isConnected, setIsConnected] = useState(false);
  const [brokerUrl, setBrokerUrl] = useState(MQTT_CONFIG.BROKER_URL);

  useEffect(() => {
    // Add connection listener
    const handleConnectionChange = (status: boolean) => {
      setIsConnected(status);
      if (status) {
        // Subscribe to status topic when connected
        MQTTService.subscribe(MQTT_CONFIG.TOPICS.STATUS);
      }
    };

    MQTTService.addConnectionListener(handleConnectionChange);

    // Cleanup on unmount
    return () => {
      MQTTService.removeConnectionListener(handleConnectionChange);
      MQTTService.disconnect();
    };
  }, []);

  const handleConnect = () => {
    if (isConnected) {
      MQTTService.disconnect();
    } else {
      const options = {
        ...MQTT_CONFIG.OPTIONS,
        ...(MQTT_CONFIG.USERNAME && { username: MQTT_CONFIG.USERNAME }),
        ...(MQTT_CONFIG.PASSWORD && { password: MQTT_CONFIG.PASSWORD }),
      };
      MQTTService.connect(brokerUrl, options);
    }
  };

  const handleSendText = () => {
    if (!isConnected) {
      Alert.alert(
        'Not Connected',
        'Text will be sent when you connect to the device',
      );
      return;
    }
    if (displayText.trim()) {
      MQTTService.sendDisplayText(displayText);
      Alert.alert('Success', `Text sent: ${displayText}`);
    } else {
      Alert.alert('Error', 'Please enter some text');
    }
  };

  const handleBrightnessChange = (value: number) => {
    setBrightness(value);
    if (isConnected) {
      MQTTService.sendBrightness(Math.round(value));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerText}>Dot Matrix Controller</Text>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: isConnected ? '#4CAF50' : '#F44336' },
            ]}
          />
        </View>

        {/* Connection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection</Text>
          <View style={styles.connectionContainer}>
            <View style={styles.connectionStatus}>
              <Text style={styles.label}>Status:</Text>
              <Text
                style={[
                  styles.statusText,
                  { color: isConnected ? '#4CAF50' : '#F44336' },
                ]}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="MQTT Broker URL"
              placeholderTextColor="#999"
              value={brokerUrl}
              onChangeText={setBrokerUrl}
              editable={!isConnected}
            />
            <TouchableOpacity
              style={[
                styles.connectButton,
                { backgroundColor: isConnected ? '#F44336' : '#4CAF50' },
              ]}
              onPress={handleConnect}
            >
              <Text style={styles.buttonText}>
                {isConnected ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Display Text Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display Text</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter text to display"
            placeholderTextColor="#999"
            value={displayText}
            onChangeText={setDisplayText}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSendText}>
            <Text style={styles.buttonText}>
              {isConnected ? 'Send Text' : 'Send Text (Connect First)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Brightness Control Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Brightness Control</Text>
          <View style={styles.brightnessContainer}>
            <Text style={styles.brightnessValue}>
              {Math.round((brightness / 100) * 15)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={100}
              value={brightness}
              onValueChange={handleBrightnessChange}
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#555"
              thumbTintColor="#4CAF50"
            />
            <View style={styles.sliderLabels}>
              <Text style={styles.sliderLabel}>0</Text>
              <Text style={styles.sliderLabel}>7</Text>
              <Text style={styles.sliderLabel}>15</Text>
            </View>
          </View>
        </View>

        {/* Device Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Controller:</Text>
              <Text style={styles.infoValue}>ESP32-S3 / Raspberry Pi</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Protocol:</Text>
              <Text style={styles.infoValue}>MQTT</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Topics:</Text>
              <Text style={styles.infoValueSmall}>
                {MQTT_CONFIG.TOPICS.DISPLAY_TEXT}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}></Text>
              <Text style={styles.infoValueSmall}>
                {MQTT_CONFIG.TOPICS.BRIGHTNESS}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#16213e',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 5,
  },
  section: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 15,
  },
  connectionContainer: {
    gap: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 16,
    color: '#ccc',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0f3460',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#16213e',
  },
  connectButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
  },
  sendButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  brightnessContainer: {
    gap: 10,
  },
  brightnessValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#999',
  },
  infoContainer: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    flex: 2,
    textAlign: 'right',
  },
  infoValueSmall: {
    fontSize: 12,
    color: '#4CAF50',
    flex: 2,
    textAlign: 'right',
  },
});

export default App;
