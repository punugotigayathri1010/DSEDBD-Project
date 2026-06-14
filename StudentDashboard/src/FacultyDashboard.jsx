import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function FacultyDashboard() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    course: "",
    year: 1,
  });

  const [metrics, setMetrics] = useState({
    studentId: "",
    marks: "",
    attendance: "",
  });

  const getStudentId = (student) => student?.id || student?.studentId || student?._id;

  const cleanAttendance = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "object") return cleanAttendance(value.attendance);
    return Number(String(value).replace("%", "")) || 0;
  };

  const cleanMarks = (value) => {
    if (value === null || value === undefined || value === "") return 0;
    if (typeof value === "object") return cleanMarks(value.marks);
    return Number(value) || 0;
  };

  const getSavedStudent = (studentId) => {
    try {
      const saved = JSON.parse(localStorage.getItem("facultyStudentDetails") || "{}");
      return saved[String(studentId)] || {};
    } catch {
      return {};
    }
  };

  const getSavedPerformance = (studentId) => {
    try {
      const saved = JSON.parse(localStorage.getItem("facultyStudentPerformance") || "{}");
      return saved[String(studentId)] || {};
    } catch {
      return {};
    }
  };

  const getStudentName = (student) => {
    const id = getStudentId(student);
    const saved = getSavedStudent(id);
    const directName =
      student?.name ||
      student?.fullName ||
      student?.studentName ||
      student?.userName ||
      student?.username ||
      student?.user?.name ||
      student?.profile?.name ||
      saved?.name;

    if (directName && directName !== "Student" && directName !== "-") return directName;
    return student?.email ? student.email.split("@")[0] : "Student";
  };

  const saveStudentDetails = (student) => {
    const studentId = getStudentId(student);
    if (!studentId) return;

    try {
      const saved = JSON.parse(localStorage.getItem("facultyStudentDetails") || "{}");
      saved[String(studentId)] = {
        ...saved[String(studentId)],
        ...student,
        id: studentId,
        studentId,
        name: getStudentName(student),
      };
      localStorage.setItem("facultyStudentDetails", JSON.stringify(saved));
    } catch {
      // localStorage is only backup storage.
    }
  };

  const savePerformance = (studentId, data) => {
    if (!studentId) return;
    try {
      const saved = JSON.parse(localStorage.getItem("facultyStudentPerformance") || "{}");
      saved[String(studentId)] = { ...saved[String(studentId)], ...data };
      localStorage.setItem("facultyStudentPerformance", JSON.stringify(saved));
    } catch {
      // localStorage is only backup storage.
    }
  };

  const getMarks = (student) => {
    const id = getStudentId(student);
    const saved = getSavedPerformance(id);
    return cleanMarks(saved.marks ?? student?.marks?.marks ?? student?.marks ?? student?.totalMarks ?? 0);
  };

  const getAttendance = (student) => {
    const id = getStudentId(student);
    const saved = getSavedPerformance(id);
    return cleanAttendance(saved.attendance ?? student?.attendance?.attendance ?? student?.attendance ?? 0);
  };

  const syncStudentViewToMongo = async (student, extra = {}) => {
    const studentId = getStudentId(student);
    if (!studentId) return;

    const payload = {
      studentId: Number(studentId),
      name: getStudentName(student),
      email: student?.email || "",
      course: student?.course || "",
      year: Number(student?.year || 1),
      marks: cleanMarks(extra.marks ?? student?.marks ?? 0),
      attendance: cleanAttendance(extra.attendance ?? student?.attendance ?? 0),
    };

    try {
      await api.post("/node/student-view", payload);
    } catch (err) {
      console.warn("MongoDB view sync failed. Start the Node.js backend if using MongoDB view.", err);
    }
  };

  const getMongoStudentView = async (studentId) => {
    try {
      const res = await api.get(`/node/student-view/${studentId}`);
      return res.data || null;
    } catch {
      return null;
    }
  };

  const getSpringMetrics = async (studentId) => {
    try {
      const res = await api.get(`/faculty/student-metrics/${studentId}`);
      return res.data || null;
    } catch {
      return null;
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/faculty/all-students");

      if (Array.isArray(res.data)) {
        const mergedStudents = await Promise.all(
          res.data.map(async (student) => {
            const id = getStudentId(student);
            const savedDetails = getSavedStudent(id);
            const savedPerformance = getSavedPerformance(id);
            const mongoView = await getMongoStudentView(id);

            const merged = {
              ...savedDetails,
              ...student,
              ...mongoView,
              id,
              studentId: id,
              name: getStudentName({ ...savedDetails, ...student, ...mongoView }),
              marks: savedPerformance.marks ?? mongoView?.marks ?? student?.marks,
              attendance: savedPerformance.attendance ?? mongoView?.attendance ?? student?.attendance,
            };

            saveStudentDetails(merged);
            return merged;
          })
        );
        setStudents(mergedStudents);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error(err);
      setStudents([]);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const extractStudentId = (data) => {
    const direct = getStudentId(data);
    if (direct) return direct;
    const text = typeof data === "string" ? data : JSON.stringify(data || "");
    const match = text.match(/Student ID:\s*(\d+)/i) || text.match(/\b(\d+)\b/);
    return match ? match[1] : "";
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    try {
      const addResponse = await api.post("/faculty/add-student", newStudent);
      const createdId = extractStudentId(addResponse.data);

      const addedStudent = {
        ...newStudent,
        id: createdId,
        studentId: createdId,
        marks: 0,
        attendance: 0,
      };

      if (createdId) {
        saveStudentDetails(addedStudent);
        savePerformance(createdId, { marks: 0, attendance: 0 });
        await syncStudentViewToMongo(addedStudent, { marks: 0, attendance: 0 });
      }

      alert("Student enrolled successfully");

      setNewStudent({
        name: "",
        email: "",
        password: "",
        course: "",
        year: 1,
      });

      fetchStudents();
    } catch (err) {
      alert("Failed to add student");
    }
  };

  const handleUpdateMetrics = async (e) => {
    e.preventDefault();

    try {
      await api.put("/faculty/update-metrics", metrics);

      const currentStudent = students.find((student) => String(getStudentId(student)) === String(metrics.studentId));
      const updatedStudent = {
        ...currentStudent,
        marks: cleanMarks(metrics.marks),
        attendance: cleanAttendance(metrics.attendance),
      };

      savePerformance(metrics.studentId, {
        marks: cleanMarks(metrics.marks),
        attendance: cleanAttendance(metrics.attendance),
      });
      saveStudentDetails(updatedStudent);
      await syncStudentViewToMongo(updatedStudent, metrics);

      setStudents((prev) =>
        prev.map((student) =>
          String(getStudentId(student)) === String(metrics.studentId) ? updatedStudent : student
        )
      );

      if (selectedStudent && String(getStudentId(selectedStudent)) === String(metrics.studentId)) {
        setSelectedStudent(updatedStudent);
      }

      alert("Metrics updated successfully");

      setMetrics({
        studentId: "",
        marks: "",
        attendance: "",
      });
    } catch (err) {
      alert("Failed to update metrics");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete student?")) return;

    try {
      await api.delete(`/faculty/delete-student/${id}`);
      try { await api.delete(`/node/student-view/${id}`); } catch {}
      fetchStudents();
      if (selectedStudent && String(getStudentId(selectedStudent)) === String(id)) {
        setSelectedStudent(null);
      }
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleView = async (student) => {
    const studentId = getStudentId(student);
    const saved = getSavedPerformance(studentId);
    const savedDetails = getSavedStudent(studentId);
    const mongoView = await getMongoStudentView(studentId);
    const springMetrics = await getSpringMetrics(studentId);

    const studentWithPerformance = {
      ...savedDetails,
      ...student,
      ...mongoView,
      id: studentId,
      studentId,
      name: getStudentName({ ...savedDetails, ...student, ...mongoView }),
      marks: saved.marks ?? mongoView?.marks ?? springMetrics?.marks ?? student?.marks ?? 0,
      attendance: saved.attendance ?? mongoView?.attendance ?? springMetrics?.attendance ?? student?.attendance ?? 0,
    };

    saveStudentDetails(studentWithPerformance);
    savePerformance(studentId, {
      marks: getMarks(studentWithPerformance),
      attendance: getAttendance(studentWithPerformance),
    });
    await syncStudentViewToMongo(studentWithPerformance, {
      marks: getMarks(studentWithPerformance),
      attendance: getAttendance(studentWithPerformance),
    });

    setSelectedStudent(studentWithPerformance);
    setMetrics({
      studentId,
      marks: getMarks(studentWithPerformance),
      attendance: getAttendance(studentWithPerformance),
    });
    setActiveTab("view");
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="faculty-page">
      <nav className="top-navbar">
        <div className="brand">🎓 EduVerse Faculty Portal</div>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </nav>

      <div className="menu-bar">
        <button className={activeTab === "dashboard" ? "active-menu" : ""} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
        <button className={activeTab === "enroll" ? "active-menu" : ""} onClick={() => setActiveTab("enroll")}>Enroll Student</button>
        <button className={activeTab === "metrics" ? "active-menu" : ""} onClick={() => setActiveTab("metrics")}>Update Metrics</button>
        <button className={activeTab === "students" ? "active-menu" : ""} onClick={() => setActiveTab("students")}>Student Records</button>
        <button className={activeTab === "profile" ? "active-menu" : ""} onClick={() => setActiveTab("profile")}>Profile</button>
      </div>

      <div className="content-area">
        {activeTab === "dashboard" && (
          <>
            <div className="welcome-banner">
              <h1>Welcome Back Faculty 👋</h1>
              <p>Manage students, attendance and academic records.</p>
            </div>
            <div className="stats-grid">
              <div className="stat-card purple"><h3>Total Students</h3><h1>{students.length}</h1></div>
              <div className="stat-card cyan"><h3>Departments</h3><h1>4</h1></div>
              
            </div>
          </>
        )}

        {activeTab === "enroll" && (
          <div className="glass-card">
            <h2>Enroll New Student</h2>
            <p className="helper-text">Students are created by faculty only. Faculty signup is available from Faculty Login.</p>
            <form onSubmit={handleAddStudent}>
              <input type="text" placeholder="Full Name" value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} required />
              <input type="email" placeholder="Email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} required />
              <input type="password" placeholder="Password" value={newStudent.password} onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })} required />
              <input type="text" placeholder="Course" value={newStudent.course} onChange={(e) => setNewStudent({ ...newStudent, course: e.target.value })} required />
              <input type="number" min="1" max="4" placeholder="Year" value={newStudent.year} onChange={(e) => setNewStudent({ ...newStudent, year: parseInt(e.target.value) })} required />
              <button type="submit">Enroll Student</button>
            </form>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="glass-card">
            <h2>Update Academic Metrics</h2>
            <form onSubmit={handleUpdateMetrics}>
              <select value={metrics.studentId} onChange={(e) => setMetrics({ ...metrics, studentId: e.target.value })} required>
                <option value="">Select Student</option>
                {students.map((s) => (
                  <option key={getStudentId(s)} value={getStudentId(s)}>
                    {getStudentName(s)} - ID {getStudentId(s)}
                  </option>
                ))}
              </select>
              <input type="number" placeholder="Marks" value={metrics.marks} onChange={(e) => setMetrics({ ...metrics, marks: parseFloat(e.target.value) })} required />
              <input type="number" placeholder="Attendance" value={metrics.attendance} onChange={(e) => setMetrics({ ...metrics, attendance: parseFloat(e.target.value) })} required />
              <button type="submit">Save Metrics</button>
            </form>
          </div>
        )}

        {activeTab === "students" && (
          <div className="glass-card">
            <h2>Student Records</h2>
            <table className="student-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Course</th>
                  <th>Year</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 && (
                  <tr><td colSpan="5">No students found.</td></tr>
                )}
                {students.map((s) => (
                  <tr key={getStudentId(s)}>
                    <td>{getStudentId(s)}</td>
                    <td>{getStudentName(s)}</td>
                    <td>{s.course || "-"}</td>
                    <td>{s.year || "-"}</td>
                    <td className="action-buttons">
                      <button className="view-btn" onClick={() => handleView(s)}>View</button>
                      <button className="delete-btn" onClick={() => handleDelete(getStudentId(s))}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "view" && selectedStudent && (
          <div className="glass-card">
            <div className="section-header">
              <h2>Student Performance View</h2>
              <button className="small-btn" onClick={() => setActiveTab("students")}>Back</button>
            </div>
            <div className="profile-box">
              <div className="avatar">{getStudentName(selectedStudent)?.charAt(0) || "S"}</div>
              <div>
                <h3>{getStudentName(selectedStudent)}</h3>
                <p>{selectedStudent.email}</p>
                <p>{selectedStudent.course}</p>
              </div>
            </div>
            <br />
            <div className="stats-grid">
              <div className="stat-card purple"><h3>Marks</h3><h1>{getMarks(selectedStudent)}</h1></div>
              <div className="stat-card cyan"><h3>Attendance</h3><h1>{getAttendance(selectedStudent)}%</h1></div>
              <div className="stat-card orange"><h3>Academic Year</h3><h1>{selectedStudent.year || "-"}</h1></div>
            </div>
            <br />
            <button onClick={() => setActiveTab("metrics")}>Update This Student Performance</button>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="glass-card">
            <h2>Faculty Profile</h2>
            <div className="profile-box">
              <div className="avatar">F</div>
              <div>
                <h3>Faculty User</h3>
                <p>Computer Science Department</p>
                <p>Status: Active</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}