import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()

def get_connection():
    try:
        conn = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv("DB_NAME", "dashboard_app"),
            connection_timeout=10
        )

        # Prevent "MySQL server has gone away"
        conn.ping(reconnect=True)

        return conn

    except Error as e:
        print("DB connection error:", e)
        return None
