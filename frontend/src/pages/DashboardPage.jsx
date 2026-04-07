import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import WebcamCapture from "../components/WebcamCapture.jsx";
import api from "../api/client";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchMe = async () => {
      const { data } = await api.get("/users/me");
      setProfile(data.user);
    };

    fetchMe().catch(() => setMessage("Failed to fetch profile"));
  }, []);

  const handleFaceRegister = async (imageBase64) => {
    try {
      const { data } = await api.post("/users/register-face", { imageBase64 });
      setMessage(`Face enrolled successfully. Samples: ${data.faceSamples || 1}`);
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        currentUser.faceRegistered = true;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Face enrollment failed");
    }
  };

  return (
    <main className="page-wrap">
      <Navbar />
      <section className="page-grid">
        <article className="card">
          <h2>Welcome {profile?.name || "User"}</h2>
          <p>Email: {profile?.email}</p>
          <p>Role: {profile?.role}</p>
          <p>
            Face status: {profile?.faceRegistered ? "Registered" : "Not Registered"}
          </p>
        </article>
        <article className="card">
          <h3>Register Face Data</h3>
          <p>Capture a clear front-facing image to register your identity.</p>
          <WebcamCapture onCapture={handleFaceRegister} />
          {message && <p className="info-text">{message}</p>}
        </article>
      </section>
    </main>
  );
};

export default DashboardPage;
