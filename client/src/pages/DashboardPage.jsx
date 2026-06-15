import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./dashboard/AdminDashboard";
import AssistantDashboard from "./dashboard/AssistantDashboard";
import StudentDashboard from "./dashboard/StudentDashboard";

const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>Praktikum Lab</h2>

        <div className="user-box">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
          <span className="role-badge">{user?.role}</span>
        </div>

        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        {user?.role === "admin" && <AdminDashboard />}
        {user?.role === "assistant" && <AssistantDashboard />}
        {user?.role === "student" && <StudentDashboard />}
      </main>
    </div>
  );
};

export default DashboardPage;
