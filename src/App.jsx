import { useEffect, useState } from "react";
import "./App.css";
import AIAnalysis from "./components/AIAnalysis";
import Dashboard from "./components/Dashboard";
import Help from "./components/Help";
import History from "./components/History";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

export default function App({ onBack }) {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    avatarUrl:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZHvxVgtGqrVGGf2LV8KrkfdEMmudzlVXH_7oxnIvkpy_6y0vdrjPE8wjUYUfQkIM_Q1g&usqp=CAU",
  });

  const [history, setHistory] = useState([]);
  const [espConnected, setEspConnected] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [presentData, setPresentData] = useState({
    heartRate: null,
    stressLevel: null,
    steps: 0,
  });
  const [alertMsg, setAlertMsg] = useState(null);
  const [theme, setTheme] = useState("dark");

  // Load saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // Apply theme
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Check ESP32 connection every 5 seconds
  useEffect(() => {
    const checkESP = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/esp-status");
        const data = await res.json();
        setEspConnected(data.connected);
      } catch {
        setEspConnected(false);
      }
    };
    checkESP();
    const interval = setInterval(checkESP, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real-time device data polling (every 2 seconds)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/device-data");
        const data = await res.json();

        if (data.heartRate !== undefined) {
          setPresentData({
            heartRate: data.heartRate,
            stressLevel: data.stressLevel,
            steps: data.steps || 0,
          });

          setAlertMsg(
            data.stressLevel > 0.75
              ? "⚠️ Stress level is abnormally high! Please relax."
              : null
          );

          // Optionally, save history
          setHistory((prev) => [
            ...prev,
            {
              timestamp: data.timestamp || new Date().toISOString(),
              heartRate: data.heartRate,
              stressLevel: data.stressLevel,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch real-time device data:", err);
      }
    };

    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`app ${theme}`}>
      {/* ===== SIDEBAR ===== */}
      <aside className="sidebar">
        <div className="profile-section">
          <img src={user.avatarUrl} alt="User Avatar" className="avatar" />
          <div className="user-info">
            <h2>{user.name}</h2>
            <p>{user.email}</p>

            {/* ESP32 STATUS */}
            <div className="esp-status-single">
              <span className={`dot ${espConnected ? "green" : "red"}`}></span>{" "}
              {espConnected ? "ESP32 Connected" : "ESP32 Disconnected"}
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: "dashboard", label: "Dashboard" },
            { id: "aiAnalysis", label: "AI Analysis" },
            { id: "history", label: "History" },
            { id: "profile", label: "Profile" },
            { id: "settings", label: "Settings" },
            { id: "help", label: "Help" },
          ].map((tab) => (
            <button
              key={tab.id}
              className={activeTab === tab.id ? "active" : ""}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="logout-container">
          <button className="logout-button" onClick={onBack}>
            Logout
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="main-content">
        <div className="content-wrapper fade-in">
          {activeTab === "dashboard" && (
            <Dashboard
              presentData={presentData}
              espConnected={espConnected}
              alertMsg={alertMsg}
            />
          )}
          {activeTab === "history" && <History history={history} />}
          {activeTab === "profile" && (
            <Profile
              user={user}
              theme={theme}
              onProfileUpdate={(updatedProfile) => {
                setUser({
                  ...user,
                  name: updatedProfile.fullName,
                  email: updatedProfile.email,
                  avatarUrl: updatedProfile.avatar,
                });
              }}
            />
          )}
          {activeTab === "settings" && (
            <Settings theme={theme} setTheme={setTheme} />
          )}
          {activeTab === "help" && <Help />}
          {activeTab === "aiAnalysis" && (
            <AIAnalysis deviceData={presentData} />
          )}
        </div>
      </main>
    </div>
  );
}
