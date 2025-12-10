/*
 * ESP32-S3 Dot Matrix Display Controller
 *
 * This code subscribes to MQTT topics and controls a dot matrix display
 * Compatible with ESP32-S3, ESP32, and similar boards
 *
 * Required Libraries:
 * - PubSubClient (for MQTT)
 * - WiFi (built-in)
 * - MD_Parola (for dot matrix control)
 * - MD_MAX72xx (for MAX7219 driver)
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <MD_Parola.h>
#include <MD_MAX72xx.h>
#include <SPI.h>

// WiFi Configuration
const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";

// MQTT Configuration
const char *mqtt_server = "broker.hivemq.com"; // Or your local broker IP
const int mqtt_port = 1883;
const char *mqtt_client_id = "ESP32_DotMatrix";

// MQTT Topics
const char *topic_text = "dotmatrix/display/text";
const char *topic_brightness = "dotmatrix/display/brightness";
const char *topic_status = "dotmatrix/status";

// Dot Matrix Configuration
#define HARDWARE_TYPE MD_MAX72XX::FC16_HW // Change based on your hardware
#define MAX_DEVICES 4                     // Number of 8x8 modules
#define CS_PIN 5                          // Chip Select pin
#define CLK_PIN 18                        // Clock pin
#define DATA_PIN 23                       // Data pin

MD_Parola display = MD_Parola(HARDWARE_TYPE, DATA_PIN, CLK_PIN, CS_PIN, MAX_DEVICES);

WiFiClient espClient;
PubSubClient client(espClient);

// Display settings
char displayText[256] = "Ready";
int brightness = 5; // 0-15 for MD_Parola

void setup()
{
    Serial.begin(115200);

    // Initialize display
    display.begin();
    display.setIntensity(brightness);
    display.displayClear();
    display.displayText(displayText, PA_CENTER, 0, 0, PA_SCROLL_LEFT, PA_SCROLL_LEFT);

    // Connect to WiFi
    setup_wifi();

    // Configure MQTT
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(callback);
}

void setup_wifi()
{
    delay(10);
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void callback(char *topic, byte *payload, unsigned int length)
{
    // Convert payload to string
    char message[256];
    for (unsigned int i = 0; i < length && i < 255; i++)
    {
        message[i] = (char)payload[i];
    }
    message[length] = '\0';

    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    Serial.println(message);

    // Handle text message
    if (strcmp(topic, topic_text) == 0)
    {
        strcpy(displayText, message);
        display.displayText(displayText, PA_CENTER, 0, 0, PA_SCROLL_LEFT, PA_SCROLL_LEFT);
        Serial.print("Display text updated: ");
        Serial.println(displayText);
    }

    // Handle brightness
    if (strcmp(topic, topic_brightness) == 0)
    {
        int newBrightness = atoi(message);
        // Convert 0-100 to 0-15
        brightness = map(newBrightness, 0, 100, 0, 15);
        display.setIntensity(brightness);
        Serial.print("Brightness set to: ");
        Serial.println(brightness);
    }
}

void reconnect()
{
    while (!client.connected())
    {
        Serial.print("Attempting MQTT connection...");

        if (client.connect(mqtt_client_id))
        {
            Serial.println("connected");

            // Subscribe to topics
            client.subscribe(topic_text);
            client.subscribe(topic_brightness);

            // Publish status
            client.publish(topic_status, "online");

            Serial.println("Subscribed to topics");
        }
        else
        {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" retrying in 5 seconds");
            delay(5000);
        }
    }
}

void loop()
{
    if (!client.connected())
    {
        reconnect();
    }
    client.loop();

    // Animate display
    if (display.displayAnimate())
    {
        display.displayReset();
    }

    // Send heartbeat every 30 seconds
    static unsigned long lastHeartbeat = 0;
    if (millis() - lastHeartbeat > 30000)
    {
        if (client.connected())
        {
            client.publish(topic_status, "online");
        }
        lastHeartbeat = millis();
    }
}

/*
 * Wiring Guide for MAX7219 Dot Matrix:
 *
 * ESP32-S3/ESP32    MAX7219 Module
 * --------------------------------
 * 5V            ->  VCC
 * GND           ->  GND
 * GPIO 23       ->  DIN (Data In)
 * GPIO 18       ->  CLK (Clock)
 * GPIO 5        ->  CS (Chip Select)
 *
 * Multiple modules can be daisy-chained:
 * Module 1 DOUT -> Module 2 DIN
 */
