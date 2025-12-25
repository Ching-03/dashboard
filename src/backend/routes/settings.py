from flask import Blueprint, request, jsonify
from db_connection import get_connection

settings_bp = Blueprint('settings', __name__, url_prefix='/api/settings')

@settings_bp.route('/<int:user_id>', methods=['GET'])
def get_settings(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM user_settings WHERE user_id=%s", (user_id,))
    settings = cursor.fetchone()
    cursor.close()
    conn.close()
    
    return jsonify(settings or {})

@settings_bp.route('/<int:user_id>', methods=['PUT'])
def update_settings(user_id):
    data = request.json
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500
    
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO user_settings (user_id, notifications, theme, language) VALUES (%s, %s, %s, %s) ON DUPLICATE KEY UPDATE notifications=%s, theme=%s, language=%s",
        (user_id, data.get('notifications'), data.get('theme'), data.get('language'), data.get('notifications'), data.get('theme'), data.get('language'))
    )
    conn.commit()
    cursor.close()
    conn.close()
    
    return jsonify({"message": "Settings updated"})
