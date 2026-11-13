
import { useEffect, useState } from "react";

function Appointments() {
  const [appointments, setAppointments] = useState(() => {
    return JSON.parse(localStorage.getItem("appointments") || "[]");
  });

  const [patients] = useState(() => {
    return JSON.parse(localStorage.getItem("patients") || "[]");
  });

  const [doctors] = useState(() => {
    return JSON.parse(localStorage.getItem("doctors") || "[]");
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  const emptyForm = {
    patient: "",
    doctor: "",
    date: "",
    time: "",
    reason: "",
    status: "Pending",
  };

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.patient || !form.doctor || !form.date || !form.time) {
      alert("Please fill all required fields.");
      return;
    }

    if (editId !== null) {
      setAppointments(
        appointments.map((item) =>
          item.id === editId ? { ...form, id: editId } : item
        )
      );
    } else {
      setAppointments([
        ...appointments,
        { ...form, id: Date.now() },
      ]);
    }

    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (item) => {
    setForm({
      patient: item.patient,
      doctor: item.doctor,
      date: item.date,
      time: item.time,
      reason: item.reason,
      status: item.status,
    });

    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      setAppointments(appointments.filter((item) => item.id !== id));
    }
  };

  const filteredAppointments = appointments.filter((item) => {
    const matchesSearch =
      (item.patient || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.doctor || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "All" || item.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Export Appointments CSV
  const exportCSV = () => {
    if (filteredAppointments.length === 0) {
      alert("No appointments available to export.");
      return;
    }

    const headers = [
      "ID",
      "Patient",
      "Doctor",
      "Date",
      "Time",
      "Reason",
      "Status"
    ];

    const escapeCSV = (value) => {
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    };

    const rows = filteredAppointments.map((item) => [
      item.id,
      item.patient,
      item.doctor,
      item.date,
      item.time,
      item.reason,
      item.status
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "appointments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const statusColor = (status) => {
    if (status === "Confirmed") return "#198754";
    if (status === "Completed") return "#0d6efd";
    return "#f0ad4e";
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Appointments</h2>
          <p style={styles.subtitle}>Manage hospital appointments</p>
        </div>

        <button
          style={styles.addButton}
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setShowForm(true);
          }}
        >
          + Add Appointment
        </button>
      </div>

      <div style={styles.cards}>
        <div style={styles.card}>
          <h3>{appointments.length}</h3>
          <p>Total Appointments</p>
        </div>

        <div style={styles.card}>
          <h3>{appointments.filter(a => a.status === "Pending").length}</h3>
          <p>Pending</p>
        </div>

        <div style={styles.card}>
          <h3>{appointments.filter(a => a.status === "Confirmed").length}</h3>
          <p>Confirmed</p>
        </div>

        <div style={styles.card}>
          <h3>{appointments.filter(a => a.status === "Completed").length}</h3>
          <p>Completed</p>
        </div>
      </div>

      <div style={styles.filters}>
        <input
          style={styles.search}
          type="text"
          placeholder="Search patient or doctor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          style={styles.select}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Completed">Completed</option>
        </select>

        <button
          style={styles.exportButton}
          onClick={exportCSV}
        >
          ↓ Export CSV
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAppointments.length > 0 ? (
              filteredAppointments.map((item) => (
                <tr key={item.id}>
                  <td>{item.patient}</td>
                  <td>{item.doctor}</td>
                  <td>{item.date}</td>
                  <td>{item.time}</td>
                  <td>{item.reason || "-"}</td>
                  <td>
                    <span
                      style={{
                        ...styles.status,
                        background: statusColor(item.status),
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      style={styles.editButton}
                      onClick={() => handleEdit(item)}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.deleteButton}
                      onClick={() => handleDelete(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={styles.empty}>
                  No appointments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h2>{editId !== null ? "Edit Appointment" : "Add Appointment"}</h2>

            <form onSubmit={handleSubmit}>
              <label>Patient *</label>
              <select
                name="patient"
                style={styles.field}
                value={form.patient}
                onChange={handleChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>

              <label>Doctor *</label>
              <select
                name="doctor"
                style={styles.field}
                value={form.doctor}
                onChange={handleChange}
                required
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <label>Date *</label>
              <input
                type="date"
                name="date"
                style={styles.field}
                value={form.date}
                onChange={handleChange}
                required
              />

              <label>Time *</label>
              <input
                type="time"
                name="time"
                style={styles.field}
                value={form.time}
                onChange={handleChange}
                required
              />

              <label>Reason</label>
              <input
                type="text"
                name="reason"
                placeholder="Appointment reason"
                style={styles.field}
                value={form.reason}
                onChange={handleChange}
              />

              <label>Status</label>
              <select
                name="status"
                style={styles.field}
                value={form.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
              </select>

              <div style={styles.formButtons}>
                <button type="submit" style={styles.addButton}>
                  {editId !== null ? "Update Appointment" : "Save Appointment"}
                </button>

                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => {
                    setShowForm(false);
                    setForm(emptyForm);
                    setEditId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    padding: "25px",
    width: "100%",
    color: "#263445",
    boxSizing: "border-box",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "15px",
    marginBottom: "25px",
  },
  heading: {
    fontSize: "28px",
    fontWeight: "700",
    margin: 0,
  },
  subtitle: {
    color: "#777",
    marginTop: "7px",
  },
  addButton: {
    background: "#0d6efd",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
  },
  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "15px",
    marginBottom: "25px",
  },
  card: {
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
    borderLeft: "4px solid #0d6efd",
  },
  filters: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "20px",
  },
  search: {
    flex: "1",
    minWidth: "200px",
    padding: "11px",
    border: "1px solid #ddd",
    borderRadius: "7px",
  },
  select: {
    padding: "11px",
    border: "1px solid #ddd",
    borderRadius: "7px",
  },
  exportButton: {
    background: "#198754",
    color: "white",
    border: "none",
    padding: "11px 16px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "600",
  },
  tableContainer: {
    width: "100%",
    overflowX: "auto",
    background: "white",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    minWidth: "850px",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  status: {
    color: "white",
    padding: "5px 9px",
    borderRadius: "15px",
    fontSize: "12px",
  },
  editButton: {
    background: "#ffc107",
    border: "none",
    padding: "7px 10px",
    borderRadius: "5px",
    cursor: "pointer",
    marginRight: "5px",
  },
  deleteButton: {
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "7px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  empty: {
    textAlign: "center",
    padding: "25px",
    color: "#777",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "15px",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    width: "100%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "25px",
    borderRadius: "12px",
  },
  field: {
    width: "100%",
    padding: "10px",
    marginTop: "6px",
    marginBottom: "14px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxSizing: "border-box",
  },
  formButtons: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "10px",
  },
  cancelButton: {
    background: "#6c757d",
    color: "white",
    border: "none",
    padding: "11px 18px",
    borderRadius: "7px",
    cursor: "pointer",
  },
};

export default Appointments;
