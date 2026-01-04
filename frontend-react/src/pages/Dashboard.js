import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Link } from 'react-router-dom';
import {
  getProfile,
  getBooksByUser,
  getUserBooks,
  getReadingStreak,
  getReadingSummary,
  getReadingTimeline
} from '../services/api';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function Dashboard() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [books, setBooks] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [summary, setSummary] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getProfile();
        const uid = profile?.id || profile?.user?.id || localStorage.getItem('userId');
        setUserId(uid);
        setUserName(profile?.name || profile?.user?.name || 'Reader');
      } catch (err) {
        const uid = localStorage.getItem('userId') || 1;
        setUserId(uid);
        setUserName('Reader');
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      try {
        const [legacyBooks, catalogBooks, s, tl] = await Promise.all([
          getBooksByUser(userId),
          getUserBooks(userId),
          getReadingSummary(userId, 'weekly'),
          getReadingTimeline(userId)
        ]);
        // Transform catalogBooks to match book format
        const transformedCatalogBooks = catalogBooks.map(ub => ({
          id: `catalog_${ub.id}`,
          title: ub.book.title,
          author: ub.book.author,
          genre: ub.book.genre,
          coverUrl: ub.book.coverUrl,
          totalPages: ub.book.totalPages,
          pagesRead: ub.pagesRead || 0,
          status: ub.status,
          rating: ub.rating,
          description: ub.book.description,
          isFromCatalog: true
        }));
        // Combine both arrays
        setBooks([...transformedCatalogBooks, ...(legacyBooks || [])]);
        setSummary(s || []);
        setTimeline(tl || []);
        const st = await getReadingStreak(userId);
        setStreak(st || { currentStreak: 0, longestStreak: 0 });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        // Fallback to just legacy books if catalog fetch fails
        try {
          const legacyBooks = await getBooksByUser(userId);
          setBooks(legacyBooks || []);
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const totals = useMemo(() => {
    const totalBooks = books.length;
    const currentReads = books.filter(b => {
      const status = (b.status || '').toLowerCase();
      const hasReading = (b.pagesRead || 0) > 0 && (b.pagesRead || 0) < (b.totalPages || Infinity);
      const isReading = status === 'in progress' || status === 'currently reading' || status === 'reading';
      return isReading || hasReading;
    }).length;
    const wantToRead = books.filter(b => {
      const status = (b.status || '').toLowerCase();
      return status === 'want_to_read' || status === 'want to read' || status === 'planning';
    }).length;
    const pagesRead = books.reduce((acc, b) => acc + (b.pagesRead || 0), 0);
    return { totalBooks, currentReads, wantToRead, pagesRead };
  }, [books]);

  const currentlyReading = useMemo(() => {
    return books
      .filter(b => {
        const status = (b.status || '').toLowerCase();
        const hasReading = (b.pagesRead || 0) > 0 && (b.pagesRead || 0) < (b.totalPages || Infinity);
        return status === 'in progress' || status === 'currently reading' || hasReading;
      })
      .sort((a, b) => (b.pagesRead || 0) - (a.pagesRead || 0))
      .slice(0, 3);
  }, [books]);

  const lineData = useMemo(() => ({
    labels: summary.map(d => d.date.slice(5)),
    datasets: [
      {
        label: 'Pages Read',
        data: summary.map(d => d.pages),
        fill: false,
        borderColor: '#e3c4a5',
        backgroundColor: '#e3c4a5',
        tension: 0.3
      }
    ]
  }), [summary]);

  return (
    <div>
      <Navbar />
      <div className="page">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold heading-primary">Welcome back, {userName} 👋</h1>
            <p className="mt-1 text-muted">Quick view of your reading journey.</p>
          </div>
        </div>

        {loading ? (
          <div className="card">Loading...</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 stagger-slide-up">
              <div className="card hover-lift">
                <div className="text-sm text-muted">Total Books</div>
                <div className="text-2xl font-semibold">{totals.totalBooks}</div>
              </div>
              <div className="card hover-lift">
                <div className="text-sm text-muted">Current Reads</div>
                <div className="text-2xl font-semibold">{totals.currentReads}</div>
              </div>
              <div className="card hover-lift">
                <div className="text-sm text-muted">Want To Read</div>
                <div className="text-2xl font-semibold">{totals.wantToRead}</div>
              </div>
              <div className="card hover-lift">
                <div className="text-sm text-muted">Pages Read (all time)</div>
                <div className="text-2xl font-semibold">{totals.pagesRead}</div>
              </div>
              <div className="card hover-lift">
                <div className="text-sm text-muted">Current Streak</div>
                <div className="text-2xl font-semibold">{streak.currentStreak} days</div>
                <div className="text-xs text-muted">Longest: {streak.longestStreak} days</div>
              </div>
            </div>

            {/* Charts and lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
              <div className="card lg:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">This Week</h3>
                  <Link to="/tracking" className="text-sm text-muted">Open tracker →</Link>
                </div>
                {summary.length === 0 ? (
                  <div className="text-sm text-muted">No reading logs yet.</div>
                ) : (
                  <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
                )}
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Currently Reading</h3>
                  <Link to="/bookshelf" className="text-sm text-muted">Manage →</Link>
                </div>
                {currentlyReading.length === 0 ? (
                  <div className="text-sm text-muted">No books in progress.</div>
                ) : (
                  <div className="grid gap-2">
                    {currentlyReading.map(b => (
                      <div key={b.id} className="p-2 rounded border" style={{ borderColor: 'var(--color-border)' }}>
                        <div className="font-semibold text-sm">{b.title}</div>
                        <div className="text-xs text-muted">{b.author} • {b.pagesRead}/{b.totalPages} pages</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">Recent Activity</h3>
                <Link to="/tracking" className="text-sm text-muted">View all →</Link>
              </div>
              {timeline.length === 0 ? (
                <div className="text-sm text-muted">No logs yet. Log a session to see activity here.</div>
              ) : (
                <div className="grid gap-2" style={{ maxHeight: 280, overflowY: 'auto' }}>
                  {timeline.slice(0, 8).map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div>{item.date} — {item.book?.title || 'Book'} • {item.pages} pages</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
