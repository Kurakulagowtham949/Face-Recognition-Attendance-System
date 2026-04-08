import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import api from "../api/client";

const AdminPage = () => {
  const [stats, setStats] = useState(null);
  const [latest, setLatest] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSummary = async () => {
    const { data } = await api.get("/attendance/admin/summary");
    setStats(data.stats);
    setLatest(data.latestAttendance);
  };

  useEffect(() => {
    fetchSummary()
      .catch(() => {
        setError("Failed to load admin summary");
        setStats({ totalUsers: 0, totalAttendance: 0, todayAttendance: 0 });
        setLatest([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredLatest = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) {
      return latest;
    }

    return latest.filter((row) => {
      const name = row.user?.name?.toLowerCase() || "";
      const email = row.user?.email?.toLowerCase() || "";
      return name.includes(keyword) || email.includes(keyword);
    });
  }, [latest, searchTerm]);

  const exportCsv = () => {
    if (filteredLatest.length === 0) {
      return;
    }

    const rows = filteredLatest.map((row) => [
      row.user?.name || "Unknown",
      row.user?.email || "-",
      new Date(row.createdAt).toISOString(),
      Number(row.confidence || 0).toFixed(4)
    ]);

    const csv = ["Name,Email,Time,Confidence", ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `attendance_logs_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page-wrap">
      <Navbar />
      <section className="page-grid">
        <article className="card">
          <h3>Total Users</h3>
          <p className="metric">{loading ? "..." : stats?.totalUsers ?? "-"}</p>
        </article>
        <article className="card">
          <h3>Total Attendance</h3>
          <p className="metric">{loading ? "..." : stats?.totalAttendance ?? "-"}</p>
        </article>
        <article className="card">
          <h3>Today Attendance</h3>
          <p className="metric">{loading ? "..." : stats?.todayAttendance ?? "-"}</p>
        </article>
      </section>
      <section className="card">
        <div className="section-head">
          <h3>Latest Logs</h3>
          <div className="row-actions">
            <button type="button" className="secondary-btn" onClick={exportCsv}>Export CSV</button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                setLoading(true);
                setError("");
                fetchSummary()
                  .catch(() => setError("Failed to refresh admin summary"))
                  .finally(() => setLoading(false));
              }}
            >
              Refresh
            </button>
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {error && <p className="error-text">{error}</p>}
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
              {filteredLatest.length === 0 && (
                <tr>
                  <td colSpan="4" className="muted-text">No logs found for this filter.</td>
                </tr>
              )}
              {filteredLatest.map((row) => (
                <tr key={row._id}>
                  <td>{row.user?.name || "Unknown"}</td>
                  <td>{row.user?.email || "-"}</td>
                  <td>{new Date(row.createdAt).toLocaleString()}</td>
                  <td>{Number(row.confidence || 0).toFixed(4)}</td>
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
