import { useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./Dashboard.css";

// Format date and time nicely
function fmtDateTime(d) {
  const t = new Date(d);
  return `${t.getDate().toString().padStart(2, "0")}/${
    (t.getMonth() + 1).toString().padStart(2, "0")
  } ${t.getHours().toString().padStart(2, "0")}:${
    t.getMinutes().toString().padStart(2, "0")
  }:${t.getSeconds().toString().padStart(2, "0")}`;
}

// Simple AI Analysis
function aiAnalysis(hrSeries, stressSeries) {
  if (!hrSeries.length || !stressSeries.length) return "No data yet.";

  const avgHR = (hrSeries.reduce((sum, p) => sum + p.value, 0) / hrSeries.length).toFixed(0);
  const avgStress = (stressSeries.reduce((sum, p) => sum + p.value, 0) / stressSeries.length).toFixed(2);

  if (avgStress > 0.75) return "⚠️ High stress detected! Consider relaxation.";
  if (avgHR > 100) return "⚠️ Elevated heart rate. Monitor your activity.";
  return `Normal readings. Avg HR: ${avgHR} bpm, Avg Stress: ${Math.round(avgStress * 100)}%`;
}

export default function Dashboard({ espConnected = false }) {
  const [monitoring, setMonitoring] = useState(true);
  const [hrSeries, setHrSeries] = useState([]);
  const [stressSeries, setStressSeries] = useState([]);
  const [steps, setSteps] = useState(0);
  const [alertMsg, setAlertMsg] = useState(null);
  const intervalRef = useRef(null);

  const present = useMemo(() => {
    const lastHR = hrSeries[hrSeries.length - 1]?.value || 0;
    const lastStress = stressSeries[stressSeries.length - 1]?.value || 0;
    return {
      heartRate: lastHR,
      stressLevel: lastStress,
      steps,
    };
  }, [hrSeries, stressSeries, steps]);

  // Fetch latest data from backend
  const fetchLatest = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard/data");
      const data = await res.json();

      // Check if data is valid
      if (!Array.isArray(data) || data.length === 0) return;

      const latest = data[0];

      if (latest.heartRate === undefined || latest.stressLevel === undefined) return;

      const timestamp = new Date(latest.timestamp || Date.now()).getTime();

      const hrPoint = { time: fmtDateTime(timestamp), value: latest.heartRate, ts: timestamp };
      const stressPoint = { time: fmtDateTime(timestamp), value: latest.stressLevel, ts: timestamp };

      setHrSeries((prev) => [...prev.slice(-49), hrPoint]);
      setStressSeries((prev) => [...prev.slice(-49), stressPoint]);
      setSteps(latest.steps ?? 0);

      setAlertMsg(latest.stressLevel > 0.75 ? "⚠️ Stress level is high!" : null);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    }
  };

  // Start/stop real-time polling
  useEffect(() => {
    if (monitoring && !intervalRef.current) {
      fetchLatest(); // initial fetch
      intervalRef.current = setInterval(fetchLatest, 2000);
    } else if (!monitoring && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => clearInterval(intervalRef.current);
  }, [monitoring]);

  return (
    <div className="dashboard-root">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h2>Health Monitoring Dashboard</h2>
          <p className="subtitle">Real-time health metrics and insights</p>
        </div>
        <div className="header-actions">
          <button
            className={`stop-btn ${monitoring ? "active" : "paused"}`}
            onClick={() => setMonitoring((m) => !m)}
          >
            {monitoring ? "Stop Monitoring" : "Start Monitoring"}
          </button>
          <div className="esp-status-header">
            {espConnected ? (
              <span style={{ color: "green" }}>Connected ✅</span>
            ) : (
              <span style={{ color: "red" }}>Disconnected ❌</span>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="cards-row">
        <div className="card">
          <div className="card-title">Heart Rate</div>
          <div className="card-body">
            <div className="stat-value">{present.heartRate} bpm</div>
            <div className="stat-sub">Normal</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Stress Level</div>
          <div className="card-body">
            <div className="stress-percent">
              {present.stressLevel !== null ? Math.round(present.stressLevel * 100) + "%" : "--"}
            </div>
            <div className="stress-bar">
              <div
                className="stress-bar-fill"
                style={{ width: present.stressLevel !== null ? `${Math.round(present.stressLevel * 100)}%` : "0%" }}
              />
            </div>
            <div className="stat-sub">Moderate</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Activity Level</div>
          <div className="card-body">
            <div className="stat-value">{present.steps.toLocaleString()}</div>
            <div className="stat-sub">+12% from yesterday</div>
          </div>
        </div>

        <div className="card">
          <div className="card-title">Alerts</div>
          <div className="card-body">
            <div className="stat-value">{alertMsg ? "1 active" : "0 today"}</div>
            <div className="stat-sub">{alertMsg || "All systems normal"}</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-row">
        <div className="chart-card large">
          <div className="chart-title">Heart Rate Trend</div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={hrSeries}>
              <defs>
                <linearGradient id="lineColorHR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#555", fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
              <YAxis domain={[40, 120]} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "BPM", angle: -90, position: "insideLeft", fill: "#555" }} />
              <Tooltip formatter={(value) => [`${value} bpm`, "Heart Rate"]} />
              <Line type="monotone" dataKey="value" stroke="url(#lineColorHR)" strokeWidth={3} dot={{ r: 3, stroke: "#fff", strokeWidth: 1 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card small">
          <div className="chart-title">Stress Level (Daily)</div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={stressSeries}>
              <defs>
                <linearGradient id="colorStress" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="time" tick={{ fill: "#555", fontSize: 12 }} interval={0} angle={-45} textAnchor="end" />
              <YAxis domain={[0, 1]} tick={{ fill: "#555", fontSize: 12 }} label={{ value: "Stress", angle: -90, position: "insideLeft", fill: "#555" }} />
              <Tooltip formatter={(value) => [`${Math.round(value * 100)} %`, "Stress Level"]} />
              <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={2} fill="url(#colorStress)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="ai-analysis">
        <h3>AI Analysis</h3>
        <p>{aiAnalysis(hrSeries, stressSeries)}</p>
      </div>
    </div>
  );
}
