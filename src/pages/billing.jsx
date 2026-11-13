
import { useEffect, useState } from "react";

function Billing() {
  const [bills, setBills] = useState(() => {
    try {
      const savedBills = localStorage.getItem("bills");

      return savedBills
        ? JSON.parse(savedBills)
        : [
            {
              id: 1,
              patient: "Ali Ahmed",
              invoice: "INV-001",
              doctor: "Dr. Sarah Khan",
              service: "General Checkup",
              amount: 3000,
              status: "Paid"
            },
            {
              id: 2,
              patient: "Ayesha Noor",
              invoice: "INV-002",
              doctor: "Dr. Ahmed Ali",
              service: "Blood Test",
              amount: 2500,
              status: "Pending"
            }
          ];
    } catch {
      return [];
    }
  });

  const [patients, setPatients] = useState([]);
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Pending");

  useEffect(() => {
    localStorage.setItem("bills", JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    try {
      const savedPatients = JSON.parse(
        localStorage.getItem("patients") || "[]"
      );

      setPatients(
        Array.isArray(savedPatients) ? savedPatients : []
      );
    } catch {
      setPatients([]);
    }
  }, []);

  // Add New Bill
  const addBill = (e) => {
    e.preventDefault();

    if (!patient || !doctor.trim() || !service.trim() || !amount) {
      alert("Please fill all fields");
      return;
    }

    if (Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newBill = {
      id: Date.now(),
      patient,
      invoice: "INV-" + Date.now().toString().slice(-5),
      doctor,
      service,
      amount: Number(amount),
      status
    };

    setBills((prev) => [...prev, newBill]);

    setPatient("");
    setDoctor("");
    setService("");
    setAmount("");
    setStatus("Pending");
  };

  // Mark Pending Bill as Paid
  const markAsPaid = (id) => {
    setBills((prev) =>
      prev.map((bill) =>
        bill.id === id ? { ...bill, status: "Paid" } : bill
      )
    );
  };

  // Delete Bill
  const deleteBill = (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this bill?"
    );

    if (confirmDelete) {
      setBills((prev) => prev.filter((bill) => bill.id !== id));
    }
  };

  // Export Bills CSV
  const exportCSV = () => {
    if (bills.length === 0) {
      alert("No bills available to export.");
      return;
    }

    const headers = [
      "ID",
      "Invoice",
      "Patient",
      "Doctor",
      "Service",
      "Amount",
      "Status"
    ];

    const escapeCSV = (value) => {
      return `"${String(value ?? "").replace(/"/g, '""')}"`;
    };

    const rows = bills.map((bill) => [
      bill.id,
      bill.invoice,
      bill.patient,
      bill.doctor,
      bill.service,
      bill.amount,
      bill.status
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
    link.download = "billing.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Print Invoice
  const printInvoice = (bill) => {
    const printWindow = window.open("", "_blank", "width=800,height=700");

    if (!printWindow) {
      alert("Please allow pop-ups to print the invoice.");
      return;
    }

    const safe = (value) =>
      String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${safe(bill.invoice)}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #263f4c;
            background: #fff;
          }
          .invoice {
            max-width: 650px;
            margin: auto;
            padding: 30px;
            border: 1px solid #ddd;
            border-radius: 10px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #263f4c;
            padding-bottom: 20px;
            margin-bottom: 25px;
          }
          .header h1 {
            margin-bottom: 8px;
            color: #263f4c;
          }
          .invoice-info {
            margin-bottom: 25px;
            line-height: 2;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            padding: 13px;
            border: 1px solid #ddd;
            text-align: left;
          }
          th {
            background: #f0f4f8;
          }
          .total {
            text-align: right;
            font-size: 20px;
            font-weight: bold;
            margin-top: 25px;
          }
          .status {
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            color: #666;
          }
          .print-btn {
            display: block;
            margin: 25px auto 0;
            padding: 12px 25px;
            background: #263f4c;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          @media print {
            body { padding: 0; }
            .invoice { border: none; }
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>Hospital Management System</h1>
            <p>Patient Billing Invoice</p>
          </div>
          <div class="invoice-info">
            <p><strong>Invoice Number:</strong> ${safe(bill.invoice)}</p>
            <p><strong>Patient Name:</strong> ${safe(bill.patient)}</p>
            <p><strong>Doctor Name:</strong> ${safe(bill.doctor)}</p>
            <p><strong>Service:</strong> ${safe(bill.service)}</p>
          </div>
          <table>
            <thead>
              <tr><th>Description</th><th>Amount</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>${safe(bill.service)}</td>
                <td>Rs ${Number(bill.amount).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="total">
            Total: Rs ${Number(bill.amount).toLocaleString()}
          </div>
          <p>
            <strong>Payment Status:</strong>
            <span class="status">${safe(bill.status)}</span>
          </p>
          <div class="footer">
            <p>Thank you for choosing our hospital.</p>
          </div>
          <button class="print-btn" onclick="window.print()">
            Print Invoice
          </button>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  // Billing Calculations
  const total = bills.reduce(
    (sum, bill) => sum + Number(bill.amount || 0),
    0
  );

  const paid = bills
    .filter((bill) => bill.status === "Paid")
    .reduce(
      (sum, bill) => sum + Number(bill.amount || 0),
      0
    );

  const pending = bills
    .filter((bill) => bill.status === "Pending")
    .reduce(
      (sum, bill) => sum + Number(bill.amount || 0),
      0
    );

  return (
    <div className="billing-page">

      <div className="billing-header">
        <div>
          <span>BILLING MANAGEMENT</span>
          <h1>Billing & Payments</h1>
          <p>Manage hospital invoices and payments.</p>
        </div>
      </div>

      <div className="billing-stats">
        <div className="billing-card">
          <h3>Total Bills</h3>
          <h2>Rs {total.toLocaleString()}</h2>
        </div>

        <div className="billing-card">
          <h3>Paid Amount</h3>
          <h2>Rs {paid.toLocaleString()}</h2>
        </div>

        <div className="billing-card">
          <h3>Pending Amount</h3>
          <h2>Rs {pending.toLocaleString()}</h2>
        </div>
      </div>

      <div className="billing-form-card">
        <h2>Add New Bill</h2>

        <form onSubmit={addBill}>
          <div className="billing-form-grid">
            <select
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
              required
            >
              <option value="">Select Patient Name</option>
              {patients.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Doctor Name"
              value={doctor}
              onChange={(e) => setDoctor(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Service / Treatment"
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Amount (Rs)"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>

          {patients.length === 0 && (
            <p style={{ color: "#d3544c", marginTop: "12px" }}>
              No patients found. Please add patients from Patients page first.
            </p>
          )}

          <button type="submit" className="add-bill-btn">
            + Add Bill
          </button>
        </form>
      </div>

      <div className="billing-table-card">

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "18px"
        }}>
          <h2 style={{ margin: 0 }}>Recent Bills</h2>

          <button
            type="button"
            onClick={exportCSV}
            style={{
              background: "#198754",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            ↓ Export CSV
          </button>
        </div>

        <div className="billing-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Service</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.invoice}</td>
                  <td>{bill.patient}</td>
                  <td>{bill.doctor}</td>
                  <td>{bill.service}</td>
                  <td>Rs {Number(bill.amount).toLocaleString()}</td>

                  <td>
                    <span
                      className={
                        bill.status === "Paid"
                          ? "billing-paid"
                          : "billing-pending"
                      }
                    >
                      {bill.status}
                    </span>
                  </td>

                  <td>
                    {bill.status === "Pending" && (
                      <button
                        type="button"
                        onClick={() => markAsPaid(bill.id)}
                        style={{
                          background: "#0d6efd",
                          color: "white",
                          border: "none",
                          padding: "7px 12px",
                          borderRadius: "5px",
                          marginRight: "6px",
                          marginBottom: "5px",
                          cursor: "pointer"
                        }}
                      >
                        Mark as Paid
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => printInvoice(bill)}
                      style={{
                        background: "#198754",
                        color: "white",
                        border: "none",
                        padding: "7px 12px",
                        borderRadius: "5px",
                        marginRight: "6px",
                        marginBottom: "5px",
                        cursor: "pointer"
                      }}
                    >
                      Print
                    </button>

                    <button
                      type="button"
                      className="delete-bill-btn"
                      onClick={() => deleteBill(bill.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {bills.length === 0 && (
                <tr>
                  <td colSpan="7">No bills available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Billing;
