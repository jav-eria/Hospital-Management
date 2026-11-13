
import { useEffect, useState } from "react";

function Doctors() {
  const defaultDoctors = [
    {
      id: 1,
      name: "Dr. Sarah Khan",
      specialization: "Cardiologist",
      phone: "03001234567",
      email: "sarah@gmail.com",
      experience: 8,
      availability: "Available"
    },
    {
      id: 2,
      name: "Dr. Ahmed Ali",
      specialization: "Neurologist",
      phone: "03111234567",
      email: "ahmed@gmail.com",
      experience: 10,
      availability: "Available"
    },
    {
      id: 3,
      name: "Dr. Fatima Noor",
      specialization: "Dermatologist",
      phone: "03221234567",
      email: "fatima@gmail.com",
      experience: 5,
      availability: "Unavailable"
    },
    {
      id: 4,
      name: "Dr. Usman Malik",
      specialization: "Orthopedic",
      phone: "03331234567",
      email: "usman@gmail.com",
      experience: 7,
      availability: "Available"
    },
    {
      id: 5,
      name: "Dr. Hina Aslam",
      specialization: "Pediatrician",
      phone: "03441234567",
      email: "hina@gmail.com",
      experience: 6,
      availability: "Unavailable"
    }
  ];

  const [doctors, setDoctors] = useState(() => {
    try {
      const saved = localStorage.getItem("doctors");
      return saved ? JSON.parse(saved) : defaultDoctors;
    } catch {
      return defaultDoctors;
    }
  });

  const [search, setSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    specialization: "Cardiologist",
    phone: "",
    email: "",
    experience: "",
    availability: "Available"
  });

  useEffect(() => {
    localStorage.setItem("doctors", JSON.stringify(doctors));
  }, [doctors]);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.phone.includes(search) ||
      doctor.email.toLowerCase().includes(search.toLowerCase());

    const matchesSpecialization =
      specializationFilter === "All" ||
      doctor.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  // Export Doctors CSV
  const exportCSV = () => {
    if (filteredDoctors.length === 0) {
      alert("No doctors available to export.");
      return;
    }

    const headers = [
      "ID",
      "Doctor Name",
      "Specialization",
      "Phone",
      "Email",
      "Experience",
      "Availability"
    ];

    const escapeCSV = (value) => {
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    };

    const rows = filteredDoctors.map((doctor) => [
      doctor.id,
      doctor.name,
      doctor.specialization,
      doctor.phone,
      doctor.email,
      doctor.experience,
      doctor.availability
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
    link.download = "doctors.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const openAddForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      specialization: "Cardiologist",
      phone: "",
      email: "",
      experience: "",
      availability: "Available"
    });
    setShowForm(true);
  };

  const openEditForm = (doctor) => {
    setEditingId(doctor.id);
    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      phone: doctor.phone,
      email: doctor.email,
      experience: doctor.experience,
      availability: doctor.availability
    });
    setShowForm(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.experience
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (Number(formData.experience) < 0) {
      alert("Experience cannot be negative.");
      return;
    }

    if (editingId !== null) {
      setDoctors((prev) =>
        prev.map((doctor) =>
          doctor.id === editingId
            ? {
                ...formData,
                id: editingId,
                experience: Number(formData.experience)
              }
            : doctor
        )
      );
    } else {
      const newDoctor = {
        ...formData,
        id: Date.now(),
        experience: Number(formData.experience)
      };

      setDoctors((prev) => [newDoctor, ...prev]);
    }

    setShowForm(false);
    setEditingId(null);
  };

  const deleteDoctor = (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== id));
    }
  };

  const toggleAvailability = (id) => {
    setDoctors((prev) =>
      prev.map((doctor) =>
        doctor.id === id
          ? {
              ...doctor,
              availability:
                doctor.availability === "Available"
                  ? "Unavailable"
                  : "Available"
            }
          : doctor
      )
    );
  };

  return (
    <div className="doctors-page">
      <style>{`
        .doctors-page {
          min-height: 100vh;
          padding: 30px;
          background: #f5f8fb;
          color: #263746;
          font-family: Arial, sans-serif;
        }

        .doctors-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }

        .doctors-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .doctors-header p {
          color: #84919e;
          margin: 0;
        }

        .add-doctor-btn {
          background: #087e8b;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .add-doctor-btn:hover {
          background: #066873;
        }

        .doctor-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .doctor-summary-card {
          background: white;
          padding: 22px;
          border-radius: 12px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.04);
        }

        .doctor-summary-card span {
          color: #84919e;
          font-size: 14px;
        }

        .doctor-summary-card h2 {
          color: #087e8b;
          font-size: 27px;
          margin: 10px 0 0;
        }

        .doctors-table-card {
          background: white;
          padding: 22px;
          border-radius: 12px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.04);
        }

        .doctors-controls {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .doctors-controls input,
        .doctors-controls select {
          padding: 11px 13px;
          border: 1px solid #dce3e9;
          border-radius: 7px;
          outline: none;
          background: white;
          min-width: 180px;
        }

        .doctors-controls input {
          flex: 1;
        }

        .doctors-controls input:focus,
        .doctors-controls select:focus,
        .doctor-form input:focus,
        .doctor-form select:focus {
          border-color: #087e8b;
        }

        .export-doctors-btn {
          background: #218653;
          color: white;
          border: none;
          padding: 11px 16px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 600;
        }

        .export-doctors-btn:hover {
          background: #176b40;
        }

        .doctors-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .doctors-table {
          width: 100%;
          min-width: 850px;
          border-collapse: collapse;
        }

        .doctors-table th {
          background: #f5f8fb;
          color: #748391;
          font-size: 13px;
          text-align: left;
          padding: 14px 12px;
        }

        .doctors-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #edf0f3;
          font-size: 14px;
        }

        .doctor-name {
          font-weight: 600;
        }

        .doctor-avatar {
          width: 36px;
          height: 36px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e5f5f5;
          color: #087e8b;
          font-weight: 700;
          margin-right: 9px;
        }

        .availability {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .available {
          background: #e4f7ec;
          color: #218653;
        }

        .unavailable {
          background: #ffe8e8;
          color: #d33;
        }

        .doctor-action {
          border: none;
          padding: 7px 10px;
          border-radius: 6px;
          margin: 2px;
          cursor: pointer;
          font-size: 12px;
        }

        .availability-btn {
          background: #e5f5f5;
          color: #087e8b;
        }

        .edit-doctor-btn {
          background: #fff2dc;
          color: #b7791f;
        }

        .delete-doctor-btn {
          background: #ffe8e8;
          color: #d33;
        }

        .empty-doctors {
          text-align: center;
          padding: 30px;
          color: #84919e;
        }

        .doctor-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
          overflow-y: auto;
        }

        .doctor-modal {
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          padding: 25px;
          border-radius: 13px;
        }

        .doctor-modal h2 {
          font-size: 22px;
          margin-bottom: 20px;
        }

        .doctor-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .doctor-form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .doctor-form-group.full {
          grid-column: 1 / -1;
        }

        .doctor-form-group label {
          font-size: 13px;
          font-weight: 600;
        }

        .doctor-form input,
        .doctor-form select {
          width: 100%;
          padding: 11px;
          border: 1px solid #dce3e9;
          border-radius: 7px;
          outline: none;
          background: white;
        }

        .doctor-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
          flex-wrap: wrap;
        }

        .doctor-modal-actions button {
          padding: 10px 17px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
        }

        .doctor-cancel-btn {
          background: #edf0f3;
          color: #344;
        }

        .doctor-save-btn {
          background: #087e8b;
          color: white;
        }

        @media (max-width: 700px) {
          .doctors-page {
            padding: 18px 12px;
          }

          .doctor-summary {
            grid-template-columns: 1fr;
          }

          .doctors-table-card {
            padding: 15px;
          }
        }

        @media (max-width: 480px) {
          .doctors-header h1 {
            font-size: 23px;
          }

          .add-doctor-btn {
            width: 100%;
          }

          .doctor-form {
            grid-template-columns: 1fr;
          }

          .doctor-form-group.full {
            grid-column: auto;
          }
        }
      `}</style>

      {/* Header */}
      <div className="doctors-header">
        <div>
          <h1>Doctors Management</h1>
          <p>Manage hospital doctors and their availability.</p>
        </div>

        <button className="add-doctor-btn" onClick={openAddForm}>
          + Add New Doctor
        </button>
      </div>

      {/* Summary Cards */}
      <div className="doctor-summary">
        <div className="doctor-summary-card">
          <span>Total Doctors</span>
          <h2>{doctors.length}</h2>
        </div>

        <div className="doctor-summary-card">
          <span>Available Doctors</span>
          <h2>
            {doctors.filter(d => d.availability === "Available").length}
          </h2>
        </div>

        <div className="doctor-summary-card">
          <span>Unavailable Doctors</span>
          <h2>
            {doctors.filter(d => d.availability === "Unavailable").length}
          </h2>
        </div>
      </div>

      {/* Doctors List */}
      <div className="doctors-table-card">
        <div className="doctors-controls">
          <input
            type="text"
            placeholder="Search doctor by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
          >
            <option value="All">All Specializations</option>
            <option value="Cardiologist">Cardiologist</option>
            <option value="Neurologist">Neurologist</option>
            <option value="Dermatologist">Dermatologist</option>
            <option value="Orthopedic">Orthopedic</option>
            <option value="Pediatrician">Pediatrician</option>
            <option value="General Physician">General Physician</option>
            <option value="Gynecologist">Gynecologist</option>
            <option value="Other">Other</option>
          </select>

          <button
            className="export-doctors-btn"
            onClick={exportCSV}
          >
            ↓ Export CSV
          </button>
        </div>

        <div className="doctors-table-wrapper">
          <table className="doctors-table">
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Experience</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>
                      <span className="doctor-avatar">
                        {doctor.name.charAt(0)}
                      </span>
                      <span className="doctor-name">{doctor.name}</span>
                    </td>

                    <td>{doctor.specialization}</td>
                    <td>{doctor.phone}</td>
                    <td>{doctor.experience} Years</td>

                    <td>
                      <span
                        className={
                          doctor.availability === "Available"
                            ? "availability available"
                            : "availability unavailable"
                        }
                      >
                        {doctor.availability}
                      </span>
                    </td>

                    <td>
                      <button
                        className="doctor-action availability-btn"
                        onClick={() => toggleAvailability(doctor.id)}
                      >
                        Change Status
                      </button>

                      <button
                        className="doctor-action edit-doctor-btn"
                        onClick={() => openEditForm(doctor)}
                      >
                        Edit
                      </button>

                      <button
                        className="doctor-action delete-doctor-btn"
                        onClick={() => deleteDoctor(doctor.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-doctors">
                    No doctors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Doctor Modal */}
      {showForm && (
        <div className="doctor-overlay">
          <div className="doctor-modal">
            <h2>
              {editingId !== null ? "Edit Doctor" : "Add New Doctor"}
            </h2>

            <form className="doctor-form" onSubmit={handleSubmit}>
              <div className="doctor-form-group full">
                <label>Doctor Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter doctor name"
                  required
                />
              </div>

              <div className="doctor-form-group">
                <label>Specialization</label>
                <select
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                >
                  <option>Cardiologist</option>
                  <option>Neurologist</option>
                  <option>Dermatologist</option>
                  <option>Orthopedic</option>
                  <option>Pediatrician</option>
                  <option>General Physician</option>
                  <option>Gynecologist</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="doctor-form-group">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Enter years"
                  min="0"
                  required
                />
              </div>

              <div className="doctor-form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone"
                  required
                />
              </div>

              <div className="doctor-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  required
                />
              </div>

              <div className="doctor-form-group full">
                <label>Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option>Available</option>
                  <option>Unavailable</option>
                </select>
              </div>

              <div className="doctor-form-group full">
                <div className="doctor-modal-actions">
                  <button
                    type="button"
                    className="doctor-cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button type="submit" className="doctor-save-btn">
                    {editingId !== null ? "Update Doctor" : "Save Doctor"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;
