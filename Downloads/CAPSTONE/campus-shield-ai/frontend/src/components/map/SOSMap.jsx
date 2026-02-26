import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon issue
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export default function SOSMap({ alerts }) {
  const center =
    alerts.length > 0
      ? [alerts[0].latitude, alerts[0].longitude]
      : [31.2508, 75.6957];

  return (
    <MapContainer
      center={center}
      zoom={16}
      style={{ height: "400px", width: "100%", marginBottom: "20px" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {alerts.map((alert) => (
        <Marker key={alert._id} position={[alert.latitude, alert.longitude]}>
          <Popup>
            <b>Student:</b> {alert.studentId}
            <br />
            <b>Time:</b> {new Date(alert.createdAt).toLocaleString()}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
