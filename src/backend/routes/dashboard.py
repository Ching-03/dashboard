# routes/dashboard.py
from flask import Blueprint, request, jsonify
from db_connection import get_connection
from datetime import datetime, timedelta

dashboard_bp = Blueprint("dashboard_bp", __name__, url_prefix="/api/dashboard")

# Track last time ESP32 sent data
last_seen = None


# ----------------------------------------------------------
# Route: Receive data from ESP32
# ----------------------------------------------------------
@dashboard_bp.route("/data", methods=["POST"])
def receive_data():
    """
    ESP32 sends JSON payload:
    {
        "heartRate": 80,
        "stressLevel": 0.5,
        "steps": 120
    }
    """
    global last_seen

    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    heart_rate = data.get("heartRate")
    stress_level = data.get("stressLevel")
    steps = data.get("steps", 0)

    if heart_rate is None or stress_level is None:
        return jsonify({"error": "Missing required data"}), 400

    # Update last seen timestamp (REAL CONNECTION DETECTION)
    last_seen = datetime.now()

    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO device_data (heart_rate, stress_level, steps, timestamp)
            VALUES (%s, %s, %s, %s)
            """,
            (heart_rate, stress_level, steps, datetime.now()),
        )
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Data saved successfully"}), 201

    except Exception as e:
        print("DB insert error:", e)
        return jsonify({"error": "Failed to save data"}), 500


# ----------------------------------------------------------
# Route: Fetch latest data for frontend
# ----------------------------------------------------------
@dashboard_bp.route("/data", methods=["GET"])
def get_latest_data():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT * FROM device_data
            ORDER BY timestamp DESC
            LIMIT 50
            """
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()

        data = [
            {
                "heartRate": row["heart_rate"],
                "stressLevel": row["stress_level"],
                "steps": row["steps"],
                "timestamp": row["timestamp"].isoformat(),
            }
            for row in reversed(rows)
        ]

        return jsonify(data)

    except Exception as e:
        print("DB fetch error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500


# ----------------------------------------------------------
# Route: ESP32 connection status
# ----------------------------------------------------------
@dashboard_bp.route("/status", methods=["GET"])
def esp_status():
    """
    Returns TRUE if ESP32 sent data within last 5 seconds
    """
    global last_seen

    if last_seen is None:
        return jsonify({"connected": False})

    # If ESP32 sent data recently → ONLINE
    if datetime.now() - last_seen < timedelta(seconds=5):
        return jsonify({"connected": True})
    else:
        return jsonify({"connected": False})
