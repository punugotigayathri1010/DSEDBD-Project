import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/student_dashboard_views";

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"], credentials: true }));
app.use(express.json());

const studentViewSchema = new mongoose.Schema(
  {
    studentId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, default: "Student" },
    email: { type: String, default: "" },
    course: { type: String, default: "" },
    year: { type: Number, default: 1 },
    marks: { type: Number, default: 0 },
    attendance: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const StudentView = mongoose.model("StudentView", studentViewSchema);

const normalizePayload = (body) => ({
  studentId: Number(body.studentId),
  name: body.name || "Student",
  email: body.email || "",
  course: body.course || "",
  year: Number(body.year || 1),
  marks: Number(body.marks || 0),
  attendance: Number(String(body.attendance || 0).replace("%", ""))
});

app.get("/", (req, res) => {
  res.json({ status: "Node.js MongoDB backend is running" });
});

app.get("/api/student-view/:studentId", async (req, res) => 
  
  {
  try
  
  {
    const data = await StudentView.findOne({ studentId: Number(req.params.studentId) }).lean();
    if (!data) return res.status(404).json({ message: "Student view not found" });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/student-view", async (req, res) => {
  try {
    const data = await StudentView.find().sort({ studentId: 1 }).lean();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/student-view", async (req, res) => {
  try {
    const payload = normalizePayload(req.body);
    if (!payload.studentId) return res.status(400).json({ message: "studentId is required" });

    const updated = await StudentView.findOneAndUpdate(
      { studentId: payload.studentId },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    res.status(201).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/api/student-view/:studentId", async (req, res) => {
  try {
    const payload = normalizePayload({ ...req.body, studentId: req.params.studentId });
    const updated = await StudentView.findOneAndUpdate(
      { studentId: payload.studentId },
      { $set: payload },
      { new: true, upsert: true, runValidators: true }
    ).lean();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.delete("/api/student-view/:studentId", async (req, res) => {
  try {
    await StudentView.deleteOne({ studentId: Number(req.params.studentId) });
    res.json({ message: "Student view deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Node backend running on http://localhost:${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  });
