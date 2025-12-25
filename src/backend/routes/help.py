from flask import Blueprint, request, jsonify
from db_connection import get_connection

help_bp = Blueprint('help', __name__, url_prefix='/api/help')

@help_bp.route('/faq', methods=['GET'])
def get_faq():
    return jsonify([
        {"question": "How do I connect my device?", "answer": "Go to Settings and follow the pairing instructions."},
        {"question": "What is stress level?", "answer": "Stress level is calculated from heart rate variability."}
    ])

@help_bp.route('/contact', methods=['POST'])
def contact_support():
    data = request.json
    return jsonify({"message": "Support request received"})
