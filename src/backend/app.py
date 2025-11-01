from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import json

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="dashboard_app"
    )

# GET profile by email. If not exists, create then return saved row (with id)
@app.route("/api/profile/<email>", methods=["GET"])
def get_profile(email):
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        # create default
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
        # fetch the inserted record
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

    # convert json fields safely
    try:
        user["conditions"] = json.loads(user["conditions"]) if user.get("conditions") else []
    except Exception:
        user["conditions"] = []
    try:
        user["goals"] = json.loads(user["goals"]) if user.get("goals") else []
    except Exception:
        user["goals"] = []

    cursor.close()
    db.close()
    return jsonify(user)

# POST: create or update. Use id if provided; otherwise try email match.
@app.route("/api/profile", methods=["POST"])
def save_profile():
    data = request.get_json() or {}
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)

    # prepare json fields
    conditions_json = json.dumps(data.get("conditions", []))
    goals_json = json.dumps(data.get("goals", []))

    user_id = data.get("id")
    if user_id:
        cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        existing = cursor.fetchone()
    else:
        cursor.execute("SELECT * FROM users WHERE email = %s", (data.get("email"),))
        existing = cursor.fetchone()

    if existing:
        # update by id if possible, otherwise by email
        if user_id:
            where_param = user_id
            where_col = "id"
        else:
            where_param = data.get("email")
            where_col = "email"

        cursor.execute(f"""
            UPDATE users
            SET full_name=%s, email=%s, phone=%s, birth_date=%s, location=%s, blood_type=%s,
                height=%s, weight=%s, emergency_contact=%s, avatar=%s,
                conditions=%s, goals=%s
            WHERE {where_col}=%s
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
            conditions_json,
            goals_json,
            where_param
        ))
        db.commit()

        # fetch updated record
        if user_id:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
        else:
            cursor.execute("SELECT * FROM users WHERE email = %s", (data.get("email"),))
        saved = cursor.fetchone()
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
            conditions_json,
            goals_json
        ))
        db.commit()
        cursor.execute("SELECT * FROM users WHERE email = %s", (data.get("email"),))
        saved = cursor.fetchone()

    # return saved record (with id); ensure conditions/goals are arrays
    try:
        saved["conditions"] = json.loads(saved["conditions"]) if saved.get("conditions") else []
    except:
        saved["conditions"] = []
    try:
        saved["goals"] = json.loads(saved["goals"]) if saved.get("goals") else []
    except:
        saved["goals"] = []

    cursor.close()
    db.close()

    return jsonify({"message": "✅ Profile saved successfully!", "profile": saved}), 200

@app.route("/")
def home():
    return "Flask backend running ✅"

if __name__ == "__main__":
    app.run(debug=True)
