import React, { useEffect, useState } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminAnalyticsOverview, getAdminAnalyticsReading } from '../services/api';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import '../styles/Auth.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function AdminAnalytics() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const [overview, setOverview] = useState(null);
  const [reading, setReading] = useState(null);
  const [range, setRange] = useState('weekly');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, navigate, range]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [ov, rd] = await Promise.all([
        getAdminAnalyticsOverview(),
        getAdminAnalyticsReading(range)
      ]);
      setOverview(ov);
      setReading(rd);
    } catch (err) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const renderCards = () => {
    if (!overview) return null;
    const cards = [
      { label: 'Users', value: overview.totalUsers },
      { label: 'Admins', value: overview.totalAdmins },
      { label: 'Regular Users', value: overview.totalRegularUsers },
      { label: 'Catalog Books', value: overview.totalCatalogBooks },
      { label: 'User Books', value: overview.totalUserBooks },
      { label: 'Notes', value: overview.totalNotes },
      { label: 'Quotes', value: overview.totalQuotes },
    ];
    return (
      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.label}>
            <h3>{card.label}</h3>
            <div className="stat-value">{card.value ?? '—'}</div>
          </div>
        ))}
      </div>
    );
  };

  const dailyBarData = () => {
    if (!reading?.dailyPages) return null;
    const labels = reading.dailyPages.map(d => d.date);
    const data = reading.dailyPages.map(d => d.pages);
    return {
      labels,
      datasets: [{
        label: `Pages per day (${reading.range})`,
        data,
        backgroundColor: '#8c5f3b'
      }]
    };
  };

  const genreDoughnutData = () => {
    if (!reading?.genreBreakdown) return null;
    const labels = Object.keys(reading.genreBreakdown);
    const data = Object.values(reading.genreBreakdown);
    const colors = ['#c9a66b', '#8c5f3b', '#a6785a', '#6f472e', '#e0c3a1', '#b28654'];
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length])
      }]
    };
  };

  return (
    <>
      <AdminNavbar />
      <div className="container">
        <div className="admin-section">
          <div className="section-header">
            <h1>Analytics</h1>
            <p>Overview metrics and Reading Insights</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-state">Loading analytics...</div>
          ) : (
            <>
              {renderCards()}
              <div className="users-section" style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h2>Reading Insights</h2>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <label>Range</label>
                    <select value={range} onChange={(e) => setRange(e.target.value)}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    {dailyBarData() ? <Bar data={dailyBarData()} /> : <div className="text-center">No daily data</div>}
                  </div>
                  <div>
                    {genreDoughnutData() ? <Doughnut data={genreDoughnutData()} /> : <div className="text-center">No genre data</div>}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminAnalytics;
