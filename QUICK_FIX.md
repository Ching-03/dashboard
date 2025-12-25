# Quick Fix for Backend Error

## Problem
The backend script is looking for a virtual environment (venv) that doesn't exist.

## Solution

### Option 1: Install Python packages globally (Easiest)

1. **Install pip** (if not installed):
```bash
python -m ensurepip --upgrade
```

2. **Install required packages**:
```bash
cd src\backend
pip install flask flask-cors mysql-connector-python python-dotenv
```

3. **Run backend**:
```bash
npm run backend
```

OR directly:
```bash
cd src\backend
python app.py
```

---

### Option 2: Create virtual environment (Recommended)

1. **Create venv**:
```bash
cd src\backend
python -m venv venv
```

2. **Activate venv**:
```bash
.\venv\Scripts\activate
```

3. **Install packages**:
```bash
pip install flask flask-cors mysql-connector-python python-dotenv
```

4. **Update package.json** (already done):
```json
"backend": "cd src\\backend && python app.py"
```

5. **Run**:
```bash
npm run backend
```

---

### Option 3: Use the batch file

Simply run:
```bash
cd src\backend
start.bat
```

---

## Verify Backend is Running

You should see:
```
 * Running on http://127.0.0.1:5000
 * Debug mode: on
```

Test it:
```bash
curl http://localhost:5000
```

Should return:
```json
{"message": "Backend running"}
```

---

## Setup Database (Required)

1. **Start MySQL** (XAMPP, WAMP, or MySQL Workbench)

2. **Run schema**:
```bash
mysql -u root -p < schema.sql
```

Or manually in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS dashboard_app;
USE dashboard_app;

CREATE TABLE sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heart_rate INT NOT NULL,
    spo2 INT NOT NULL,
    gsr INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
);
```

---

## Run Full Stack

```bash
npm run dev
```

This will start:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
