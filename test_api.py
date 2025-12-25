import requests
import json

# Test sensor data endpoint
url = "http://localhost:5000/api/sensor/data"

# Simulate ESP32 sending data
test_data = {
    "heartRate": 75,
    "spo2": 98,
    "gsr": 450
}

print("Testing POST /api/sensor/data...")
response = requests.post(url, json=test_data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Get sensor data
print("Testing GET /api/sensor/data...")
response = requests.get(url)
print(f"Status: {response.status_code}")
print(f"Data: {json.dumps(response.json(), indent=2)}\n")

# Get latest reading
print("Testing GET /api/sensor/latest...")
response = requests.get("http://localhost:5000/api/sensor/latest")
print(f"Status: {response.status_code}")
print(f"Latest: {json.dumps(response.json(), indent=2)}\n")

# Check connection status
print("Testing GET /api/sensor/status...")
response = requests.get("http://localhost:5000/api/sensor/status")
print(f"Status: {response.status_code}")
print(f"Connection: {json.dumps(response.json(), indent=2)}")
