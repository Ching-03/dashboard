from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import json
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# -------------------------
# Database connection
# -------------------------
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="dashboard_app"
    )

# -------------------------
# Profile endpoints
# -------------------------
@app.route("/api/profile/<email>", methods=["GET"])
def get_profile(email):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE email = %s LIMIT 1", (email,))
    user = cursor.fetchone()

    if not user:
        default_user = {
            "full_name": "New User",
            "email": email,
            "phone": "",
            "birth_date": "",
            "location": "",
            "blood_type": "",
            "height": "",
            "weight": "",
            "emergency_contact": "",
            "avatar": "",
            "conditions": json.dumps([]),
            "goals": json.dumps([])
        }

        cursor.execute("""
            INSERT INTO users (full_name, email, phone, birth_date, location, blood_type,
                               height, weight, emergency_contact, avatar, conditions, goals)
            VALUES (%(full_name)s, %(email)s, %(phone)s, %(birth_date)s, %(location)s,
                    %(blood_type)s, %(height)s, %(weight)s, %(emergency_contact)s,
                    %(avatar)s, %(conditions)s, %(goals)s)
        """, default_user)
        db.commit()
        cursor.execute("SELECT * FROM users WHERE email = %s LIMIT 1", (email,))
        user = cursor.fetchone()

    for field in ["conditions", "goals"]:
        try:
            user[field] = json.loads(user[field]) if user[field] else []
        except:
            user[field] = []

    cursor.close()
    db.close()
    return jsonify(user)

@app.route("/api/profile", methods=["POST"])
def save_profile():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON input"}), 400

        db = get_db_connection()
        cursor = db.cursor(dictionary=True)

        user_id = data.get("id")
        conditions = json.dumps(data.get("conditions", []))
        goals = json.dumps(data.get("goals", []))

        if user_id:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            existing = cursor.fetchone()

            if existing:
                cursor.execute("""
                    UPDATE users
                    SET full_name=%s, email=%s, phone=%s, birth_date=%s, location=%s,
                        blood_type=%s, height=%s, weight=%s, emergency_contact=%s,
                        avatar=%s, conditions=%s, goals=%s
                    WHERE id=%s
                """, (
                    data.get("fullName", ""),
                    data.get("email", ""),
                    data.get("phone", ""),
                    data.get("birthDate", ""),
                    data.get("location", ""),
                    data.get("bloodType", ""),
                    data.get("height", ""),
                    data.get("weight", ""),
                    data.get("emergencyContact", ""),
                    data.get("avatar", ""),
                    conditions,
                    goals,
                    user_id
                ))
                db.commit()
        else:
            cursor.execute("""
                INSERT INTO users (full_name, email, phone, birth_date, location, blood_type,
                                   height, weight, emergency_contact, avatar, conditions, goals)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                data.get("fullName", ""),
                data.get("email", ""),
                data.get("phone", ""),
                data.get("birthDate", ""),
                data.get("location", ""),
                data.get("bloodType", ""),
                data.get("height", ""),
                data.get("weight", ""),
                data.get("emergencyContact", ""),
                data.get("avatar", ""),
                conditions,
                goals
            ))
            db.commit()

        cursor.execute("SELECT * FROM users WHERE email = %s ORDER BY id DESC LIMIT 1", (data.get("email"),))
        saved = cursor.fetchone()

        for field in ["conditions", "goals"]:
            try:
                saved[field] = json.loads(saved[field]) if saved[field] else []
            except:
                saved[field] = []

        cursor.close()
        db.close()
        return jsonify({"message": "✅ Profile saved successfully!", "profile": saved}), 200

    except Exception as e:
        print("❌ Error saving profile:", str(e))
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

# -------------------------
# Real-time device data
# -------------------------
latest_device_data = {
    "heartRate": 72,
    "stressLevel": 0.32,
    "steps": 0,
    "timestamp": None,
    "connected": False  # track ESP32 connection
}

@app.route("/api/device-data", methods=["POST"])
def post_device_data():
    """ESP32 sends real-time sensor data"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON input"}), 400

        latest_device_data["heartRate"] = data.get("heartRate", latest_device_data["heartRate"])
        latest_device_data["stressLevel"] = data.get("stressLevel", latest_device_data["stressLevel"])
        latest_device_data["steps"] = data.get("steps", latest_device_data["steps"])
        latest_device_data["timestamp"] = data.get("timestamp") or datetime.now().isoformat()
        latest_device_data["connected"] = True  # mark ESP32 as connected

        return jsonify({"message": "Data received ✅"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/device-data", methods=["GET"])
def get_device_data():
    """Frontend polls this endpoint for latest real-time data"""
    return jsonify(latest_device_data), 200

@app.route("/api/esp-status", methods=["GET"])
def esp_status():
    """Simple status check for React sidebar"""
    return jsonify({"connected": latest_device_data.get("connected", False)}), 200

@app.route("/")
def home():
    return "Flask backend running ✅"

if __name__ == "__main__":
    app.run(debug=True)
