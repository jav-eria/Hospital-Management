
import { useEffect, useState } from "react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

import Doctors from "./doctors";
import Patients from "./patients";
import Appointments from "./appointments";
import Billing from "./billing";

import "./dashboard.css";

function Dashboard({ onLogout }) {

  const user = JSON.parse(
    localStorage.getItem("hospitalUser") || "{}"
  );

  const role = user.role || "Admin";
  const email = user.email || "admin@gmail.com";

  const [activeMenu, setActiveMenu] = useState("Dashboard");

  // Role Based Permissions
  const permissions = {
    Admin: [
      "Dashboard",
      "Patients",
      "Doctors",
      "Appointments",
      "Billing"
    ],

    Doctor: [
      "Dashboard",
      "Patients",
      "Appointments"
    ],

    Receptionist: [
      "Dashboard",
      "Patients",
      "Appointments",
      "Billing"
    ]
  };

  // Pages allowed for current user
  const allowedMenus = permissions[role] || ["Dashboard"];

  // Today's Date
  const today = new Date();

  const todayDate =
    today.getFullYear() +
    "-" +
    String(today.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(today.getDate()).padStart(2, "0");

  // Dashboard States
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [appointmentsToday, setAppointmentsToday] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [recentAppointments, setRecentAppointments] = useState([]);

  // Load Dashboard Data
  const loadDashboardData = () => {
    try {

      const patients = JSON.parse(
        localStorage.getItem("patients") || "[]"
      );

      const doctors = JSON.parse(
        localStorage.getItem("doctors") || "[]"
      );

      const appointments = JSON.parse(
        localStorage.getItem("appointments") || "[]"
      );

      const bills = JSON.parse(
        localStorage.getItem("bills") || "[]"
      );

      // Total Patients
      setTotalPatients(patients.length);

      // Total Doctors
      setTotalDoctors(doctors.length);

      // Today's Appointments
      const todayAppointments = appointments.filter(
        (item) => item.date === todayDate
      );

      setAppointmentsToday(todayAppointments.length);

      // Recent Appointments
      const sortedAppointments = [...appointments].sort(
        (a, b) => {

          const dateA = new Date(
            `${a.date || "2000-01-01"}T${a.time || "00:00"}`
          );

          const dateB = new Date(
            `${b.date || "2000-01-01"}T${b.time || "00:00"}`
          );

          return dateB - dateA;
        }
      );

      setRecentAppointments(
        sortedAppointments.slice(0, 4)
      );

      // Paid Revenue
      const paidRevenue = bills
        .filter((bill) => bill.status === "Paid")
        .reduce(
          (total, bill) =>
            total + Number(bill.amount || 0),
          0
        );

      setTotalRevenue(paidRevenue);

    } catch (error) {

      console.error("Dashboard Error:", error);

    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [activeMenu, todayDate]);

  // Prevent unauthorized menu access
  useEffect(() => {

    if (!allowedMenus.includes(activeMenu)) {
      setActiveMenu("Dashboard");
    }

  }, [activeMenu, role]);

  // Format Time
  const formatTime = (time) => {

    if (!time) return "-";

    const [hours, minutes] = time.split(":");

    const hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";

    const formattedHour = hour % 12 || 12;

    return `${String(formattedHour).padStart(2, "0")}:${minutes} ${period}`;
  };

  // Status Colors
  const getStatusClass = (status) => {

    if (status === "Confirmed") return "confirmed";

    if (status === "Completed") return "completed";

    return "pending";
  };

  // Chart Data
  const chartData = [
    { month: "Jan", patients: 120 },
    { month: "Feb", patients: 180 },
    { month: "Mar", patients: 150 },
    { month: "Apr", patients: 220 },
    { month: "May", patients: 190 },
    { month: "Jun", patients: 280 }
  ];

  // All Menu Items
  const allMenuItems = [
    { name: "Dashboard", icon: "▦" },
    { name: "Patients", icon: "♙" },
    { name: "Doctors", icon: "⚕" },
    { name: "Appointments", icon: "▣" },
    { name: "Billing", icon: "▤" }
  ];

  // Show Only Allowed Menu Items
  const menuItems = allMenuItems.filter(
    (item) => allowedMenus.includes(item.name)
  );

  // Dashboard Cards
  const stats = [
    {
      title: "Total Patients",
      value: totalPatients,
      change: "Registered",
      detail: "total patients",
      icon: "♙",
      color: "blue"
    },
    {
      title: "Total Doctors",
      value: totalDoctors,
      change: "Registered",
      detail: "total doctors",
      icon: "⚕",
      color: "green"
    },
    {
      title: "Appointments Today",
      value: appointmentsToday,
      change: "Today",
      detail: "scheduled appointments",
      icon: "▣",
      color: "orange"
    },
    {
      title: "Total Revenue",
      value: "Rs " + totalRevenue.toLocaleString(),
      change: "Paid",
      detail: "payments received",
      icon: "Rs",
      color: "purple",
      adminOnly: true,
      receptionistOnly: true
    }
  ];

  // Hide Revenue from Doctor
  const visibleStats = stats.filter((stat) => {

    if (stat.adminOnly && role !== "Admin") {
      return false;
    }

    if (
      stat.receptionistOnly &&
      !["Admin", "Receptionist"].includes(role)
    ) {
      return false;
    }

    return true;
  });

  return (

    <div className="dashboard-layout">

      {/* SIDEBAR */}
      <aside className="sidebar">

        <div className="dashboard-brand">

          <div className="dashboard-logo">+</div>

          <div>
            <h2>MediCare</h2>
            <span>HOSPITAL MANAGEMENT</span>
          </div>

        </div>

        <p className="menu-heading">MAIN MENU</p>

        {/* ROLE BASED MENU */}
        <nav className="sidebar-menu">

          {menuItems.map((item) => (

            <button
              key={item.name}
              className={
                activeMenu === item.name
                  ? "menu-item active"
                  : "menu-item"
              }
              onClick={() => setActiveMenu(item.name)}
            >

              <span className="menu-icon">
                {item.icon}
              </span>

              <span>{item.name}</span>

              {activeMenu === item.name && (
                <span className="active-arrow">›</span>
              )}

            </button>

          ))}

        </nav>

        <div className="sidebar-help">

          <div className="help-icon">?</div>

          <h4>Need Help?</h4>

          <p>
            Contact your hospital administrator for assistance.
          </p>

        </div>

        <div className="sidebar-bottom">

          <div className="sidebar-user">

            <div className="user-avatar">
              {role.charAt(0).toUpperCase()}
            </div>

            <div className="user-info">

              <h4>{role}</h4>

              <span>{email}</span>

            </div>

          </div>

          <button
            className="logout-btn"
            onClick={onLogout}
          >
            <span>↪</span> Logout
          </button>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="dashboard-main">

        {/* PATIENTS */}
        {activeMenu === "Patients" && (
          <Patients />
        )}

        {/* DOCTORS */}
        {activeMenu === "Doctors" && (
          <Doctors />
        )}

        {/* APPOINTMENTS */}
        {activeMenu === "Appointments" && (
          <Appointments />
        )}

        {/* BILLING */}
        {activeMenu === "Billing" && (
          <Billing />
        )}

        {/* DASHBOARD */}
        {activeMenu === "Dashboard" && (

          <>

            {/* HEADER */}
            <header className="dashboard-header">

              <div>

                <span className="header-label">
                  OVERVIEW
                </span>

                <h1>Dashboard</h1>

                <p>
                  Welcome back, {role}! Here's your hospital overview.
                </p>

              </div>

              <div className="header-profile">

                <div className="notification">
                  ♧
                  <span className="notification-dot"></span>
                </div>

                <div className="profile-avatar">
                  {role.charAt(0).toUpperCase()}
                </div>

                <div className="profile-info">

                  <h4>{role}</h4>

                  <span>Hospital Staff</span>

                </div>

              </div>

            </header>

            {/* WELCOME BANNER */}
            <section className="welcome-banner">

              <div>

                <span className="welcome-tag">
                  MEDICARE HOSPITAL
                </span>

                <h2>
                  Your Hospital, One Smart Dashboard
                </h2>

                <p>
                  Manage patients, doctors and appointments
                  easily from one place.
                </p>

              </div>

              <div className="welcome-icon">
                ⚕
              </div>

            </section>

            {/* STATISTICS */}
            <section className="stats-grid">

              {visibleStats.map((stat) => (

                <div
                  className="stat-card"
                  key={stat.title}
                >

                  <div className="stat-top">

                    <span>{stat.title}</span>

                    <div className={`stat-icon ${stat.color}`}>
                      {stat.icon}
                    </div>

                  </div>

                  <h2>{stat.value}</h2>

                  <p>
                    <span>{stat.change}</span>
                    {" "}{stat.detail}
                  </p>

                </div>

              ))}

            </section>

            {/* CHART */}
            <section className="dashboard-chart">

              <div className="section-heading">

                <div>

                  <h2>Patient Overview</h2>

                  <p>Monthly patient statistics</p>

                </div>

                <select defaultValue="6months">

                  <option value="6months">
                    Last 6 Months
                  </option>

                  <option value="year">
                    This Year
                  </option>

                </select>

              </div>

              <div className="chart-area">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart data={chartData}>

                    <CartesianGrid
                      strokeDasharray="4 4"
                      vertical={false}
                    />

                    <XAxis dataKey="month" />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="patients"
                      name="Patients"
                      fill="#087e8b"
                      radius={[7, 7, 0, 0]}
                      barSize={35}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </section>

            {/* RECENT APPOINTMENTS */}
            <section className="appointments-section">

              <div className="section-heading">

                <div>

                  <h2>Recent Appointments</h2>

                  <p>Latest scheduled appointments</p>

                </div>

                <button
                  className="view-all"
                  onClick={() => setActiveMenu("Appointments")}
                >
                  View All →
                </button>

              </div>

              <div
                className="table-wrapper"
                style={{
                  overflowX: "auto",
                  width: "100%",
                  background: "#fff",
                  borderRadius: "10px"
                }}
              >

                <table
                  style={{
                    width: "100%",
                    minWidth: "750px",
                    borderCollapse: "collapse",
                    textAlign: "left"
                  }}
                >

                  <thead>

                    <tr>
                      <th>Patient Name</th>
                      <th>Doctor Name</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {recentAppointments.length > 0 ? (

                      recentAppointments.map((appointment) => (

                        <tr key={appointment.id}>

                          <td>
                            <strong>
                              {appointment.patient || "-"}
                            </strong>
                          </td>

                          <td>
                            {appointment.doctor || "-"}
                          </td>

                          <td>
                            {appointment.date || "-"}
                          </td>

                          <td>
                            {formatTime(appointment.time)}
                          </td>

                          <td>
                            {appointment.reason || "-"}
                          </td>

                          <td>

                            <span
                              className={`status ${getStatusClass(
                                appointment.status
                              )}`}
                            >
                              {appointment.status || "Pending"}
                            </span>

                          </td>

                        </tr>

                      ))

                    ) : (

                      <tr>

                        <td
                          colSpan="6"
                          style={{
                            textAlign: "center",
                            padding: "25px"
                          }}
                        >
                          No appointments found. Please add an appointment.
                        </td>

                      </tr>

                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* FOOTER */}
            <footer className="dashboard-footer">

              <span>
                © 2026 MediCare Hospital Management System
              </span>

              <span>
                Made with care for better healthcare ♥
              </span>

            </footer>

          </>

        )}

      </main>

    </div>

  );
}

export default Dashboard;
