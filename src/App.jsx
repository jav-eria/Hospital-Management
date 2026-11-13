
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from "react-router-dom";

import "./App.css";
import Dashboard from "./pages/dashboard";

// Check logged-in user
function getUser() {
  try {
    const user = JSON.parse(
      localStorage.getItem("hospitalUser") || "null"
    );

    if (
      user &&
      user.email &&
      ["Admin", "Doctor", "Receptionist"].includes(user.role)
    ) {
      return user;
    }

    return null;
  } catch {
    return null;
  }
}

// Protected Route
function ProtectedRoute({ children }) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Login Page
function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setMessage("Please enter your email and password.");
      return;
    }

    if (!["Admin", "Doctor", "Receptionist"].includes(role)) {
      setMessage("Please select a valid role.");
      return;
    }

    const user = {
      email: email.trim(),
      role: role
    };

    localStorage.setItem(
      "hospitalUser",
      JSON.stringify(user)
    );

    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      <div className="login-layout">

        {/* LEFT SIDE */}

        <div className="login-left">

          <div className="brand">

            <div className="brand-icon">
              <i className="fa-solid fa-heart-pulse"></i>
            </div>

            <div>
              <h1>
                Medi<span>Care</span>
              </h1>

              <p>Hospital Management System</p>
            </div>

          </div>

          <div className="tagline">
            Better Care...
            <br />
            A Healthier Tomorrow...
          </div>

          <div className="welcome-content">

            <h2>
              Welcome to
              <br />
              <span>MediCare</span>
            </h2>

            <p>
              Manage your hospital operations easily
              with our smart and simple management system.
            </p>

          </div>

          <div className="features">

            <div className="feature-item">
              <div className="feature-icon">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <span>Manage Appointments</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <i className="fa-solid fa-user-doctor"></i>
              </div>
              <span>Handle Patients & Doctors</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <i className="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <span>Track Billing & Payments</span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <span>View Reports & Analytics</span>
            </div>

          </div>

          <div className="left-footer">
            <i className="fa-solid fa-shield-halved"></i>
            <span>
              © 2026 MediCare. All Rights Reserved.
            </span>
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="login-right">

          <div className="login-card">

            <div className="login-top-icon">
              <i className="fa-solid fa-hospital"></i>
            </div>

            <h2>Sign In</h2>

            <p className="login-subtitle">
              Please enter your details to continue.
            </p>

            <div className="form-divider"></div>

            <form onSubmit={handleLogin}>

              {/* ROLE */}

              <div className="form-group">

                <label>
                  <i className="fa-solid fa-user-shield"></i>
                  Login As
                </label>

                <div className="input-wrapper">

                  <i className="fa-solid fa-users"></i>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="Admin">Admin</option>
                    <option value="Doctor">Doctor</option>
                    <option value="Receptionist">
                      Receptionist
                    </option>
                  </select>

                  <i className="fa-solid fa-chevron-down select-arrow"></i>

                </div>

              </div>

              {/* EMAIL */}

              <div className="form-group">

                <label>
                  <i className="fa-solid fa-envelope"></i>
                  Email Address
                </label>

                <div className="input-wrapper">

                  <i className="fa-solid fa-envelope"></i>

                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setMessage("");
                    }}
                    required
                  />

                </div>

              </div>

              {/* PASSWORD */}

              <div className="form-group">

                <label>
                  <i className="fa-solid fa-lock"></i>
                  Password
                </label>

                <div className="input-wrapper password-wrapper">

                  <i className="fa-solid fa-lock"></i>

                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMessage("");
                    }}
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowPassword(!showPassword)
                    }
                  >
                    <i className={
                      showPassword
                        ? "fa-solid fa-eye-slash"
                        : "fa-solid fa-eye"
                    }></i>

                    {showPassword ? "Hide" : "Show"}

                  </button>

                </div>

              </div>

              {/* ERROR MESSAGE */}

              {message && (
                <div className="login-error">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  {message}
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="login-button"
              >

                <i className="fa-solid fa-right-to-bracket"></i>

                Sign In

              </button>

            </form>

            {/* DEMO NOTE */}

            <div className="demo-note">

              <i className="fa-regular fa-lightbulb"></i>

              <span>
                Demo Login: Enter any valid email and password.
              </span>

            </div>

            <div className="health-line">
              <span></span>
              <i className="fa-solid fa-heart-pulse"></i>
              <span></span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

// Dashboard Page
function DashboardPage() {
  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.removeItem("hospitalUser");

    navigate("/login", { replace: true });

  };

  return <Dashboard onLogout={handleLogout} />;
}

// Main App
function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        <Route
          path="/login"
          element={
            getUser()
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>

    </BrowserRouter>

  );

}

export default App;
