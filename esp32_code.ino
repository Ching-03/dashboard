#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Backend API endpoint
const char* serverUrl = "http://YOUR_COMPUTER_IP:5000/api/sensor/data";

// Sensors
MAX30105 particleSensor;
const int GSR_PIN = 34;  // GSR sensor analog pin

// Heart rate variables
const byte RATE_SIZE = 4;
byte rates[RATE_SIZE];
byte rateSpot = 0;
long lastBeat = 0;
float beatsPerMinute;
int beatAvg;

void setup() {
  Serial.begin(115200);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected!");
  Serial.println(WiFi.localIP());
  
  // Initialize MAX30102
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found!");
    while (1);
  }
  
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A);
  particleSensor.setPulseAmplitudeGreen(0);
}

void loop() {
  long irValue = particleSensor.getIR();
  
  // Read heart rate
  if (checkForBeat(irValue)) {
    long delta = millis() - lastBeat;
    lastBeat = millis();
    
    beatsPerMinute = 60 / (delta / 1000.0);
    
    if (beatsPerMinute < 255 && beatsPerMinute > 20) {
      rates[rateSpot++] = (byte)beatsPerMinute;
      rateSpot %= RATE_SIZE;
      
      beatAvg = 0;
      for (byte x = 0; x < RATE_SIZE; x++)
        beatAvg += rates[x];
      beatAvg /= RATE_SIZE;
    }
  }
  
  // Read SpO2 (simplified)
  int spo2 = map(particleSensor.getRed(), 0, 100000, 85, 100);
  spo2 = constrain(spo2, 85, 100);
  
  // Read GSR
  int gsrValue = analogRead(GSR_PIN);
  
  // Send data every 2 seconds
  static unsigned long lastSend = 0;
  if (millis() - lastSend > 2000 && beatAvg > 0) {
    sendData(beatAvg, spo2, gsrValue);
    lastSend = millis();
  }
  
  delay(100);
}

void sendData(int heartRate, int spo2, int gsr) {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    StaticJsonDocument<200> doc;
    doc["heartRate"] = heartRate;
    doc["spo2"] = spo2;
    doc["gsr"] = gsr;
    
    String jsonData;
    serializeJson(doc, jsonData);
    
    int httpCode = http.POST(jsonData);
    
    if (httpCode > 0) {
      Serial.printf("Data sent! Code: %d\n", httpCode);
      Serial.println(jsonData);
    } else {
      Serial.printf("Error: %s\n", http.errorToString(httpCode).c_str());
    }
    
    http.end();
  }
}
