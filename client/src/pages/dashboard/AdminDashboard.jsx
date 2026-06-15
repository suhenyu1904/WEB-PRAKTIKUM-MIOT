import { useEffect, useState } from "react";
import api from "../../api/api";
import PracticumAdminPanel from "../../components/PracticumAdminPanel";

const AdminDashboard = () => {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [assistantForm, setAssistantForm] = useState({
    name: "",
    nrp: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPendingStudents = async () => {
    try {
      const response = await api.get("/admin/students/pending");
      setPendingStudents(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengambil data pending");
    }
  };

  useEffect(() => {
    fetchPendingStudents();
  }, []);

  const handleVerification = async (studentId, status) => {
    try {
      setError("");
      setMessage("");

      await api.patch(`/admin/students/${studentId}/verification`, {
        status,
        reason: status === "rejected" ? "Data tidak valid" : undefined,
      });

      setMessage(`Akun praktikan berhasil di-${status}`);
      fetchPendingStudents();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal update status");
    }
  };

  const handleAssistantChange = (e) => {
    setAssistantForm({
      ...assistantForm,
      [e.target.name]: e.target.value,
    });
  };

  const createAssistant = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const response = await api.post("/admin/assistants", assistantForm);

      setMessage(response.data.message);

      setAssistantForm({
        name: "",
        nrp: "",
        email: "",
        phone: "",
        password: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat asisten");
    }
  };

  return (
    <div>
      <h1>Dashboard Admin</h1>
      <p className="muted">
        Kelola akun praktikan pending, akun asisten, mata kuliah, praktikum,
        jadwal, dan kelompok.
      </p>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <section className="card">
        <h2>Akun Praktikan Pending</h2>

        {pendingStudents.length === 0 ? (
          <p className="muted">Tidak ada akun pending.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Nama</th>
                  <th>NRP</th>
                  <th>Email</th>
                  <th>No HP</th>
                  <th>KTM</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {pendingStudents.map((student) => (
                  <tr key={student._id}>
                    <td>{student.name}</td>
                    <td>{student.nrp}</td>
                    <td>{student.email}</td>
                    <td>{student.phone}</td>
                    <td>
                      {student.ktmImage ? (
                        <a
                          href={`http://localhost:5000/${student.ktmImage}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Lihat KTM
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>
                      <button
                        className="small-btn"
                        onClick={() =>
                          handleVerification(student._id, "approved")
                        }
                      >
                        Approve
                      </button>

                      <button
                        className="small-btn danger"
                        onClick={() =>
                          handleVerification(student._id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>Buat Akun Asisten</h2>

        <form className="grid-form" onSubmit={createAssistant}>
          <div>
            <label>Nama</label>
            <input
              name="name"
              value={assistantForm.name}
              onChange={handleAssistantChange}
              placeholder="Nama asisten"
            />
          </div>

          <div>
            <label>NRP</label>
            <input
              name="nrp"
              value={assistantForm.nrp}
              onChange={handleAssistantChange}
              placeholder="502xxxxxxx"
            />
          </div>

          <div>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={assistantForm.email}
              onChange={handleAssistantChange}
              placeholder="asisten@its.ac.id"
            />
          </div>

          <div>
            <label>Nomor HP</label>
            <input
              name="phone"
              value={assistantForm.phone}
              onChange={handleAssistantChange}
              placeholder="08xxxxxxxxxx"
            />
          </div>

          <div>
            <label>Password</label>
            <input
              name="password"
              type="password"
              value={assistantForm.password}
              onChange={handleAssistantChange}
              placeholder="Minimal 8 karakter"
            />
          </div>

          <div className="form-action">
            <button type="submit">Buat Asisten</button>
          </div>
        </form>
      </section>

      <PracticumAdminPanel />
    </div>
  );
};

export default AdminDashboard;
