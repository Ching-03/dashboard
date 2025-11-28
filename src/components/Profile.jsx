import axios from "axios";
import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile({ user, theme = "dark", onProfileUpdate }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newGoalText, setNewGoalText] = useState("");
  const userId = user?.id || 1; // Make sure this comes from your auth system

  // -------------------------------
  // Fetch profile from backend
  // -------------------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/profile/${userId}`);
        const data = res.data;
        setProfile({
          fullName: data.full_name || "",
          email: data.email || "",
          avatar: data.avatar || "",
          phone: data.phone || "",
          birthDate: data.birth_date || "",
          location: data.location || "",
          bloodType: data.blood_type || "",
          height: data.height || "",
          weight: data.weight || "",
          emergencyContact: data.emergency_contact || "",
          conditions: data.conditions || [],
          goals: data.goals || [],
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        alert("❌ Failed to load profile from backend.");
      }
    };
    fetchProfile();
  }, [userId]);

  // -------------------------------
  // Input handlers
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((p) => ({ ...p, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddCondition = () => {
    if (!newCondition.trim()) return;
    setProfile((p) => ({
      ...p,
      conditions: [...(p.conditions || []), newCondition.trim()],
    }));
    setNewCondition("");
  };

  const handleRemoveCondition = (i) => {
    setProfile((p) => ({
      ...p,
      conditions: p.conditions.filter((_, idx) => idx !== i),
    }));
  };

  const handleAddGoal = () => {
    if (!newGoalText.trim()) return;
    setProfile((p) => ({
      ...p,
      goals: [...(p.goals || []), { text: newGoalText.trim(), progress: 0 }],
    }));
    setNewGoalText("");
  };

  const handleRemoveGoal = (i) => {
    setProfile((p) => ({
      ...p,
      goals: p.goals.filter((_, idx) => idx !== i),
    }));
  };

  const handleGoalProgressChange = (i, value) => {
    const v = Math.max(0, Math.min(100, Number(value) || 0));
    setProfile((p) => {
      const goals = [...(p.goals || [])];
      goals[i] = { ...goals[i], progress: v };
      return { ...p, goals };
    });
  };

  // -------------------------------
  // Save profile to backend
  // -------------------------------
  const handleSave = async () => {
    if (!profile) return;
    try {
      const payload = {
        full_name: profile.fullName,
        email: profile.email,
        phone: profile.phone,
        birth_date: profile.birthDate,
        location: profile.location,
        blood_type: profile.bloodType,
        height: profile.height,
        weight: profile.weight,
        emergency_contact: profile.emergencyContact,
        avatar: profile.avatar,
        conditions: profile.conditions,
        goals: profile.goals,
      };

      await axios.put(`http://localhost:5000/api/profile/${userId}`, payload);

      alert("✅ Profile saved successfully to database!");
      setEditing(false);

      if (onProfileUpdate) {
        onProfileUpdate({
          fullName: profile.fullName,
          email: profile.email,
          avatar: profile.avatar,
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("❌ Failed to save profile. Check backend connection.");
    }
  };

  // -------------------------------
  // Loading state
  // -------------------------------
  if (!profile) {
    return (
      <div className={`profile-page ${theme}`}>
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  // -------------------------------
  // Render
  // -------------------------------
  return (
    <div className={`profile-page ${theme}`}>
      {/* Header */}
      <div className="profile-header">
        <div>
          <h2>Profile</h2>
          <p>Manage your personal and health information</p>
        </div>
        <div className="header-actions">
          <button
            className="edit-btn"
            onClick={() => (editing ? handleSave() : setEditing(true))}
          >
            {editing ? "Save Changes" : "Edit Profile"}
          </button>
          {editing && (
            <button className="cancel-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Profile content */}
      <div className="profile-container">
        {/* Left panel */}
        <aside className="left-panel card">
          <div className="avatar-block">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="avatar-img" />
            ) : (
              <div className="circle">{(profile.fullName || "U").charAt(0)}</div>
            )}
            {editing && (
              <label className="upload-btn">
                Change Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
            )}
          </div>

          <h3 className="name">{profile.fullName || "New User"}</h3>
          <p className="email-text">{profile.email}</p>

          <div className="badges">
            <span className="badge green">Active User</span>
            <span className="badge blue">Premium</span>
          </div>

          <div className="left-info">
            <p>📍 {profile.location || "No location"}</p>
            <p>🎂 {profile.birthDate || "No birthdate"}</p>
          </div>
        </aside>

        {/* Right panel */}
        <main className="right-panel">
          {/* Personal info */}
          <section className="section card">
            <h3>Personal Information</h3>
            <div className="input-grid">
              {["fullName", "email", "phone", "birthDate", "location"].map((field) => (
                <div key={field} className="input-group">
                  <label>
                    {field === "fullName"
                      ? "Full Name"
                      : field === "email"
                      ? "Email Address"
                      : field === "phone"
                      ? "Phone Number"
                      : field === "birthDate"
                      ? "Date of Birth"
                      : "Location"}
                  </label>
                  <input
                    name={field}
                    type={field === "email" ? "email" : field === "birthDate" ? "date" : "text"}
                    value={profile[field]}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Medical info */}
          <section className="section card">
            <h3>Medical Information</h3>
            <div className="medical-grid">
              {["bloodType", "height", "weight", "emergencyContact"].map((field, i) => (
                <div key={i} className="med-card">
                  <div className="med-title">{field.replace(/([A-Z])/g, " $1")}</div>
                  <input
                    name={field}
                    value={profile[field]}
                    onChange={handleChange}
                    disabled={!editing}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Goals */}
          <section className="section card">
            <h3>Health Goals</h3>
            <div className="goals-list">
              {profile.goals.map((g, i) => (
                <div key={i} className="goal-row">
                  <div className="goal-text">{g.text}</div>
                  <div className="goal-bar-row">
                    <div className="goal-bar">
                      <div className="goal-progress" style={{ width: `${g.progress}%` }} />
                    </div>
                    <div className="goal-percent">{g.progress}%</div>
                  </div>
                  {editing && (
                    <div className="goal-edit-row">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={g.progress}
                        onChange={(e) => handleGoalProgressChange(i, e.target.value)}
                      />
                      <button className="remove-goal" onClick={() => handleRemoveGoal(i)}>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {editing && (
                <div className="add-goal-row">
                  <input
                    placeholder="New goal text..."
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                  />
                  <button onClick={handleAddGoal}>Add Goal</button>
                </div>
              )}
            </div>
          </section>

          {/* Conditions */}
          <section className="section card">
            <h3>Health Conditions</h3>
            <ul className="condition-list">
              {profile.conditions.map((c, i) => (
                <li key={i}>
                  {c}
                  {editing && (
                    <button className="small-x" onClick={() => handleRemoveCondition(i)}>
                      ✖
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {editing && (
              <div className="input-row">
                <input
                  placeholder="Add condition..."
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                />
                <button onClick={handleAddCondition}>Add</button>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
