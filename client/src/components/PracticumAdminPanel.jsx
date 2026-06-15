import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const PracticumAdminPanel = () => {
  const { user } = useAuth();

  const [courses, setCourses] = useState([]);
  const [practicums, setPracticums] = useState([]);
  const [selectedPracticumId, setSelectedPracticumId] = useState("");
  const [schedules, setSchedules] = useState([]);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [courseForm, setCourseForm] = useState({
    code: "SPSD",
    name: "Sistem Pengolahan Sinyal Digital",
    description: "Praktikum Sistem Pengolahan Sinyal Digital",
  });

  const [practicumForm, setPracticumForm] = useState({
    courseId: "",
    title: "Praktikum Sistem Pengolahan Sinyal Digital - Genap 2026",
    academicYear: "2025/2026",
    semester: "genap",
    registrationStart: "",
    registrationEnd: "",
    guidebookTitle: "Guidebook Praktikum SPSD",
    guidebookText:
      "Praktikan wajib membaca ketentuan praktikum sebelum memilih jadwal dan kelompok. Setiap praktikan wajib mengikuti seluruh modul, mengumpulkan laporan tepat waktu, dan mematuhi aturan laboratorium.",
  });

  const [scheduleForm, setScheduleForm] = useState({
    label: "Sesi 1",
    day: "Jumat",
    startTime: "08:00",
    endTime: "10:00",
    room: "Lab SPSD",
    groupCount: 7,
    maxMembersPerGroup: 3,
  });

  const fetchCourses = async () => {
    const response = await api.get("/courses");
    setCourses(response.data.data);

    if (response.data.data.length > 0 && !practicumForm.courseId) {
      setPracticumForm((prev) => ({
        ...prev,
        courseId: response.data.data[0]._id,
      }));
    }
  };

  const fetchPracticums = async () => {
    const response = await api.get("/practicums");
    setPracticums(response.data.data);
  };

  const fetchSchedules = async (practicumId) => {
    if (!practicumId) return;

    const response = await api.get(`/practicums/${practicumId}/schedules`);
    setSchedules(response.data.data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCourses();
        await fetchPracticums();
      } catch (err) {
        setError(err.response?.data?.message || "Gagal mengambil data");
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedPracticumId) {
      fetchSchedules(selectedPracticumId);
    }
  }, [selectedPracticumId]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      const response = await api.post("/courses", courseForm);
      setMessage(response.data.message);

      await fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat mata kuliah");
    }
  };

  const handleCreatePracticum = async (e) => {
    e.preventDefault();

    try {
      setMessage("");
      setError("");

      const payload = {
        ...practicumForm,
        settings: {
          allowStudentChooseGroup: true,
          maxReschedulePerStudent: 1,
          groupLocked: false,
        },
      };

      const response = await api.post("/practicums", payload);
      setMessage(response.data.message);

      await fetchPracticums();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuka praktikum");
    }
  };

  const handleUpdateStatus = async (practicumId, status) => {
    try {
      setMessage("");
      setError("");

      const response = await api.patch(`/practicums/${practicumId}/status`, {
        status,
      });

      setMessage(response.data.message);
      await fetchPracticums();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mengubah status praktikum");
    }
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();

    if (!selectedPracticumId) {
      setError("Pilih praktikum terlebih dahulu");
      return;
    }

    try {
      setMessage("");
      setError("");

      const payload = {
        ...scheduleForm,
        groupCount: Number(scheduleForm.groupCount),
        maxMembersPerGroup: Number(scheduleForm.maxMembersPerGroup),
      };

      const response = await api.post(
        `/practicums/${selectedPracticumId}/schedules`,
        payload
      );

      setMessage(response.data.message);
      await fetchSchedules(selectedPracticumId);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal membuat jadwal");
    }
  };

  return (
    <div>
      <h1>Manajemen Praktikum</h1>
      <p className="muted">
        Kelola mata kuliah, buka praktikum, status pendaftaran, jadwal sesi, dan
        kelompok otomatis.
      </p>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      {user?.role === "admin" && (
        <section className="card">
          <h2>1. Buat Mata Kuliah</h2>

          <form className="grid-form" onSubmit={handleCreateCourse}>
            <div>
              <label>Kode Mata Kuliah</label>
              <input
                value={courseForm.code}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, code: e.target.value })
                }
              />
            </div>

            <div>
              <label>Nama Mata Kuliah</label>
              <input
                value={courseForm.name}
                onChange={(e) =>
                  setCourseForm({ ...courseForm, name: e.target.value })
                }
              />
            </div>

            <div>
              <label>Deskripsi</label>
              <input
                value={courseForm.description}
                onChange={(e) =>
                  setCourseForm({
                    ...courseForm,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-action">
              <button type="submit">Buat Mata Kuliah</button>
            </div>
          </form>
        </section>
      )}

      <section className="card">
        <h2>2. Buka Praktikum</h2>

        <form className="grid-form" onSubmit={handleCreatePracticum}>
          <div>
            <label>Mata Kuliah</label>
            <select
              value={practicumForm.courseId}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  courseId: e.target.value,
                })
              }
            >
              <option value="">Pilih mata kuliah</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code ? `${course.code} - ` : ""}
                  {course.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Judul Praktikum</label>
            <input
              value={practicumForm.title}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Tahun Akademik</label>
            <input
              value={practicumForm.academicYear}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  academicYear: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Semester</label>
            <select
              value={practicumForm.semester}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  semester: e.target.value,
                })
              }
            >
              <option value="ganjil">Ganjil</option>
              <option value="genap">Genap</option>
              <option value="pendek">Pendek</option>
            </select>
          </div>

          <div>
            <label>Mulai Pendaftaran</label>
            <input
              type="datetime-local"
              value={practicumForm.registrationStart}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  registrationStart: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Akhir Pendaftaran</label>
            <input
              type="datetime-local"
              value={practicumForm.registrationEnd}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  registrationEnd: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Judul Guidebook</label>
            <input
              value={practicumForm.guidebookTitle}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  guidebookTitle: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Isi Singkat Guidebook</label>
            <textarea
              rows="4"
              value={practicumForm.guidebookText}
              onChange={(e) =>
                setPracticumForm({
                  ...practicumForm,
                  guidebookText: e.target.value,
                })
              }
            />
          </div>

          <div className="form-action">
            <button type="submit">Buka Praktikum</button>
          </div>
        </form>
      </section>

      <section className="card">
        <h2>3. Daftar Praktikum</h2>

        {practicums.length === 0 ? (
          <p className="muted">Belum ada praktikum.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Judul</th>
                  <th>Mata Kuliah</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>

              <tbody>
                {practicums.map((practicum) => (
                  <tr key={practicum._id}>
                    <td>{practicum.title}</td>
                    <td>{practicum.course?.name}</td>
                    <td>
                      {practicum.semester} {practicum.academicYear}
                    </td>
                    <td>
                      <span className="status-badge">{practicum.status}</span>
                    </td>
                    <td>
                      <button
                        className="small-btn"
                        onClick={() =>
                          handleUpdateStatus(
                            practicum._id,
                            "open_registration"
                          )
                        }
                      >
                        Buka Pendaftaran
                      </button>

                      <button
                        className="small-btn"
                        onClick={() =>
                          handleUpdateStatus(
                            practicum._id,
                            "closed_registration"
                          )
                        }
                      >
                        Tutup
                      </button>

                      <button
                        className="small-btn"
                        onClick={() => setSelectedPracticumId(practicum._id)}
                      >
                        Kelola Jadwal
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
        <h2>4. Buat Jadwal dan Kelompok</h2>

        <label>Pilih Praktikum</label>
        <select
          value={selectedPracticumId}
          onChange={(e) => setSelectedPracticumId(e.target.value)}
        >
          <option value="">Pilih praktikum</option>
          {practicums.map((practicum) => (
            <option key={practicum._id} value={practicum._id}>
              {practicum.title}
            </option>
          ))}
        </select>

        <form className="grid-form schedule-form" onSubmit={handleCreateSchedule}>
          <div>
            <label>Label Sesi</label>
            <input
              value={scheduleForm.label}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, label: e.target.value })
              }
            />
          </div>

          <div>
            <label>Hari</label>
            <input
              value={scheduleForm.day}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, day: e.target.value })
              }
            />
          </div>

          <div>
            <label>Jam Mulai</label>
            <input
              type="time"
              value={scheduleForm.startTime}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, startTime: e.target.value })
              }
            />
          </div>

          <div>
            <label>Jam Selesai</label>
            <input
              type="time"
              value={scheduleForm.endTime}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, endTime: e.target.value })
              }
            />
          </div>

          <div>
            <label>Ruangan</label>
            <input
              value={scheduleForm.room}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, room: e.target.value })
              }
            />
          </div>

          <div>
            <label>Jumlah Kelompok</label>
            <input
              type="number"
              min="1"
              value={scheduleForm.groupCount}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  groupCount: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label>Anggota per Kelompok</label>
            <input
              type="number"
              min="1"
              value={scheduleForm.maxMembersPerGroup}
              onChange={(e) =>
                setScheduleForm({
                  ...scheduleForm,
                  maxMembersPerGroup: e.target.value,
                })
              }
            />
          </div>

          <div className="form-action">
            <button type="submit">Buat Jadwal + Kelompok</button>
          </div>
        </form>

        <div className="schedule-list">
          {schedules.length === 0 ? (
            <p className="muted">Belum ada jadwal untuk praktikum ini.</p>
          ) : (
            schedules.map((schedule) => (
              <div className="schedule-card" key={schedule._id}>
                <h3>
                  {schedule.label} - {schedule.day}, {schedule.startTime}-
                  {schedule.endTime}
                </h3>
                <p className="muted">
                  Ruangan: {schedule.room || "-"} | Kapasitas total:{" "}
                  {schedule.totalCapacity}
                </p>

                <div className="group-grid">
                  {schedule.groups.map((group) => (
                    <div className="group-box" key={group._id}>
                      <strong>Kelompok {group.groupNumber}</strong>
                      <span>
                        {group.currentMembers}/{group.maxMembers} anggota
                      </span>
                      <small>Sisa slot: {group.remainingSlots}</small>

                      <ul>
                        {group.members.length === 0 ? (
                          <li className="muted">Belum ada anggota</li>
                        ) : (
                          group.members.map((member) => (
                            <li key={member._id}>
                              {member.name} - {member.nrp}
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default PracticumAdminPanel;
