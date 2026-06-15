import { useNavigate } from "react-router-dom";
import { FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <div className="auth-card role-card">
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <FaUserGraduate size={60} />
          
          <h1 style={{ marginTop: "10px" }}>EduTrack</h1>

          <p>Select your login type</p>


        </div>

        <button className="role-option" onClick={() => navigate("/faculty-login")}>
          <FaChalkboardTeacher size={28} />
          <span>Faculty Login</span>
        </button>

        <button className="role-option" onClick={() => navigate("/student-login")}>
          <FaUserGraduate size={28} />
          <span>Student Login</span>
        </button>
      </div>
    </div>
  );
}
