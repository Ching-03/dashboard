import { useEffect, useState } from "react";
import { AiOutlineCheckCircle, AiOutlineWarning } from "react-icons/ai";
import { BsArrowDownRight, BsArrowUpRight, BsDash } from "react-icons/bs";
import { FaBrain, FaHeartbeat, FaRunning } from "react-icons/fa";
import "./AIAnalysis.css";

export default function AIAnalysis({ deviceData }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [metrics, setMetrics] = useState({
    cardiovascular: 85,
    stress: 62,
    sleep: 71,
    activity: 88,
  });
  const [healthScore, setHealthScore] = useState(78);

  useEffect(() => {
    if (deviceData) {
      // Compute real-time metrics based on incoming data
      const newStress = Math.max(0, Math.min(100, Math.round((1 - deviceData.stressLevel) * 100)));
      const newCardio = deviceData.heartRate
        ? Math.max(60, Math.min(100, 100 - Math.abs(deviceData.heartRate - 75)))
        : metrics.cardiovascular;

      const newActivity = deviceData.steps
        ? Math.min(100, Math.round((deviceData.steps / 10000) * 100))
        : metrics.activity;

      setMetrics((prev) => ({
        ...prev,
        stress: newStress,
        cardiovascular: newCardio,
        activity: newActivity,
      }));

      // Simple health score calculation
      const newScore = Math.round((newStress + newCardio + newActivity + metrics.sleep) / 4);
      setHealthScore(newScore);
    }
  }, [deviceData, metrics.sleep]);

  return (
    <div className="ai-analysis">
      <h2>AI Health Analysis</h2>
      <p className="subtitle">Intelligent insights powered by machine learning</p>

      {/* ===== Overall Health Card ===== */}
      <div className="overall-card">
        <div className="score-ring">
          <div className="circle">
            <span>{healthScore}</span>
            <p>Score</p>
          </div>
        </div>
        <div className="overall-info">
          <h3>Overall Health Score</h3>
          <p>
            Your health metrics are monitored in real-time. AI insights highlight areas of improvement while tracking
            cardiovascular health, stress levels, and activity patterns.
          </p>
        </div>
        <div className={`status-tag ${healthScore > 80 ? "improving" : "stable"}`}>
          {healthScore > 80 ? "↑ Improving" : "⚡ Stable"}
        </div>
      </div>

      {/* ===== Tabs ===== */}
      <div className="tabs">
        {["overview", "recommendations", "patterns"].map((tab) => (
          <button key={tab} className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ===== Overview ===== */}
      {activeTab === "overview" && (
        <>
          <div className="metrics-card">
            <h4>Health Metrics Analysis</h4>
            <Metric label="Cardiovascular Health" value={metrics.cardiovascular} />
            <Metric label="Stress Management" value={metrics.stress} />
            <Metric label="Sleep Quality" value={metrics.sleep} />
            <Metric label="Physical Activity" value={metrics.activity} />
          </div>

          <div className="two-box-container">
            <div className="strengths-box">
              <h4>
                <AiOutlineCheckCircle /> Strengths
              </h4>
              <ul>
                <li>Consistent heart rate throughout the day</li>
                <li>High physical activity levels maintained</li>
                <li>Good recovery time after exercise</li>
              </ul>
            </div>
            <div className="improve-box">
              <h4>
                <AiOutlineWarning /> Areas to Improve
              </h4>
              <ul>
                <li>Elevated stress levels during afternoons</li>
                <li>Irregular sleep patterns on weekends</li>
                <li>Hydration levels could be optimized</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* ===== Recommendations ===== */}
      {activeTab === "recommendations" && (
        <div className="recommendations">
          <Recommendation
            icon={<FaRunning />}
            title="Increase Daily Activity"
            text="Add 15 minutes of walking daily. Slight increases can improve cardiovascular health."
            priority="medium"
          />
          <Recommendation
            icon={<FaBrain />}
            title="Stress Reduction Techniques"
            text="Afternoon stress spikes observed. Practice meditation or deep breathing exercises."
            priority="high"
          />
          <Recommendation
            icon={<FaHeartbeat />}
            title="Heart Rate Variability"
            text="HRV shows good recovery. Maintain consistent sleep schedule to optimize heart health."
            priority="low"
          />
        </div>
      )}

      {/* ===== Patterns ===== */}
      {activeTab === "patterns" && (
        <div className="patterns">
          <div className="pattern-card">
            <h4>Heart Rate Pattern</h4>
            <p>
              <strong>Finding:</strong> Heart rate spikes around 3 PM daily
            </p>
            <p>
              <strong>Insight:</strong> Correlates with afternoon coffee intake. Consider switching to decaf after 2
              PM.
            </p>
          </div>
          <div className="pattern-card">
            <h4>Stress Correlation</h4>
            <p>
              <strong>Finding:</strong> Stress levels 40% higher on weekdays
            </p>
            <p>
              <strong>Insight:</strong> Implement weekend relaxation techniques during weekdays to balance stress.
            </p>
          </div>
          <div className="pattern-card">
            <h4>Recovery Time</h4>
            <p>
              <strong>Finding:</strong> Heart rate recovery after activity improved by 12%
            </p>
            <p>
              <strong>Insight:</strong> Indicates improving cardiovascular fitness. Keep up your current routine.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  let color = value > 80 ? "up" : value < 65 ? "down" : "neutral";
  return (
    <div className="metric">
      <span>{label}</span>
      <div className="bar">
        <div className="fill" style={{ width: `${value}%` }}></div>
      </div>
      <span className={`value ${color}`}>
        {value}%{" "}
        {color === "up" ? <BsArrowUpRight /> : color === "down" ? <BsArrowDownRight /> : <BsDash />}
      </span>
    </div>
  );
}

function Recommendation({ icon, title, text, priority }) {
  return (
    <div className="recommendation-card">
      <div className="icon">{icon}</div>
      <div className="rec-content">
        <h4>{title}</h4>
        <p>{text}</p>
      </div>
      <span className={`priority ${priority}`}>{priority} priority</span>
    </div>
  );
}
