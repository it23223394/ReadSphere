import React, { useEffect, useState } from 'react';
import { AdminNavbar } from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAdminAnalyticsOverview, getAdminAnalyticsReading, getAdminAnalyticsCatalog } from '../services/api';
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
  const [catalog, setCatalog] = useState(null);
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
      const [ov, rd, cat] = await Promise.all([
        getAdminAnalyticsOverview(),
        getAdminAnalyticsReading(range),
        getAdminAnalyticsCatalog()
      ]);
      setOverview(ov);
      setReading(rd);
      setCatalog(cat);
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

  const catalogGenreData = () => {
    if (!catalog?.genreCount) return null;
    const labels = Object.keys(catalog.genreCount);
    const data = Object.values(catalog.genreCount);
    const colors = ['#d4a574', '#9d6f47', '#b8825e', '#7a5635', '#f0dcc8', '#c29968'];
    return {
      labels,
      datasets: [{
        label: 'Books by Genre',
        data,
        backgroundColor: labels.map((_, i) => colors[i % colors.length])
      }]
    };
  };

  const getFilteredGenreRatings = () => {
    if (!catalog?.genreAvgRating) return {};
    // Filter out genres with 0.0 rating
    return Object.fromEntries(
      Object.entries(catalog.genreAvgRating).filter(([_, rating]) => rating > 0)
    );
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

              <div className="users-section" style={{ marginTop: '30px' }}>
                <h2>Catalog Analytics</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'start' }}>
                  <div>
                    {catalogGenreData() ? <Bar data={catalogGenreData()} /> : <div className="text-center">No catalog data</div>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    {catalog && (
                      <div style={{ 
                        padding: '25px 35px', 
                        backgroundColor: '#f5e6d3', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: 'inline-block',
                        minWidth: '250px'
                      }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#5a3e2b', fontSize: '18px' }}>Catalog Summary</h3>
                        <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
                          <p style={{ margin: '8px 0' }}><strong style={{ color: '#5a3e2b' }}>Total Books:</strong> <span style={{ color: '#8c5f3b', fontSize: '17px', fontWeight: '600' }}>{catalog.totalBooks}</span></p>
                          <p style={{ margin: '8px 0' }}><strong style={{ color: '#5a3e2b' }}>Total Genres:</strong> <span style={{ color: '#8c5f3b', fontSize: '17px', fontWeight: '600' }}>{catalog.totalGenres}</span></p>
                        </div>
                      </div>
                    )}
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
