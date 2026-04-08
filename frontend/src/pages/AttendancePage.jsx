import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import WebcamCapture from "../components/WebcamCapture.jsx";
import api from "../api/client";

const AttendancePage = () => {
  const [result, setResult] = useState("");
  const [records, setRecords] = useState([]);
  const [isMarking, setIsMarking] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const loadAttendance = async () => {
      const { data } = await api.get("/attendance/me");
      setRecords(data.records || []);
    };

    loadAttendance()
      .catch(() => setResult("Unable to load attendance history"))
      .finally(() => setLoadingHistory(false));
  }, []);

  const todayCount = useMemo(() => {
    const today = new Date().toDateString();
    return records.filter((row) => new Date(row.createdAt).toDateString() === today).length;
  }, [records]);

  const markAttendance = async (imageBase64) => {
    try {
      setIsMarking(true);
      const { data } = await api.post("/attendance/mark", { imageBase64 });
      setResult(
        `Marked for ${data.recognizedUser.name} with confidence ${data.attendance.confidence.toFixed(4)}`
      );
      setRecords((prev) => [data.attendance, ...prev].slice(0, 30));
    } catch (error) {
      setResult(error.response?.data?.message || "Attendance marking failed");
    } finally {
      setIsMarking(false);
    }
  };

  return (
    <main className="page-wrap">
      <Navbar />
      <section className="page-grid">
        <article className="card">
          <h2>Mark Attendance</h2>
          <p>Capture your face for real-time recognition and automatic attendance.</p>
          <WebcamCapture
            onCapture={markAttendance}
            buttonText="Submit Attendance"
            isBusy={isMarking}
          />
          {result && <p className="info-text">{result}</p>}
        </article>
        <article className="card">
          <h3>Your Recent Attendance</h3>
          <p className="muted-text">Total Records: {records.length} | Today: {todayCount}</p>
          {loadingHistory ? (
            <p className="muted-text">Loading your logs...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 && (
                    <tr>
                      <td colSpan="2" className="muted-text">No attendance records yet.</td>
                    </tr>
                  )}
                  {records.map((row) => (
                    <tr key={row._id}>
                      <td>{new Date(row.createdAt).toLocaleString()}</td>
                      <td>{Number(row.confidence || 0).toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>
      </section>
    </main>
  );
};

export default AttendancePage;
