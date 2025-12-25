from flask import Flask
from flask_cors import CORS
from routes.profile import profile_bp
from routes.dashboard import dashboard_bp
from routes.auth import auth_bp
from routes.history import history_bp
from routes.settings import settings_bp
from routes.help import help_bp
from routes.ai_analysis import ai_analysis_bp
from routes.sensor import sensor_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(auth_bp)
app.register_blueprint(profile_bp)
app.register_blueprint(dashboard_bp)
app.register_blueprint(history_bp)
app.register_blueprint(settings_bp)
app.register_blueprint(help_bp)
app.register_blueprint(ai_analysis_bp)
app.register_blueprint(sensor_bp)

@app.route("/")
def index():
    return {"message": "Backend running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
