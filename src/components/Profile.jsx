<<<<<<< Updated upstream
import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile({ user, handleProfileChange, theme }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("profileData");
    return (
      JSON.parse(saved) || {
        fullName: user?.name || "John Doe",
        email: user?.email || "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        birthDate: "1990-05-15",
        location: "San Francisco, CA",
        bloodType: "O+",
        height: "5'10\"",
        weight: "165 lbs",
        emergencyContact: "Jane Doe - +1 (555) 987-6543",
        avatar: user?.avatarUrl || "",
        conditions: ["Hypertension", "Asthma"],
        goals: [
          { text: "Exercise daily", progress: 70 },
          { text: "Maintain healthy diet", progress: 50 },
        ],
      }
    );
  });

  const [editing, setEditing] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    localStorage.setItem("profileData", JSON.stringify(profile));
    handleProfileChange?.({
      target: { name: "name", value: profile.fullName },
    });
  }, [profile, handleProfileChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (editing) alert("✅ Profile saved successfully!");
    setEditing(!editing);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProfile((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setProfile((prev) => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()],
      }));
      setNewCondition("");
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setProfile((prev) => ({
        ...prev,
        goals: [...prev.goals, { text: newGoal.trim(), progress: 0 }],
      }));
      setNewGoal("");
    }
  };

  const handleRemoveCondition = (i) => {
    setProfile((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, idx) => idx !== i),
    }));
  };

  const handleRemoveGoal = (i) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, idx) => idx !== i),
    }));
  };

  return (
    <div className={`profile-page ${theme}`}>
      <div className="profile-header">
        <div>
          <h2>Profile</h2>
          <p>Manage your personal and health information</p>
        </div>
        <button className="edit-btn" onClick={handleEditToggle}>
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-container">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="avatar-img" />
            ) : (
              <div className="circle">{profile.fullName.charAt(0)}</div>
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
            <h3>{profile.fullName}</h3>
          </div>

          <div className="info">
            <p>{profile.email}</p>
            <p>📍 {profile.location}</p>
            <p>🎂 {profile.birthDate}</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="section">
            <h4>Personal Information</h4>
            <div className="input-grid">
              {["fullName", "email", "phone", "birthDate", "location"].map(
                (field) => (
                  <div key={field} className="input-group">
                    <label>
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      name={field}
                      value={profile[field]}
                      onChange={handleChange}
                      disabled={!editing}
                      type={field === "birthDate" ? "date" : "text"}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="section">
            <h4>Medical Information</h4>
            <div className="input-grid">
              {["bloodType", "height", "weight", "emergencyContact"].map(
                (field) => (
                  <div key={field} className="input-group">
                    <label>
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
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
          </div>

          <div className="section">
            <h4>Health Conditions</h4>
            <ul className="condition-list">
              {profile.conditions.map((cond, i) => (
                <li key={i}>
                  {cond}
                  {editing && (
                    <button onClick={() => handleRemoveCondition(i)}>✖</button>
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
          </div>

          <div className="section">
            <h4>Health Goals</h4>
            {profile.goals.map((goal, i) => (
              <div key={i} className="goal">
                <div className="goal-header">
                  <span>{goal.text}</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="goal-bar">
                  <div
                    className="goal-progress"
                    style={{
                      width: `${goal.progress}%`,
                      background:
                        goal.progress > 80
                          ? "#16a34a"
                          : goal.progress > 50
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  />
                </div>
                {editing && (
                  <button
                    className="remove-goal"
                    onClick={() => handleRemoveGoal(i)}
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <div className="input-row">
                <input
                  placeholder="Add new goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                />
                <button onClick={handleAddGoal}>Add</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
=======
import { useEffect, useState } from "react";
import "./Profile.css";

export default function Profile({ user, handleProfileChange, theme }) {
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("profileData");
    return (
      JSON.parse(saved) || {
        fullName: user?.name || "John Doe",
        email: user?.email || "j ohn.doe@example.com",
        phone: "+1 (555) 123-4567",
        birthDate: "1990-05-15",
        location: "San Francisco, CA",
        bloodType: "O+",
        height: "5'10\"",
        weight: "165 lbs",
        emergencyContact: "Jane Doe - +1 (555) 987-6543",
        avatar: user?.avatarUrl || "",
        conditions: ["Hypertension", "Asthma"],
        goals: [
          { text: "Exercise daily", progress: 70 },
          { text: "Maintain healthy diet", progress: 50 },
        ],
      }
    );
  });

  const [editing, setEditing] = useState(false);
  const [newCondition, setNewCondition] = useState("");
  const [newGoal, setNewGoal] = useState("");

  useEffect(() => {
    localStorage.setItem("profileData", JSON.stringify(profile));
    handleProfileChange?.({
      target: { name: "name", value: profile.fullName },
    });
  }, [profile, handleProfileChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (editing) alert("✅ Profile saved successfully!");
    setEditing(!editing);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProfile((prev) => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleAddCondition = () => {
    if (newCondition.trim()) {
      setProfile((prev) => ({
        ...prev,
        conditions: [...prev.conditions, newCondition.trim()],
      }));
      setNewCondition("");
    }
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      setProfile((prev) => ({
        ...prev,
        goals: [...prev.goals, { text: newGoal.trim(), progress: 0 }],
      }));
      setNewGoal("");
    }
  };

  const handleRemoveCondition = (i) => {
    setProfile((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, idx) => idx !== i),
    }));
  };

  const handleRemoveGoal = (i) => {
    setProfile((prev) => ({
      ...prev,
      goals: prev.goals.filter((_, idx) => idx !== i),
    }));
  };

  return (
    <div className={`profile-page ${theme}`}>
      <div className="profile-header">
        <div>
          <h2>Profile</h2>
          <p>Manage your personal and health information</p>
        </div>
        <button className="edit-btn" onClick={handleEditToggle}>
          {editing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="profile-container">
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="Profile" className="avatar-img" />
            ) : (
              <div className="circle">{profile.fullName.charAt(0)}</div>
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
            <h3>{profile.fullName}</h3>
            <p>{profile.email}</p>
          </div>

          <div className="info">
            <p>📍 {profile.location}</p>
            <p>🎂 {profile.birthDate}</p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="section">
            <h4>Personal Information</h4>
            <div className="input-grid">
              {["fullName", "email", "phone", "birthDate", "location"].map(
                (field) => (
                  <div key={field} className="input-group">
                    <label>
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
                    <input
                      name={field}
                      value={profile[field]}
                      onChange={handleChange}
                      disabled={!editing}
                      type={field === "birthDate" ? "date" : "text"}
                    />
                  </div>
                )
              )}
            </div>
          </div>

          <div className="section">
            <h4>Medical Information</h4>
            <div className="input-grid">
              {["bloodType", "height", "weight", "emergencyContact"].map(
                (field) => (
                  <div key={field} className="input-group">
                    <label>
                      {field.charAt(0).toUpperCase() +
                        field.slice(1).replace(/([A-Z])/g, " $1")}
                    </label>
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
          </div>

          <div className="section">
            <h4>Health Conditions</h4>
            <ul className="condition-list">
              {profile.conditions.map((cond, i) => (
                <li key={i}>
                  {cond}
                  {editing && (
                    <button onClick={() => handleRemoveCondition(i)}>✖</button>
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
          </div>

          <div className="section">
            <h4>Health Goals</h4>
            {profile.goals.map((goal, i) => (
              <div key={i} className="goal">
                <div className="goal-header">
                  <span>{goal.text}</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="goal-bar">
                  <div
                    className="goal-progress"
                    style={{
                      width: `${goal.progress}%`,
                      background:
                        goal.progress > 80
                          ? "#16a34a"
                          : goal.progress > 50
                          ? "#eab308"
                          : "#ef4444",
                    }}
                  />
                </div>
                {editing && (
                  <button
                    className="remove-goal"
                    onClick={() => handleRemoveGoal(i)}
                  >
                    ✖
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <div className="input-row">
                <input
                  placeholder="Add new goal..."
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                />
                <button onClick={handleAddGoal}>Add</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
>>>>>>> Stashed changes
