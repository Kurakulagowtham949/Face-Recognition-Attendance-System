import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import WebcamCapture from "../components/WebcamCapture.jsx";
import api from "../api/client";

const DashboardPage = () => {
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      const { data } = await api.get("/users/me");
      setProfile(data.user);
    };

    fetchMe()
      .catch(() => setMessage("Failed to fetch profile"))
      .finally(() => setLoadingProfile(false));
  }, []);

  const handleFaceRegister = async (imageBase64) => {
    try {
      setIsSubmitting(true);
      const { data } = await api.post("/users/register-face", { imageBase64 });
      setMessage(`Face enrolled successfully. Samples: ${data.faceSamples || 1}`);
      setProfile((prev) => (prev ? { ...prev, faceRegistered: true } : prev));
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      if (currentUser) {
        currentUser.faceRegistered = true;
        localStorage.setItem("user", JSON.stringify(currentUser));
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Face enrollment failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="page-wrap">
      <Navbar />
      <section className="page-grid">
        <article className="card">
          <h2>Welcome {profile?.name || "User"}</h2>
          {loadingProfile ? (
            <p className="muted-text">Loading profile...</p>
          ) : (
            <>
              <p>Email: {profile?.email}</p>
              <p>Role: {profile?.role}</p>
              <p>
                Face status: {profile?.faceRegistered ? "Registered" : "Not Registered"}
              </p>
            </>
          )}
        </article>
        <article className="card">
          <h3>Register Face Data</h3>
          <p>Capture a clear front-facing image to register your identity.</p>
          <WebcamCapture
            onCapture={handleFaceRegister}
            buttonText="Register Face"
            isBusy={isSubmitting}
          />
          {message && <p className="info-text">{message}</p>}
        </article>
      </section>
    </main>
  );
};

export default DashboardPage;
