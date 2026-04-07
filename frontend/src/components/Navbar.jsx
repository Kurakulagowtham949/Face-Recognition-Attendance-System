import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="nav-wrap">
      <h1>Face Attendance</h1>
      <nav>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/attendance">Mark Attendance</Link>
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        <button onClick={onLogout}>Logout</button>
      </nav>
    </header>
  );
};

export default Navbar;
