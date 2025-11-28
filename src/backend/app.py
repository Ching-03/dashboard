from flask import Flask
from flask_cors import CORS
from routes.profile import profile_bp
from routes.dashboard import dashboard_bp

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

app.register_blueprint(profile_bp)
app.register_blueprint(dashboard_bp)

@app.route("/")
def index():
    return {"message": "Backend running"}

if __name__ == "__main__":
    app.run(debug=True, port=5000)
