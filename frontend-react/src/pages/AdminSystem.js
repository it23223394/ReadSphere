import React, { useEffect, useState } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminSystemHealth, getAdminSystemLogs } from '../services/api';
import '../styles/Auth.css';

function AdminSystem() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [h, l] = await Promise.all([
        getAdminSystemHealth(),
        getAdminSystemLogs()
      ]);
      setHealth(h);
      setLogs(l);
    } catch (err) {
      setError(err.message || 'Failed to load system info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div className="container">
        <div className="admin-section">
          <div className="section-header">
            <h1>System</h1>
            <p>Health and logs placeholders</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-state">Loading system info...</div>
          ) : (
            <>
              <div className="users-section">
                <h2>Health</h2>
                <p>Status: <strong>{health?.status || 'Unknown'}</strong></p>
                <p>Message: {health?.message || '—'}</p>
                <p>Timestamp: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : '—'}</p>
              </div>

              <div className="users-section" style={{ marginTop: '16px' }}>
                <h2>Logs</h2>
                <p>{logs?.message || 'No logs available in this demo.'}</p>
                {logs?.hint && <div className="info-message">{logs.hint}</div>}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminSystem;
