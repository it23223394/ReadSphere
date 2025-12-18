import React, { useEffect, useState } from "react";
import { getRecommendations } from "../services/api";
import { Navbar } from "../components/Navbar";

function Recommendations() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRecommendations(1)
      .then(setBooks)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="page">
      <h2 className="text-2xl font-bold mb-4 heading-primary">Recommended for You ✨</h2>

      {error && (
        <div className="text-error mb-3">Failed to load recommendations: {error}</div>
      )}

      {books.map((book) => (
        <div key={book.id} className="card mb-2">
          <h3 className="font-semibold">{book.title}</h3>
          <p className="text-sm text-muted">{book.genre}</p>
        </div>
      ))}

      {books.length === 0 && !error && (
        <p className="text-muted">No recommendations yet. Add some books and mark a few as READ.</p>
      )}
      </div>
    </div>
  );
}

export default Recommendations;
