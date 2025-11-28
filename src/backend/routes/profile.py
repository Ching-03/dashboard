from flask import Blueprint, request, jsonify
from models.database import get_connection

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('/<int:user_id>', methods=['GET'])
def get_profile(user_id):
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500

    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))
    user = cursor.fetchone()
    if not user:
        cursor.close()
        conn.close()
        return jsonify({"error": "User not found"}), 404

    cursor.execute("SELECT condition_name FROM user_conditions WHERE user_id=%s", (user_id,))
    user['conditions'] = [row['condition_name'] for row in cursor.fetchall()]

    cursor.execute("SELECT goal_text, progress FROM user_goals WHERE user_id=%s", (user_id,))
    user['goals'] = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(user)

@profile_bp.route('/<int:user_id>', methods=['PUT'])
def update_profile(user_id):
    data = request.json
    conn = get_connection()
    if not conn:
        return jsonify({"error": "DB connection failed"}), 500

    cursor = conn.cursor()

    fields = ['full_name', 'email', 'phone', 'birth_date', 'location',
              'blood_type', 'height', 'weight', 'emergency_contact', 'avatar']
    set_clause = ", ".join(f"{f}=%s" for f in fields if f in data)
    values = [data[f] for f in fields if f in data]
    values.append(user_id)

    if set_clause:
        cursor.execute(f"UPDATE users SET {set_clause} WHERE id=%s", values)

    # Update conditions
    if 'conditions' in data:
        cursor.execute("DELETE FROM user_conditions WHERE user_id=%s", (user_id,))
        for condition in data['conditions']:
            cursor.execute(
                "INSERT INTO user_conditions (user_id, condition_name) VALUES (%s, %s)",
                (user_id, condition)
            )

    # Update goals
    if 'goals' in data:
        cursor.execute("DELETE FROM user_goals WHERE user_id=%s", (user_id,))
        for goal in data['goals']:
            cursor.execute(
                "INSERT INTO user_goals (user_id, goal_text, progress) VALUES (%s, %s, %s)",
                (user_id, goal.get('text'), goal.get('progress', 0))
            )

    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Profile updated successfully"})
