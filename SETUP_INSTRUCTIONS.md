# ESP32 Sensor Integration Setup

## Backend Setup

### 1. Install Python Dependencies
```bash
pip install flask flask-cors mysql-connector-python python-dotenv
```

### 2. Setup Database
Run the SQL schema:
```bash
mysql -u root -p < src/backend/schema.sql
```

Or manually in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS dashboard_app;
USE dashboard_app;

CREATE TABLE sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heart_rate INT NOT NULL,
    spo2 INT NOT NULL,
    gsr INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
);
```

### 3. Start Backend
```bash
cd src/backend
python app.py
```

Backend will run on: `http://localhost:5000`

---

## ESP32 Setup

### 1. Install Arduino Libraries
In Arduino IDE, install:
- **WiFi** (built-in)
- **HTTPClient** (built-in)
- **ArduinoJson** by Benoit Blanchon
- **SparkFun MAX3010x Pulse and Proximity Sensor Library**

### 2. Hardware Connections

**MAX30102:**
- VIN → 3.3V
- GND → GND
- SDA → GPIO 21
- SCL → GPIO 22

**GSR Grove Sensor:**
- VCC → 3.3V
- GND → GND
- SIG → GPIO 34 (ADC pin)

### 3. Configure ESP32 Code
Edit `esp32_code.ino`:

```cpp
const char* ssid = "YOUR_WIFI_SSID";          // Your WiFi name
const char* password = "YOUR_WIFI_PASSWORD";   // Your WiFi password
const char* serverUrl = "http://192.168.1.100:5000/api/sensor/data";  // Your computer's IP
```

**Find your computer's IP:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

### 4. Upload to ESP32
1. Select board: **ESP32 Dev Module**
2. Select correct COM port
3. Click Upload

---

## API Endpoints

### POST `/api/sensor/data`
**ESP32 sends sensor data**

Request:
```json
{
  "heartRate": 75,
  "spo2": 98,
  "gsr": 450
}
```

Response:
```json
{
  "status": "success"
}
```

### GET `/api/sensor/data`
**Get last 100 sensor readings**

Response:
```json
[
  {
    "heartRate": 75,
    "spo2": 98,
    "gsr": 450,
    "timestamp": "2024-01-15T10:30:00"
  }
]
```

### GET `/api/sensor/latest`
**Get most recent reading**

Response:
```json
{
  "heartRate": 75,
  "spo2": 98,
  "gsr": 450,
  "timestamp": "2024-01-15T10:30:00"
}
```

### GET `/api/sensor/status`
**Check if ESP32 is connected**

Response:
```json
{
  "connected": true,
  "lastSeen": "2024-01-15T10:30:00"
}
```

---

## Testing

### Test Backend API
```bash
curl -X POST http://localhost:5000/api/sensor/data \
  -H "Content-Type: application/json" \
  -d '{"heartRate": 75, "spo2": 98, "gsr": 450}'
```

### Monitor ESP32 Serial Output
Open Serial Monitor (115200 baud) to see:
- WiFi connection status
- Sensor readings
- HTTP response codes

---

## Troubleshooting

**ESP32 can't connect to WiFi:**
- Check SSID and password
- Ensure 2.4GHz WiFi (ESP32 doesn't support 5GHz)

**HTTP Error 404:**
- Verify backend is running
- Check computer's IP address
- Ensure firewall allows port 5000

**MAX30102 not found:**
- Check I2C connections (SDA/SCL)
- Verify 3.3V power supply

**GSR readings unstable:**
- Ensure proper finger contact
- Wait 5-10 seconds for stabilization

---

## Frontend Integration Example

```javascript
// Fetch latest sensor data
fetch('http://localhost:5000/api/sensor/latest')
  .then(res => res.json())
  .then(data => {
    console.log('Heart Rate:', data.heartRate);
    console.log('SpO2:', data.spo2);
    console.log('GSR:', data.gsr);
  });

// Check ESP32 connection status
fetch('http://localhost:5000/api/sensor/status')
  .then(res => res.json())
  .then(data => {
    console.log('ESP32 Connected:', data.connected);
  });
```
