import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import api from "../api/client";

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const { data } = await api.get("/attendance/admin/summary");
      setStats(data.stats);
      setLatest(data.latestAttendance);
    };

    fetchSummary().catch(() => {
      setStats({ totalUsers: 0, totalAttendance: 0, todayAttendance: 0 });
      setLatest([]);
    });
  }, []);

  return (
    <main className="page-wrap">
      <Navbar />
      <section className="page-grid">
        <article className="card">
          <h3>Total Users</h3>
          <p className="metric">{stats?.totalUsers ?? "-"}</p>
        </article>
        <article className="card">
          <h3>Total Attendance</h3>
          <p className="metric">{stats?.totalAttendance ?? "-"}</p>
        </article>
        <article className="card">
          <h3>Today Attendance</h3>
          <p className="metric">{stats?.todayAttendance ?? "-"}</p>
        </article>
      </section>
      <section className="card">
        <h3>Latest Logs</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Time</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((row) => (
                <tr key={row._id}>
                  <td>{row.user?.name || "Unknown"}</td>
                  <td>{row.user?.email || "-"}</td>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>{row.confidence?.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default AdminPage;
