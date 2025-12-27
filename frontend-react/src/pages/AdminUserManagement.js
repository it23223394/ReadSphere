import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, deactivateUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminNavbar } from '../components/AdminNavbar';
import '../styles/Auth.css';

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleting, setDeleting] = useState(null);
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [role, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      setDeleting(userId);
      await deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) {
      return;
    }

    try {
      setDeleting(userId);
      await deactivateUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to deactivate user');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading-state">Loading users...</div></div>;
  }

  return (
    <>
      <AdminNavbar />
      <div className="container">
      <div className="admin-section">
        <div className="section-header">
          <h1>User Management</h1>
          <p>Manage all platform users</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-count">{filteredUsers.length} users</span>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center">No users found</td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.emailVerified ? (
                        <span className="verified">✓</span>
                      ) : (
                        <span className="not-verified">✗</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleDelete(user.id)}
                          disabled={deleting === user.id}
                          title="Delete user"
                        >
                          {deleting === user.id ? '...' : '🗑️'}
                        </button>
                        <button
                          className="btn-small btn-warning"
                          onClick={() => handleDeactivate(user.id)}
                          disabled={deleting === user.id}
                          title="Deactivate user"
                        >
                          {deleting === user.id ? '...' : '🔒'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </>
  );
}

export default AdminUserManagement;
