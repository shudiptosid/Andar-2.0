# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Configure MQTT Broker

Edit `src/config/mqtt.config.js`:

**For Testing (Public Broker):**

```javascript
BROKER_URL: 'mqtt://broker.hivemq.com:1883';
```

**For Production (Local Device):**

```javascript
BROKER_URL: 'mqtt://192.168.1.XXX:1883'; // Your ESP32/Pi IP address
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Run on Android

```bash
npx react-native run-android
```

## 📱 Using the App

1. **Connect**

   - Tap "Connect" button
   - Wait for green status indicator

2. **Send Text**

   - Type your message
   - Tap "Send Text"

3. **Adjust Brightness**
   - Use slider (0-100%)
   - Updates in real-time

## 🔧 Device Setup

### ESP32-S3

1. Open Arduino IDE
2. Load `device/ESP32_MQTT_Example.ino`
3. Update WiFi credentials
4. Upload to board
5. See `device/README.md` for details

### Raspberry Pi

1. Install dependencies: `pip3 install paho-mqtt luma.led_matrix`
2. Run: `python3 device/raspberry_pi_mqtt.py`
3. See `device/README.md` for details

## 🐛 Troubleshooting

### App won't connect

- Check broker URL
- Ensure device is on same network
- Verify broker is running

### Can't build app

```bash
cd android
./gradlew clean
cd ..
npx react-native start --reset-cache
```

### Device not responding

- Check MQTT topics match
- Test with MQTT client (MQTT Explorer)
- Verify device is connected to broker

## 📚 Documentation

- Full README: `README.md`
- Device Setup: `device/README.md`
- MQTT Config: `src/config/mqtt.config.js`

## 🎯 MQTT Topics Reference

| Topic                          | Purpose       | Format         |
| ------------------------------ | ------------- | -------------- |
| `dotmatrix/display/text`       | Display text  | String         |
| `dotmatrix/display/brightness` | Brightness    | 0-100          |
| `dotmatrix/status`             | Device status | online/offline |

## 💡 Tips

- Use local MQTT broker for better performance
- Keep messages under 256 characters
- Brightness updates happen instantly
- Connection status updates automatically

## 🔗 Useful Links

- [React Native Docs](https://reactnative.dev)
- [MQTT.org](https://mqtt.org)
- [ESP32 Docs](https://docs.espressif.com)
- [Raspberry Pi Docs](https://www.raspberrypi.org/documentation)

## ✅ Checklist

- [ ] Configure MQTT broker URL
- [ ] Install npm dependencies
- [ ] Setup ESP32 or Raspberry Pi
- [ ] Wire dot matrix display
- [ ] Test MQTT connection
- [ ] Run React Native app
- [ ] Send test message
- [ ] Adjust brightness

## 🎨 Customization

Want to customize the app?

- UI colors: Edit styles in `App.tsx`
- MQTT topics: Edit `src/config/mqtt.config.js`
- Features: Modify `App.tsx` and `MQTTService.js`

Ready to build? See `README.md` for detailed instructions!
