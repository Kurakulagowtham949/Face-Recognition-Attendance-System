import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="nav-wrap">
      <div className="nav-brand">
        <h1>Face Attendance</h1>
        {user?.name && <p className="muted-text">Signed in as {user.name}</p>}
      </div>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/attendance">Mark Attendance</Link>
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        <button
          type="button"
          className="secondary-btn"
          onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
        >
          {theme === "light" ? "Dark" : "Light"} Theme
        </button>
        <button onClick={onLogout}>Logout</button>
      </nav>
    </header>
  );
};

export default Navbar;
