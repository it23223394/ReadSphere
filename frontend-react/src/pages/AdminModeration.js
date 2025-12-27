import React, { useEffect, useState } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  listModerationNotes,
  listModerationQuotes,
  deleteModerationNote,
  deleteModerationQuote
} from '../services/api';
import '../styles/Auth.css';

function AdminModeration() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('notes');
  const [flaggedOnly, setFlaggedOnly] = useState(true);
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, activeTab, flaggedOnly, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      if (activeTab === 'notes') {
        const data = await listModerationNotes({ flaggedOnly, search });
        setNotes(data || []);
      } else {
        const data = await listModerationQuotes({ flaggedOnly, search });
        setQuotes(data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load moderation items');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteModerationNote(id);
      setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete note');
    }
  };

  const handleDeleteQuote = async (id) => {
    if (!window.confirm('Delete this quote?')) return;
    try {
      await deleteModerationQuote(id);
      setQuotes((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete quote');
    }
  };

  const renderTable = () => {
    if (activeTab === 'notes') {
      return (
        <table className="users-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Text</th>
              <th>Flagged</th>
              <th>Reason</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {notes.length === 0 ? (
              <tr><td colSpan="6" className="text-center">No notes</td></tr>
            ) : (
              notes.map((n, idx) => (
                <tr key={n.id}>
                  <td>{idx + 1}</td>
                  <td className="text-ellipsis" title={n.text}>{n.text}</td>
                  <td>{n.flagged ? 'Yes' : 'No'}</td>
                  <td>{n.flagReason || '—'}</td>
                  <td>{n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-small btn-danger" onClick={() => handleDeleteNote(n.id)} title="Delete note">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    return (
      <table className="users-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Text</th>
            <th>Flagged</th>
            <th>Reason</th>
            <th>Page</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotes.length === 0 ? (
            <tr><td colSpan="6" className="text-center">No quotes</td></tr>
          ) : (
            quotes.map((q, idx) => (
              <tr key={q.id}>
                <td>{idx + 1}</td>
                <td className="text-ellipsis" title={q.text}>{q.text}</td>
                <td>{q.flagged ? 'Yes' : 'No'}</td>
                <td>{q.flagReason || '—'}</td>
                <td>{q.pageNumber || '—'}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-small btn-danger" onClick={() => handleDeleteQuote(q.id)} title="Delete quote">🗑️</button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  return (
    <>
      <AdminNavbar />
      <div className="container">
        <div className="admin-section">
          <div className="section-header" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              <h1>Moderation</h1>
              <p>Review flagged notes and quotes</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button className={`btn-secondary ${activeTab === 'notes' ? 'active' : ''}`} onClick={() => setActiveTab('notes')}>Notes</button>
              <button className={`btn-secondary ${activeTab === 'quotes' ? 'active' : ''}`} onClick={() => setActiveTab('quotes')}>Quotes</button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="search-box">
            <input
              type="text"
              placeholder="Search text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
              />
              Flagged only
            </label>
            <button className="btn-primary" onClick={fetchData} disabled={loading}>Refresh</button>
          </div>

          <div className="table-container">
            {loading ? <div className="loading-state">Loading...</div> : renderTable()}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminModeration;
