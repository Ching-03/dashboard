print("Testing imports...")
try:
    import flask
    print("[OK] Flask installed")
    import flask_cors
    print("[OK] Flask-CORS installed")
    import mysql.connector
    print("[OK] MySQL Connector installed")
    import dotenv
    print("[OK] Python-dotenv installed")
    print("\n[SUCCESS] All dependencies installed!")
    print("\nYou can now run: npm run backend")
except ImportError as e:
    print(f"[ERROR] {e}")
