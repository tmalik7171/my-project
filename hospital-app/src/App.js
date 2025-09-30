import React, { useState } from "react";

function App() {
  // Initial patient list
  const [patients, setPatients] = useState([
    { id: 1, name: "Amit Sharma", disease: "Diabetes" },
    { id: 2, name: "Priya Singh", disease: "Asthma" },
    { id: 3, name: "Rahul Verma", disease: "Hypertension" },
  ]);

  // Function to remove a patient
  const removePatient = (id) => {
    setPatients(patients.filter((patient) => patient.id !== id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏥 Hospital Patients</h1>

      {patients.map((patient) => (
        <div
          key={patient.id}
          style={{
            border: "1px solid black",
            margin: "10px 0",
            padding: "10px",
            borderRadius: "5px",
          }}
        >
          <h2>{patient.name}</h2>
          <p>Disease: {patient.disease}</p>
          <button onClick={() => removePatient(patient.id)}>Remove</button>
        </div>
      ))}

      {patients.length === 0 && <p>No patients left ✅</p>}
    </div>
  );
}

export default App;
