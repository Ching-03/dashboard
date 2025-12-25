from flask import Blueprint, request, jsonify
from db_connection import get_connection
import bcrypt

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email=%s", (email,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401
    
    return jsonify({"message": "Login successful", "userId": user['id'], "user": user})

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO users (full_name, email, phone) VALUES (%s, %s, %s)",
        (data.get('full_name'), data.get('email'), data.get('phone'))
    )
    conn.commit()
    user_id = cursor.lastrowid
    cursor.close()
    conn.close()
    
    return jsonify({"message": "User registered", "userId": user_id}), 201
