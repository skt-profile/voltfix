import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AIChat from "./pages/AIChat.jsx";
import BikeManagement from "./pages/BikeManagement.jsx";
import BikeDetail from "./pages/BikeDetail.jsx";
import Profile from "./pages/Profile.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import NotFound from "./pages/NotFound.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Private */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bikes"
        element={
          <ProtectedRoute>
            <BikeManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bikes/:id"
        element={
          <ProtectedRoute>
            <BikeDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/battery-health"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="Battery Health Predictor"
              description="AI-powered battery scoring and remaining-life forecasting is arriving in the next build phase."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/service-history"
        element={
          <ProtectedRoute>
            <ComingSoon
              title="Service History"
              description="Logging service records, uploading bills, and maintenance reminders are arriving in the next build phase. You can already view a bike's history from its detail page."
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
