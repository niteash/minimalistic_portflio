import { useState } from "react";
import axios from "axios";

export default function SOSPage() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const sendSOS = () => {
    if (!navigator.geolocation) {
      setStatus("Geolocation not supported");
      return;
    }

    setLoading(true);
    setStatus("Getting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await axios.post("http://localhost:5001/api/sos", {
            studentId: "student123", // later use real login ID
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setStatus("SOS sent successfully");
          setLoading(false);
        } catch (error) {
          setStatus("Failed to send SOS");
          setLoading(false);
        }
      },

      () => {
        setStatus("Location permission denied");
        setLoading(false);
      },
    );
  };

  return (
    <div style={styles.container}>
      <h1>Emergency SOS</h1>

      <button onClick={sendSOS} disabled={loading} style={styles.sosButton}>
        {loading ? "Sending..." : "SEND SOS"}
      </button>

      <p>{status}</p>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "system-ui",
  },

  sosButton: {
    background: "red",
    color: "white",
    border: "none",
    padding: "20px 40px",
    fontSize: "20px",
    cursor: "pointer",
  },
};
