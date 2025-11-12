import { useEffect, useState } from "react";
import "./App.css";
import AIAnalysis from "./components/AIAnalysis";
import Dashboard from "./components/Dashboard";
import Help from "./components/Help";
import History from "./components/History";
import Profile from "./components/Profile";
import Settings from "./components/Settings";

const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatarUrl:
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZHvxVgtGqrVGGf2LV8KrkfdEMmudzlVXH_7oxnIvkpy_6y0vdrjPE8wjUYUfQkIM_Q1g&usqp=CAU",
};

const mockHistory = [
  { timestamp: "2025-10-08 14:00", heartRate: 72, stressLevel: 0.3 },
  { timestamp: "2025-10-08 15:00", heartRate: 75, stressLevel: 0.5 },
  { timestamp: "2025-10-08 16:00", heartRate: 70, stressLevel: 0.2 },
  { timestamp: "2025-10-08 17:00", heartRate: 74, stressLevel: 0.6 },
];

export default function App({ onBack }) {
  const [user, setUser] = useState(mockUser);
  const [history] = useState(mockHistory);
  const [espConnected, setEspConnected] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [presentData, setPresentData] = useState({
    heartRate: 72,
    stressLevel: 0.3,
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

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newHeartRate = 65 + Math.floor(Math.random() * 20);
      const newStress = +(Math.random() * 1).toFixed(2);
      setPresentData({ heartRate: newHeartRate, stressLevel: newStress });
      setEspConnected(Math.random() > 0.1);
      setAlertMsg(
        newStress > 0.7
          ? "⚠️ Stress level is abnormally high! Please relax."
          : null
      );
    }, 5000);
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
                // Update sidebar info whenever profile changes
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
