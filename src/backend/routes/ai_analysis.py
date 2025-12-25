from flask import Blueprint, jsonify
from db_connection import get_connection

ai_analysis_bp = Blueprint('ai_analysis', __name__, url_prefix='/api/ai')

@ai_analysis_bp.route('/analyze/<int:user_id>', methods=['GET'])
def analyze_health(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500
    
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT AVG(heart_rate) as avg_hr, AVG(stress_level) as avg_stress, SUM(steps) as total_steps FROM device_data WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)"
    )
    stats = cursor.fetchone()
    cursor.close()
    conn.close()
    
    insights = []
    if stats['avg_hr'] and stats['avg_hr'] > 100:
        insights.append("Your average heart rate is elevated. Consider relaxation techniques.")
    if stats['avg_stress'] and stats['avg_stress'] > 0.7:
        insights.append("High stress detected. Try meditation or breathing exercises.")
    if stats['total_steps'] and stats['total_steps'] < 7000:
        insights.append("Low activity level. Aim for 10,000 steps daily.")
    
    return jsonify({"stats": stats, "insights": insights})
