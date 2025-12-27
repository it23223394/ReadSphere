import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, getRecommendations, submitRecommendationFeedback, addBookToShelf } from "../services/api";
import { Navbar } from "../components/Navbar";
import { Link } from "react-router-dom";

function Recommendations() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackStatus, setFeedbackStatus] = useState({});
  const [addingToShelf, setAddingToShelf] = useState({});

  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getProfile();
        const uid = profile?.id || profile?.user?.id || localStorage.getItem('userId');
        setUserId(uid);
      } catch (err) {
        setUserId(localStorage.getItem('userId') || 1);
      }
    };
    init();
  }, [user]);

  const loadRecommendations = async (opts = {}) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getRecommendations(userId, { ...opts, source: 'catalog' });
      setRecs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const byGenre = useMemo(() => {
    const grouped = {};
    recs.forEach(b => {
      const g = b.genre || 'General';
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push(b);
    });
    return Object.entries(grouped);
  }, [recs]);

  const handleFeedback = async (bookId, feedback) => {
    if (!userId) return;
    setFeedbackStatus((prev) => ({ ...prev, [bookId]: 'pending' }));
    try {
      const result = await submitRecommendationFeedback(userId, bookId, feedback);
      setFeedbackStatus((prev) => ({ ...prev, [bookId]: feedback }));
      console.log('Feedback submitted:', result);
    } catch (err) {
      console.error('Feedback error:', err);
      setFeedbackStatus((prev) => ({ ...prev, [bookId]: 'error' }));
      setError(err.message);
      // Clear error after 3 seconds
      setTimeout(() => {
        setFeedbackStatus((prev) => {
          const next = { ...prev };
          delete next[bookId];
          return next;
        });
      }, 3000);
    }
  };

  const handleAddToShelf = async (catalogBookId) => {
    if (!userId) {
      console.error('No userId available');
      return;
    }
    console.log(`Adding book ${catalogBookId} to shelf for user ${userId}`);
    setAddingToShelf((prev) => ({ ...prev, [catalogBookId]: true }));
    try {
      const result = await addBookToShelf(userId, catalogBookId, 'WANT_TO_READ');
      console.log('Book added:', result);
      setAddingToShelf((prev) => {
        const next = { ...prev };
        delete next[catalogBookId];
        next[`added_${catalogBookId}`] = true;
        return next;
      });
    } catch (err) {
      console.error('Add to shelf error:', err);
      setAddingToShelf((prev) => {
        const next = { ...prev };
        delete next[catalogBookId];
        return next;
      });
      setError(err.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="page">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold heading-primary">Recommended for You ✨</h2>
            <p className="text-muted">Discover books from our catalog based on your reading history and preferences.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-toolbar" disabled={loading} onClick={() => loadRecommendations({ refresh: true })}>Refresh</button>
          </div>
        </div>

        {loading && <div className="card">Loading recommendations...</div>}
        {error && <div className="text-error mb-3">Failed to load recommendations: {error}</div>}

        {!loading && !error && recs.length === 0 && (
          <div className="card">
            <p className="text-muted">No recommendations yet. Mark a few books as Read to personalize this list.</p>
            <div className="mt-2 flex gap-2">
              <Link to="/bookshelf" className="btn btn-item">Add books</Link>
              <Link to="/tracking" className="btn btn-toolbar">Log reading</Link>
            </div>
          </div>
        )}

        <div className="grid gap-4">
          {byGenre.map(([genre, items]) => (
            <div key={genre} className="card">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{genre}</h3>
                <span className="text-xs text-muted">{items.length} picks</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(book => (
                  <div key={book.bookId} className="p-3 rounded border" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="font-semibold text-sm">{book.title}</div>
                    <div className="text-xs text-muted">{book.author || 'Unknown author'}</div>
                    {book.description && (
                      <p className="text-xs mt-2 text-muted">{book.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {!addingToShelf[`added_${book.bookId}`] ? (
                        <button
                          className="btn btn-toolbar text-xs"
                          disabled={addingToShelf[book.bookId]}
                          onClick={() => handleAddToShelf(book.bookId)}
                        >
                          {addingToShelf[book.bookId] ? 'Adding...' : '+ Add to Shelf'}
                        </button>
                      ) : (
                        <span className="text-xs text-success">✓ Added!</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Recommendations;
