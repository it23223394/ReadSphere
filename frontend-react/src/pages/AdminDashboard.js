import React, { useState, useEffect } from 'react';
import { getAdminDashboard, getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminNavbar } from '../components/AdminNavbar';
import '../styles/Auth.css';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    fetchDashboardData();
  }, [role, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardData, usersData] = await Promise.all([
        getAdminDashboard(),
        getAllUsers()
      ]);
      
      setStats(dashboardData);
      setUsers(usersData);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminNavbar />
        <div className="container">
          <div className="loading-state">Loading admin dashboard...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminNavbar />
        <div className="container">
          <div className="error-message">{error}</div>
          <button onClick={fetchDashboardData} className="btn-primary">
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div className="container">
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <p className="subtitle">Welcome, Administrator</p>

        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>

          <div className="stat-card">
            <h3>Regular Users</h3>
            <div className="stat-value">{stats?.totalRegularUsers || 0}</div>
          </div>

          <div className="stat-card">
            <h3>Admins</h3>
            <div className="stat-value">{stats?.totalAdmins || 0}</div>
          </div>

          <div className="stat-card">
            <h3>Total Books</h3>
            <div className="stat-value">{stats?.totalBooks || 0}</div>
          </div>
        </div>

        {/* Users List */}
        <div className="users-section">
          <h2>All Users</h2>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Verified</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.emailVerified ? (
                        <span className="verified">✓ Yes</span>
                      ) : (
                        <span className="not-verified">✗ No</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default AdminDashboard;
