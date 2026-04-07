import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import WebcamCapture from "../components/WebcamCapture.jsx";
import api from "../api/client";

const AttendancePage = () => {
  const [result, setResult] = useState("");

  const markAttendance = async (imageBase64) => {
    try {
      const { data } = await api.post("/attendance/mark", { imageBase64 });
      setResult(
        `Marked for ${data.recognizedUser.name} with confidence ${data.attendance.confidence.toFixed(4)}`
      );
    } catch (error) {
      setResult(error.response?.data?.message || "Attendance marking failed");
    }
  };

  return (
    <main className="page-wrap">
      <Navbar />
      <section className="card">
        <h2>Mark Attendance</h2>
        <p>Capture your face for real-time recognition and automatic attendance.</p>
        <WebcamCapture onCapture={markAttendance} />
        {result && <p className="info-text">{result}</p>}
      </section>
    </main>
  );
};

export default AttendancePage;
