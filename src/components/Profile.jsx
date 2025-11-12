import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile({ user, theme = "dark" }) {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newGoalText, setNewGoalText] = useState("");

  // ✅ Load from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  // ✅ Fetch profile from backend
  useEffect(() => {
    const emailToLoad =
      user?.email || JSON.parse(localStorage.getItem("userProfile"))?.email;
    if (!emailToLoad) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/profile/${encodeURIComponent(emailToLoad)}`
        );
        const data = await res.json();

        if (res.ok) {
          const loadedProfile = {
            id: data.id,
            fullName: data.full_name || "",
            email: data.email || "",
            phone: data.phone || "",
            birthDate: data.birth_date || "",
            location: data.location || "",
            bloodType: data.blood_type || "",
            height: data.height || "",
            weight: data.weight || "",
            emergencyContact: data.emergency_contact || "",
            avatar: data.avatar || "",
            conditions: Array.isArray(data.conditions) ? data.conditions : [],
            goals: Array.isArray(data.goals) ? data.goals : [],
          };

          setProfile(loadedProfile);
          localStorage.setItem("userProfile", JSON.stringify(loadedProfile));
        } else {
          console.error("Failed to load profile:", data);
        }
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };

    fetchProfile();
  }, [user?.email]);

  // ✅ Handlers
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

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Save error");

      alert("✅ Profile saved successfully!");
      localStorage.setItem("userProfile", JSON.stringify(profile));
      setEditing(false);
    } catch (err) {
      alert("❌ Error saving profile: " + err.message);
    }
  };

  if (!profile)
    return (
      <div className={`profile-page ${theme}`}>
        <div className="loading">Loading profile...</div>
      </div>
    );

  return (
    <div className={`profile-page ${theme}`}>
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

      <div className="profile-container">
        {/* Left Panel */}
        <aside className="left-panel card">
          <div className="avatar-block">
            {profile.avatar ? (
              <img src={profile.avatar} alt="avatar" className="avatar-img" />
            ) : (
              <div className="circle">
                {(profile.fullName || "U").charAt(0)}
              </div>
            )}

            {editing && (
              <label className="upload-btn">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  hidden
                />
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

        {/* Right Panel */}
        <main className="right-panel">
          {/* Personal Info */}
          <section className="section card">
            <h3>Personal Information</h3>
            <div className="input-grid">
              <div className="input-group">
                <label>Full Name</label>
                <input
                  name="fullName"
                  value={profile.fullName}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="input-group">
                <label>Date of Birth</label>
                <input
                  name="birthDate"
                  type="date"
                  value={profile.birthDate}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>

              <div className="input-group full-width">
                <label>Location</label>
                <input
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  disabled={!editing}
                />
              </div>
            </div>
          </section>

          {/* Medical Info */}
          <section className="section card">
            <h3>Medical Information</h3>
            <div className="medical-grid">
              {["bloodType", "height", "weight", "emergencyContact"].map(
                (field, i) => (
                  <div key={i} className="med-card">
                    <div className="med-title">
                      {field.replace(/([A-Z])/g, " $1")}
                    </div>
                    <input
                      name={field}
                      value={profile[field]}
                      onChange={handleChange}
                      disabled={!editing}
                    />
                  </div>
                )
              )}
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
                      <div
                        className="goal-progress"
                        style={{ width: `${g.progress}%` }}
                      />
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
                        onChange={(e) =>
                          handleGoalProgressChange(i, e.target.value)
                        }
                      />
                      <button
                        className="remove-goal"
                        onClick={() => handleRemoveGoal(i)}
                      >
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
                    <button
                      className="small-x"
                      onClick={() => handleRemoveCondition(i)}
                    >
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
