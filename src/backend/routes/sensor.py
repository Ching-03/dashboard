from flask import Blueprint, request, jsonify
from db_connection import get_connection
from datetime import datetime, timedelta

sensor_bp = Blueprint("sensor_bp", __name__, url_prefix="/api/sensor")

last_seen = None

@sensor_bp.route("/data", methods=["POST"])
def receive_sensor_data():
    """
    ESP32 sends JSON:
    {
        "heartRate": 75,
        "spo2": 98,
        "gsr": 450
    }
    """
    global last_seen
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data"}), 400
    
    heart_rate = data.get("heartRate")
    spo2 = data.get("spo2")
    gsr = data.get("gsr")
    
    if heart_rate is None or spo2 is None or gsr is None:
        return jsonify({"error": "Missing sensor data"}), 400
    
    last_seen = datetime.now()
    
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO sensor_data (heart_rate, spo2, gsr, timestamp)
            VALUES (%s, %s, %s, %s)
            """,
            (heart_rate, spo2, gsr, datetime.now())
        )
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({"status": "success"}), 200
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@sensor_bp.route("/data", methods=["GET"])
def get_sensor_data():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT * FROM sensor_data
            ORDER BY timestamp DESC
            LIMIT 100
            """
        )
        rows = cursor.fetchall()
        cursor.close()
        conn.close()
        
        data = [
            {
                "heartRate": row["heart_rate"],
                "spo2": row["spo2"],
                "gsr": row["gsr"],
                "timestamp": row["timestamp"].isoformat()
            }
            for row in rows
        ]
        
        return jsonify(data), 200
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@sensor_bp.route("/latest", methods=["GET"])
def get_latest():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute(
            """
            SELECT * FROM sensor_data
            ORDER BY timestamp DESC
            LIMIT 1
            """
        )
        row = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if row:
            return jsonify({
                "heartRate": row["heart_rate"],
                "spo2": row["spo2"],
                "gsr": row["gsr"],
                "timestamp": row["timestamp"].isoformat()
            }), 200
        
        return jsonify({"error": "No data"}), 404
    
    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500

@sensor_bp.route("/status", methods=["GET"])
def sensor_status():
    global last_seen
    
    if last_seen and datetime.now() - last_seen < timedelta(seconds=10):
        return jsonify({"connected": True, "lastSeen": last_seen.isoformat()}), 200
    
    return jsonify({"connected": False}), 200
