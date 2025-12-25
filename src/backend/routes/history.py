from flask import Blueprint, jsonify
from db_connection import get_connection

history_bp = Blueprint('history', __name__, url_prefix='/api/history')

@history_bp.route('/<int:user_id>', methods=['GET'])
def get_history(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM device_data ORDER BY timestamp DESC LIMIT 100"
    )
    history = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify(history)
