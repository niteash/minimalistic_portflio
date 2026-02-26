import { useState } from "react";
import axios from "axios";

export default function SOS() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const sendSOS = () => {
    if (!navigator.geolocation) {
      setMessage("Geolocation not supported");
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await axios.post("http://localhost:5001/api/sos", {
            studentId: "student123",
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          setMessage("SOS Sent Successfully ✅");
        } catch (err) {
          setMessage("Error sending SOS ❌");
        }

        setLoading(false);
      },
      () => {
        setMessage("Location permission denied");
        setLoading(false);
      },
    );
  };

  return (
    <div style={{ padding: "40px" }}>
      <h1>Emergency SOS</h1>

      <button
        onClick={sendSOS}
        style={{
          background: "red",
          color: "white",
          padding: "15px 30px",
          fontSize: "18px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        {loading ? "Sending..." : "SEND SOS"}
      </button>

      <p>{message}</p>
    </div>
  );
}
