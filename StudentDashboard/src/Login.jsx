import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserGraduate } from "react-icons/fa";
import api from "./api";

export default function Login({ expectedRole, title = "Login" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/signin", {
        username: email,
        password,
      });

      const token =
        response.data.access_token ||
        response.data.token ||
        response.data.jwt;

      const role =
        response.data.role ||
        response.data.userRole;

      if (expectedRole && role !== expectedRole) {
        alert(`Please use the ${role === "FACULTY" ? "Faculty" : "Student"} login option.`);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      navigate(
        role === "FACULTY"
          ? "/faculty"
          : "/student"
      );
    } catch (err) {
      alert("Invalid Email or Password");
    }
  };

  return (
    <div className="auth-container">

      <div className="auth-card">

        <div
          style={{
            textAlign: "center",
            marginBottom: "25px",
          }}
        >
          <FaUserGraduate
            size={60}
          />

          <h1
            style={{
              marginTop: "10px",
            }}
          >
            {title}
          </h1>

          <p>
            EduTrack Student Management System
          </p>
        </div>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            required
          />

          <button type="submit">
            Sign In
          </button>

        </form>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          {expectedRole === "FACULTY" && (
            <p>
              New faculty? {" "}
              <Link to="/signup">
                Create faculty account
              </Link>
            </p>
          )}

          <p>
            <Link to="/">
              Back to login options
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}