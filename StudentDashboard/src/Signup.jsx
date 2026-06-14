import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaUserPlus } from "react-icons/fa";
import api from "./api";

export default function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "FACULTY",
    secretKey: "",
    course: "",
  });

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await api.post("/auth/signup", formData);

      alert("Account Created Successfully!");

      navigate("/faculty-login");
    } catch (err) {
      alert(
        err.response?.data?.detail ||
        "Signup Failed"
      );
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
          <FaUserPlus size={55} />

          <h1
            style={{
              marginTop: "10px",
            }}
          >
            Create Faculty Account
          </h1>

          <p>
            Faculty registration only. Students must be enrolled by faculty.
          </p>
        </div>

        <form onSubmit={handleSignup}>

          <input
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({
                ...formData,
                name: e.target.value,
              })
            }
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }
            required
          />

          <input
            type="hidden"
            value="FACULTY"
            readOnly
          />

          <input
            type="text"
            placeholder="Faculty Secret Key"
            value={formData.secretKey}
            onChange={(e) =>
              setFormData({
                ...formData,
                secretKey: e.target.value,
              })
            }
            required
          />

          <button type="submit">
            Create Faculty Account
          </button>

        </form>

        <div
          style={{
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <p>
            Already have an account?{" "}
            <Link to="/faculty-login">
              Login
            </Link>
          </p>
        </div>

      </div>

    </div>
  );
}