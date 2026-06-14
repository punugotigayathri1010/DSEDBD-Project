import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [marks, setMarks] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard");

  const navigate = useNavigate();

  useEffect(() => {
    api.get("/student/profile").then((r) => setProfile(r.data));
    api.get("/student/marks").then((r) => setMarks(r.data));
    api.get("/student/attendance").then((r) => setAttendance(r.data));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!profile) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>Loading Student Portal...</h2>
      </div>
    );
  }

  return (
    <div className="faculty-page">

      <nav className="top-navbar">
        <div className="brand">
          🎓 EduVerse Student Portal
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </nav>

      <div className="menu-bar">

        <button
          className={activeTab === "dashboard" ? "active-menu" : ""}
          onClick={() => setActiveTab("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={activeTab === "academics" ? "active-menu" : ""}
          onClick={() => setActiveTab("academics")}
        >
          Academics
        </button>

        <button
          className={activeTab === "attendance" ? "active-menu" : ""}
          onClick={() => setActiveTab("attendance")}
        >
          Attendance
        </button>

        <button
          className={activeTab === "profile" ? "active-menu" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

      </div>

      <div className="content-area">

        {activeTab === "dashboard" && (
          <>
            <div className="welcome-banner">
              <h1>Welcome Back, {profile.name} 👋</h1>
              <p>
                Track your academic progress and stay updated.
              </p>
            </div>

            <div className="stats-grid">

              <div className="stat-card purple">
                <h3>Total Marks</h3>
                <h1>{marks?.marks || 0}</h1>
              </div>

              <div className="stat-card cyan">
                <h3>Attendance</h3>
                <h1>{String(attendance?.attendance || 0).replace("%", "")}%</h1>
              </div>

              <div className="stat-card orange">
                <h3>Academic Year</h3>
                <h1>{profile.year}</h1>
              </div>

            </div>
          </>
        )}

        {activeTab === "academics" && (
          <div className="glass-card">

            <h2>Academic Performance</h2>

            <br />

            <div className="stats-grid">

              <div className="stat-card purple">
                <h3>Marks Obtained</h3>
                <h1>{marks?.marks || 0}</h1>
              </div>

              <div className="stat-card cyan">
                <h3>Course</h3>
                <h1>{profile.course}</h1>
              </div>

            </div>

          </div>
        )}

        {activeTab === "attendance" && (
          <div className="glass-card">

            <h2>Attendance Record</h2>

            <br />

            <div className="stat-card cyan">
              <h3>Current Attendance</h3>
              <h1>{String(attendance?.attendance || 0).replace("%", "")}%</h1>
            </div>

          </div>
        )}

        {activeTab === "profile" && (
          <div className="glass-card">

            <h2>Student Profile</h2>

            <br />

            <div className="profile-box">

              <div className="avatar">
                {profile.name?.charAt(0)}
              </div>

              <div>

                <h3>{profile.name}</h3>

                <p>
                  {profile.email}
                </p>

                <p>
                  {profile.course}
                </p>

              </div>

            </div>

            <br />

            <p>
              <strong>ID:</strong> {profile.studentId}
            </p>

            <p>
              <strong>Course:</strong> {profile.course}
            </p>

            <p>
              <strong>Year:</strong> {profile.year}
            </p>

          </div>
        )}

      </div>

    </div>
  );
}