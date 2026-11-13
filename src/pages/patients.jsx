
import { useEffect, useState } from "react";

function Patients() {

  const defaultPatients = [
    {
      id: 1,
      name: "Ali Ahmed",
      age: 25,
      gender: "Male",
      phone: "03001234567",
      email: "ali@gmail.com",
      address: "Rawalpindi"
    },
    {
      id: 2,
      name: "Ayesha Noor",
      age: 22,
      gender: "Female",
      phone: "03111234567",
      email: "ayesha@gmail.com",
      address: "Islamabad"
    },
    {
      id: 3,
      name: "Usman Malik",
      age: 35,
      gender: "Male",
      phone: "03221234567",
      email: "usman@gmail.com",
      address: "Lahore"
    },
    {
      id: 4,
      name: "Hina Aslam",
      age: 28,
      gender: "Female",
      phone: "03331234567",
      email: "hina@gmail.com",
      address: "Karachi"
    },
    {
      id: 5,
      name: "Ahmed Raza",
      age: 40,
      gender: "Male",
      phone: "03441234567",
      email: "ahmed@gmail.com",
      address: "Rawalpindi"
    },
    {
      id: 6,
      name: "Sara Khan",
      age: 30,
      gender: "Female",
      phone: "03051234567",
      email: "sara@gmail.com",
      address: "Islamabad"
    }
  ];

  const [patients, setPatients] = useState(() => {
    try {
      const saved = localStorage.getItem("patients");
      return saved ? JSON.parse(saved) : defaultPatients;
    } catch {
      return defaultPatients;
    }
  });

  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Male",
    phone: "",
    email: "",
    address: ""
  });

  const patientsPerPage = 5;

  useEffect(() => {
    localStorage.setItem("patients", JSON.stringify(patients));
  }, [patients]);

  // Search and Gender Filter
  const filteredPatients = patients.filter((patient) => {

    const matchesSearch =
      patient.name.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone.includes(search) ||
      patient.email.toLowerCase().includes(search.toLowerCase());

    const matchesGender =
      genderFilter === "All" || patient.gender === genderFilter;

    return matchesSearch && matchesGender;
  });

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredPatients.length / patientsPerPage)
  );

  const currentPatients = filteredPatients.slice(
    (currentPage - 1) * patientsPerPage,
    currentPage * patientsPerPage
  );

  // EXPORT PATIENTS TO CSV
  const exportCSV = () => {

    if (filteredPatients.length === 0) {
      alert("No patients available to export.");
      return;
    }

    const headers = [
      "ID",
      "Patient Name",
      "Age",
      "Gender",
      "Phone",
      "Email",
      "Address"
    ];

    const rows = filteredPatients.map((patient) => [
      patient.id,
      patient.name,
      patient.age,
      patient.gender,
      patient.phone,
      patient.email,
      patient.address
    ]);

    // Escape CSV values safely
    const escapeCSV = (value) => {
      const text = String(value ?? "");
      return `"${text.replace(/"/g, '""')}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(","))
    ].join("\r\n");

    // UTF-8 BOM for Excel compatibility
    const blob = new Blob(
      ["\uFEFF" + csvContent],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "patients.csv";

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  };

  // Open Add Form
  const openAddForm = () => {

    setEditingId(null);

    setFormData({
      name: "",
      age: "",
      gender: "Male",
      phone: "",
      email: "",
      address: ""
    });

    setShowForm(true);
  };

  // Open Edit Form
  const openEditForm = (patient) => {

    setEditingId(patient.id);

    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      address: patient.address
    });

    setShowForm(true);
    setSelectedPatient(null);
  };

  // Handle Form Change
  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Save Patient
  const handleSubmit = (e) => {

    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.age ||
      !formData.phone.trim() ||
      !formData.email.trim() ||
      !formData.address.trim()
    ) {
      alert("Please fill all fields.");
      return;
    }

    if (Number(formData.age) <= 0) {
      alert("Please enter a valid age.");
      return;
    }

    if (editingId !== null) {

      setPatients((prev) =>
        prev.map((patient) =>
          patient.id === editingId
            ? {
                ...formData,
                id: editingId,
                age: Number(formData.age)
              }
            : patient
        )
      );

    } else {

      const newPatient = {
        ...formData,
        id: Date.now(),
        age: Number(formData.age)
      };

      setPatients((prev) => [newPatient, ...prev]);

      setCurrentPage(1);
    }

    setShowForm(false);
    setEditingId(null);
  };

  // Delete Patient
  const deletePatient = (id) => {

    if (window.confirm("Are you sure you want to delete this patient?")) {

      setPatients((prev) =>
        prev.filter((patient) => patient.id !== id)
      );

      setSelectedPatient(null);
    }
  };

  return (

    <div className="patients-page">

      <style>{`

        .patients-page {
          padding: 30px;
          min-height: 100vh;
          background: #f5f8fb;
          color: #263746;
          font-family: Arial, sans-serif;
        }

        .patients-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
          flex-wrap: wrap;
        }

        .patients-header h1 {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .patients-header p {
          color: #84919e;
          margin: 0;
        }

        .add-patient-btn {
          background: #087e8b;
          color: white;
          border: none;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }

        .add-patient-btn:hover {
          background: #066873;
        }

        .patients-summary {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          margin-bottom: 25px;
        }

        .summary-card {
          background: white;
          padding: 22px;
          border-radius: 12px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.04);
        }

        .summary-card span {
          color: #84919e;
          font-size: 14px;
        }

        .summary-card h2 {
          margin: 10px 0 0;
          color: #087e8b;
          font-size: 27px;
        }

        .patients-table-card {
          background: white;
          padding: 22px;
          border-radius: 12px;
          box-shadow: 0 3px 12px rgba(0,0,0,0.04);
        }

        .patients-controls {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .patients-controls input,
        .patients-controls select {
          padding: 11px 13px;
          border: 1px solid #dce3e9;
          border-radius: 7px;
          outline: none;
          background: white;
          min-width: 180px;
        }

        .patients-controls input {
          flex: 1;
        }

        .patients-controls input:focus,
        .patients-controls select:focus,
        .patient-form input:focus,
        .patient-form select:focus {
          border-color: #087e8b;
        }

        .export-btn {
          background: #198754;
          color: white;
          border: none;
          padding: 11px 16px;
          border-radius: 7px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .export-btn:hover {
          background: #146c43;
        }

        .patients-table-wrapper {
          width: 100%;
          overflow-x: auto;
        }

        .patients-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        .patients-table th {
          background: #f5f8fb;
          color: #748391;
          font-size: 13px;
          text-align: left;
          padding: 14px 12px;
        }

        .patients-table td {
          padding: 15px 12px;
          border-bottom: 1px solid #edf0f3;
          font-size: 14px;
        }

        .patient-name-cell {
          font-weight: 600;
          color: #263746;
        }

        .gender-badge {
          background: #e5f5f5;
          color: #087e8b;
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
        }

        .action-btn {
          border: none;
          padding: 7px 10px;
          border-radius: 6px;
          margin: 2px;
          cursor: pointer;
          font-size: 12px;
        }

        .view-btn {
          background: #e5f5f5;
          color: #087e8b;
        }

        .edit-btn {
          background: #fff2dc;
          color: #b7791f;
        }

        .delete-btn {
          background: #ffe8e8;
          color: #d33;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 22px;
          flex-wrap: wrap;
        }

        .pagination button {
          border: 1px solid #dce3e9;
          background: white;
          padding: 8px 13px;
          border-radius: 6px;
          cursor: pointer;
        }

        .pagination button.active {
          background: #087e8b;
          color: white;
          border-color: #087e8b;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .patient-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 15px;
          z-index: 1000;
          overflow-y: auto;
        }

        .patient-modal {
          background: white;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 25px;
          border-radius: 13px;
        }

        .patient-modal h2 {
          margin-bottom: 20px;
          font-size: 22px;
        }

        .patient-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-group label {
          font-size: 13px;
          font-weight: 600;
        }

        .patient-form input,
        .patient-form select {
          padding: 11px;
          border: 1px solid #dce3e9;
          border-radius: 7px;
          outline: none;
          width: 100%;
          background: white;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .modal-actions button {
          padding: 10px 17px;
          border: none;
          border-radius: 7px;
          cursor: pointer;
        }

        .cancel-btn {
          background: #edf0f3;
          color: #344;
        }

        .save-btn {
          background: #087e8b;
          color: white;
        }

        .detail-row {
          padding: 12px 0;
          border-bottom: 1px solid #edf0f3;
        }

        .detail-row strong {
          display: block;
          color: #84919e;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .empty-message {
          text-align: center;
          padding: 30px;
          color: #84919e;
        }

        @media (max-width: 700px) {

          .patients-page {
            padding: 18px 12px;
          }

          .patients-summary {
            grid-template-columns: 1fr;
          }

          .patients-table-card {
            padding: 15px;
          }

        }

        @media (max-width: 480px) {

          .patients-header h1 {
            font-size: 23px;
          }

          .add-patient-btn,
          .export-btn {
            width: 100%;
          }

          .patients-controls input,
          .patients-controls select {
            width: 100%;
            min-width: 0;
          }

          .patient-form {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

        }

      `}</style>

      {/* HEADER */}
      <div className="patients-header">

        <div>
          <h1>Patients Management</h1>
          <p>Manage and view all hospital patients.</p>
        </div>

        <button
          className="add-patient-btn"
          onClick={openAddForm}
        >
          + Add New Patient
        </button>

      </div>

      {/* SUMMARY */}
      <div className="patients-summary">

        <div className="summary-card">
          <span>Total Patients</span>
          <h2>{patients.length}</h2>
        </div>

        <div className="summary-card">
          <span>Male Patients</span>
          <h2>
            {patients.filter(p => p.gender === "Male").length}
          </h2>
        </div>

        <div className="summary-card">
          <span>Female Patients</span>
          <h2>
            {patients.filter(p => p.gender === "Female").length}
          </h2>
        </div>

      </div>

      {/* PATIENT LIST */}
      <div className="patients-table-card">

        <div className="patients-controls">

          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

          <select
            value={genderFilter}
            onChange={(e) => {
              setGenderFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {/* EXPORT CSV BUTTON */}
          <button
            className="export-btn"
            onClick={exportCSV}
          >
            ↓ Export CSV
          </button>

        </div>

        <div className="patients-table-wrapper">

          <table className="patients-table">

            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Age</th>
                <th>Gender</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {currentPatients.length > 0 ? (

                currentPatients.map((patient) => (

                  <tr key={patient.id}>

                    <td className="patient-name-cell">
                      {patient.name}
                    </td>

                    <td>{patient.age}</td>

                    <td>
                      <span className="gender-badge">
                        {patient.gender}
                      </span>
                    </td>

                    <td>{patient.phone}</td>

                    <td>{patient.email}</td>

                    <td>

                      <button
                        className="action-btn view-btn"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        View
                      </button>

                      <button
                        className="action-btn edit-btn"
                        onClick={() => openEditForm(patient)}
                      >
                        Edit
                      </button>

                      <button
                        className="action-btn delete-btn"
                        onClick={() => deletePatient(patient.id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="6" className="empty-message">
                    No patients found.
                  </td>
                </tr>

              )}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
        <div className="pagination">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => (

            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>

          ))}

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>

        </div>

      </div>

      {/* ADD / EDIT MODAL */}
      {showForm && (

        <div className="patient-overlay">

          <div className="patient-modal">

            <h2>
              {editingId !== null
                ? "Edit Patient"
                : "Add New Patient"}
            </h2>

            <form
              className="patient-form"
              onSubmit={handleSubmit}
            >

              <div className="form-group full">
                <label>Full Name</label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Age</label>

                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Enter age"
                  min="1"
                  required
                />
              </div>

              <div className="form-group">
                <label>Gender</label>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Phone Number</label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
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

              <div className="form-group full">
                <label>Address</label>

                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                  required
                />
              </div>

              <div className="form-group full">

                <div className="modal-actions">

                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="save-btn"
                  >
                    {editingId !== null
                      ? "Update Patient"
                      : "Save Patient"}
                  </button>

                </div>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* PATIENT DETAILS MODAL */}
      {selectedPatient && (

        <div className="patient-overlay">

          <div className="patient-modal">

            <h2>Patient Details</h2>

            <div className="detail-row">
              <strong>Full Name</strong>
              {selectedPatient.name}
            </div>

            <div className="detail-row">
              <strong>Age</strong>
              {selectedPatient.age}
            </div>

            <div className="detail-row">
              <strong>Gender</strong>
              {selectedPatient.gender}
            </div>

            <div className="detail-row">
              <strong>Phone</strong>
              {selectedPatient.phone}
            </div>

            <div className="detail-row">
              <strong>Email</strong>
              {selectedPatient.email}
            </div>

            <div className="detail-row">
              <strong>Address</strong>
              {selectedPatient.address}
            </div>

            <div className="modal-actions">

              <button
                className="cancel-btn"
                onClick={() => setSelectedPatient(null)}
              >
                Close
              </button>

              <button
                className="save-btn"
                onClick={() => openEditForm(selectedPatient)}
              >
                Edit Patient
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );
}

export default Patients;
