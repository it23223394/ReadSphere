import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';
import {
  getProfile,
  getBooksByUser,
  updateBookProgress,
  addReadingLog,
  getReadingSummary,
  getReadingStreak,
  getReadingTimeline
} from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

export default function Tracking() {
  const [userId, setUserId] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [pages, setPages] = useState('');
  const [range, setRange] = useState('weekly');
  const [summary, setSummary] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    getProfile().then(p => {
      const uid = p?.id || p?.user?.id || 1;
      setUserId(uid);
    }).catch(() => setUserId(1));
  }, []);

  useEffect(() => {
    if (!userId) return;
    getBooksByUser(userId).then(setBooks);
    refreshStats(userId, range);
  }, [userId, range]);

  const refreshStats = async (uid, rng) => {
    const [s, st, tl] = await Promise.all([
      getReadingSummary(uid, rng),
      getReadingStreak(uid),
      getReadingTimeline(uid)
    ]);
    setSummary(s);
    setStreak(st);
    setTimeline(tl);
  };

  const onLog = async (e) => {
    e.preventDefault();
    if (!userId || !selectedBookId) return;
    const book = books.find(b => b.id === parseInt(selectedBookId, 10));
    const amt = Math.max(1, parseInt(pages || '0', 10));
    // 1) Update book progress so status/percentage are consistent
    const newPagesRead = Math.min(book.totalPages, (book.pagesRead || 0) + amt);
    await updateBookProgress(book.id, newPagesRead);
    // 2) Log the reading session
    await addReadingLog(userId, { bookId: book.id, pages: amt });
    setPages('');
    await refreshStats(userId, range);
    // Refresh books list to reflect updated pagesRead
    const updatedBooks = await getBooksByUser(userId);
    setBooks(updatedBooks);
  };

  const lineData = useMemo(() => ({
    labels: summary.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Pages Read',
        data: summary.map(d => d.pages),
        fill: false,
        borderColor: '#6b7ea6',
        backgroundColor: '#6b7ea6',
        tension: 0.3
      }
    ]
  }), [summary]);

  const barData = lineData; // same data, different viz

  return (
    <div>
      <Navbar />
      <div className="page">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold heading-primary">Reading Progress Tracker</h2>
          <Link to="/dashboard" className="btn btn-item">↩ Back to Dashboard</Link>
        </div>

        <div className="card mb-4">
          <h3 className="font-semibold mb-2">Log Reading Session</h3>
          <form onSubmit={onLog} className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <select className="input" value={selectedBookId} onChange={(e)=>setSelectedBookId(e.target.value)} required>
              <option value="" disabled>Choose a book</option>
              {books.map(b => (
                <option key={b.id} value={b.id}>{b.title} ({b.pagesRead}/{b.totalPages})</option>
              ))}
            </select>
            <input className="input" type="number" min={1} placeholder="Pages read" value={pages} onChange={(e)=>setPages(e.target.value)} required />
            <select className="input" value={range} onChange={(e)=>setRange(e.target.value)}>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>
            <button className="btn btn-toolbar" type="submit">+ Add Log & Update Progress</button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{range === 'weekly' ? 'This Week' : 'Last 30 Days'} — Line</h3>
            </div>
            <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
          <div className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{range === 'weekly' ? 'This Week' : 'Last 30 Days'} — Bar</h3>
            </div>
            <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="font-semibold mb-1">Reading Streaks</h3>
            <div className="text-sm">Current Streak: <span className="badge">{streak.currentStreak} days</span></div>
            <div className="text-sm">Longest Streak: <span className="badge">{streak.longestStreak} days</span></div>
          </div>
          <div className="card md:col-span-2">
            <h3 className="font-semibold mb-2">Reading Timeline</h3>
            <div className="text-sm text-muted mb-2">Most recent first</div>
            <div className="grid gap-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {timeline.map(item => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="text-sm">{item.date} — {item.book?.title || 'Book'} • {item.pages} pages</div>
                </div>
              ))}
              {timeline.length === 0 && (
                <div className="text-sm text-muted">No logs yet. Add your first reading session above.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
