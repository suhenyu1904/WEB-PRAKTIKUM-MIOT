import PracticumAdminPanel from "../../components/PracticumAdminPanel";

const AssistantDashboard = () => {
  return (
    <div>
      <h1>Dashboard Asisten Praktikum</h1>
      <p className="muted">
        Asisten dapat mengelola praktikum, jadwal, kelompok, modul, penilaian,
        reschedule, dan pengumuman.
      </p>

      <PracticumAdminPanel />
    </div>
  );
};

export default AssistantDashboard;
