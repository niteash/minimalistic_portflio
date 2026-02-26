import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import SOS from "./pages/student/SOS";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* default redirect */}
        <Route path="/" element={<Navigate to="/user" />} />

        {/* user page */}
        <Route path="/user" element={<SOS />} />

        {/* admin page */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
