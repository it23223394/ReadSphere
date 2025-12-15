import React, { useEffect, useState } from "react";
import { getRecommendations } from "../services/api";

function Recommendations() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRecommendations(1)
      .then(setBooks)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Recommended for You ✨</h2>

      {error && (
        <div className="text-red-600 mb-3">Failed to load recommendations: {error}</div>
      )}

      {books.map((book) => (
        <div key={book.id} className="p-4 border rounded mb-2">
          <h3 className="font-semibold">{book.title}</h3>
          <p className="text-sm text-gray-500">{book.genre}</p>
        </div>
      ))}

      {books.length === 0 && !error && (
        <p className="text-gray-600">No recommendations yet. Add some books and mark a few as READ.</p>
      )}
    </div>
  );
}

export default Recommendations;
