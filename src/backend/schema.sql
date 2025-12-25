CREATE DATABASE IF NOT EXISTS dashboard_app;
USE dashboard_app;

CREATE TABLE IF NOT EXISTS sensor_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heart_rate INT NOT NULL,
    spo2 INT NOT NULL,
    gsr INT NOT NULL,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
);

CREATE TABLE IF NOT EXISTS device_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    heart_rate INT NOT NULL,
    stress_level FLOAT NOT NULL,
    steps INT DEFAULT 0,
    timestamp DATETIME NOT NULL,
    INDEX idx_timestamp (timestamp)
);
