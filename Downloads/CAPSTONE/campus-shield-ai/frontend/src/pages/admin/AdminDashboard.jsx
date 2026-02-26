import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import SOSMap from "../../components/map/SOSMap";

const socket = io("http://localhost:5001");

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [emergency, setEmergency] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/siren.ogg");
  }, []);

  const playAlarm = () => {
    audioRef.current?.play().catch(() => {});
  };

  const stopAlarm = () => {
    audioRef.current?.pause();
    audioRef.current.currentTime = 0;
  };

  useEffect(() => {
    loadAlerts();

    socket.on("newSOS", (alert) => {
      playAlarm();

      setAlerts((prev) => [alert, ...prev]);

      setEmergency(true);

      setTimeout(() => setEmergency(false), 5000);
    });

    socket.on("alertsCleared", () => {
      setAlerts([]);
      stopAlarm();
    });

    return () => {
      socket.off("newSOS");
      socket.off("alertsCleared");
    };
  }, []);

  const loadAlerts = async () => {
    const res = await axios.get("http://localhost:5001/api/sos");
    setAlerts(res.data);
  };

  const clearAlerts = async () => {
    if (!window.confirm("Clear alerts?")) return;

    await axios.delete("http://localhost:5001/api/sos");

    setAlerts([]);

    stopAlarm();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2>Admin Emergency Dashboard</h2>
          <div>{alerts.length} Active Alerts</div>
        </div>

        <div>
          <button onClick={stopAlarm}>Stop Alarm</button>
          <button onClick={clearAlerts}>Clear Alerts</button>
        </div>
      </div>

      {emergency && <div style={styles.emergency}>NEW EMERGENCY ALERT</div>}

      <div style={styles.map}>
        <SOSMap alerts={alerts} />
      </div>

      <div style={styles.grid}>
        {alerts.map((alert) => (
          <div key={alert._id} style={styles.card}>
            <div>Student: {alert.studentId}</div>

            <div>
              Location:
              {alert.latitude.toFixed(5)},{alert.longitude.toFixed(5)}
            </div>

            <div>
              Time:
              {new Date(alert.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: {
    width: "100%",
    padding: "0",
    margin: "0",
    fontFamily: "system-ui",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
  },

  emergency: {
    background: "red",
    color: "white",
    padding: "10px",
  },

  map: {
    width: "100%",
    height: "400px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
    gap: "10px",
    padding: "10px",
  },

  card: {
    border: "1px solid #ccc",
    padding: "10px",
  },
};
