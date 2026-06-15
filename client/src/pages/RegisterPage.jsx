import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";

const RegisterPage = () => {
  const [form, setForm] = useState({
    name: "",
    nrp: "",
    email: "",
    phone: "",
    password: "",
  });

  const [ktm, setKtm] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");
      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("nrp", form.nrp);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("password", form.password);

      if (ktm) {
        formData.append("ktm", ktm);
      }

      const response = await api.post("/auth/register/student", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage(response.data.message);

      setForm({
        name: "",
        nrp: "",
        email: "",
        phone: "",
        password: "",
      });

      setKtm(null);
    } catch (err) {
      setError(err.response?.data?.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card wide">
        <h1>Daftar Akun Praktikan</h1>
        <p className="muted">
          Akun akan diperiksa dulu oleh admin/asisten sebelum bisa login.
        </p>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label>Nama Lengkap</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama lengkap"
          />

          <label>NRP</label>
          <input
            name="nrp"
            value={form.nrp}
            onChange={handleChange}
            placeholder="502xxxxxxx"
          />

          <label>Email ITS</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="nama@student.its.ac.id"
          />

          <label>Nomor HP</label>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="08xxxxxxxxxx"
          />

          <label>Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Minimal 8 karakter"
          />

          <label>Foto KTM</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setKtm(e.target.files[0])}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Mendaftar..." : "Daftar"}
          </button>
        </form>

        <p className="bottom-text">
          Sudah punya akun? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
