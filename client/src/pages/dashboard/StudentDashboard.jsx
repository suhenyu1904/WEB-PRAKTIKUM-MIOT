import { useEffect, useState } from "react";
import api from "../../api/api";

const StudentDashboard = () => {
  const [practicums, setPracticums] = useState([]);
  const [selectedPracticum, setSelectedPracticum] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);

  const [acceptedGuidebook, setAcceptedGuidebook] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchPracticums = async () => {
    const response = await api.get("/practicums");
    setPracticums(response.data.data);
  };

  const fetchMyEnrollments = async () => {
    const response = await api.get("/enrollments/me");
    setMyEnrollments(response.data.data);
  };

  const fetchSchedules = async (practicum) => {
    setSelectedPracticum(practicum);
    setAcceptedGuidebook(false);
    setMessage("");
    setError("");

    const response = await api.get(`/practicums/${practicum._id}/schedules`);
    setSchedules(response.data.data);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchPracticums();
        await fetchMyEnrollments();
      } catch (err) {
        setError(err.response?.data?.message || "Gagal mengambil data");
      }
    };

    loadData();
  }, []);

  const handleEnroll = async (groupId) => {
    try {
      setMessage("");
      setError("");

      if (!acceptedGuidebook) {
        setError("Kamu harus membaca dan menyetujui guidebook terlebih dahulu");
        return;
      }

      const response = await api.post(
        `/enrollments/practicums/${selectedPracticum._id}/groups/${groupId}`,
        {
          guidebookAccepted: true,
        }
      );

      setMessage(response.data.message);

      await fetchMyEnrollments();
      await fetchSchedules(selectedPracticum);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal mendaftar praktikum");
    }
  };

  const isAlreadyEnrolled = (practicumId) => {
    return myEnrollments.some(
      (enrollment) =>
        enrollment.practicumOffering?._id === practicumId &&
        enrollment.status === "registered"
    );
  };

  return (
    <div>
      <h1>Dashboard Praktikan</h1>
      <p className="muted">
        Pilih praktikum yang tersedia, baca guidebook, lalu pilih jadwal dan
        kelompok.
      </p>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}

      <section className="card">
        <h2>Praktikum yang Dibuka</h2>

        {practicums.length === 0 ? (
          <p className="muted">Belum ada praktikum yang dibuka.</p>
        ) : (
          <div className="practicum-grid">
            {practicums.map((practicum) => (
              <div className="practicum-card" key={practicum._id}>
                <h3>{practicum.title}</h3>
                <p>{practicum.course?.name}</p>
                <p className="muted">
                  {practicum.semester} - {practicum.academicYear}
                </p>

                <span className="status-badge">{practicum.status}</span>

                {isAlreadyEnrolled(practicum._id) ? (
                  <button disabled>Sudah Terdaftar</button>
                ) : (
                  <button onClick={() => fetchSchedules(practicum)}>
                    Pilih Jadwal
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedPracticum && (
        <section className="card">
          <h2>{selectedPracticum.guidebookTitle || "Guidebook Praktikum"}</h2>

          <div className="guidebook-box">
            <p>{selectedPracticum.guidebookText}</p>
          </div>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={acceptedGuidebook}
              onChange={(e) => setAcceptedGuidebook(e.target.checked)}
            />
            Saya sudah membaca dan menyetujui ketentuan praktikum.
          </label>
        </section>
      )}

      {selectedPracticum && (
        <section className="card">
          <h2>Pilih Jadwal dan Kelompok</h2>

          {schedules.length === 0 ? (
            <p className="muted">Belum ada jadwal tersedia.</p>
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

                      <small>
                        {group.isFull
                          ? "Kelompok penuh"
                          : `Sisa slot: ${group.remainingSlots}`}
                      </small>

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

                      <button
                        disabled={group.isFull || !acceptedGuidebook}
                        onClick={() => handleEnroll(group._id)}
                      >
                        {group.isFull ? "Penuh" : "Masuk Kelompok Ini"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      )}

      <section className="card">
        <h2>Praktikum Saya</h2>

        {myEnrollments.length === 0 ? (
          <p className="muted">Kamu belum terdaftar praktikum.</p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Praktikum</th>
                  <th>Jadwal</th>
                  <th>Kelompok</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {myEnrollments.map((enrollment) => (
                  <tr key={enrollment._id}>
                    <td>{enrollment.practicumOffering?.title}</td>
                    <td>
                      {enrollment.scheduleSession?.day},{" "}
                      {enrollment.scheduleSession?.startTime}-
                      {enrollment.scheduleSession?.endTime}
                    </td>
                    <td>Kelompok {enrollment.group?.groupNumber}</td>
                    <td>{enrollment.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default StudentDashboard;
