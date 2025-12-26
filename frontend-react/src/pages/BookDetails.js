import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { getBookById } from '../services/api';

function BookDetails() {
  const { id } = useParams();
  const [book, setBook] = useState(null);

  useEffect(() => {
    getBookById(id).then(setBook);
  }, [id]);

  return (
    <div>
      <Navbar />
      <div className="page">
        <h2 className="text-2xl font-bold heading-primary mb-2">Book Details</h2>
        {!book ? (
          <div className="card">Loading...</div>
        ) : (
          <div className="card">
            {book.coverUrl && (
              <img src={book.coverUrl} alt={book.title} style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8 }} />
            )}
            <h3 className="text-xl font-semibold mb-1">{book.title}</h3>
            <div className="text-sm text-muted mb-2">{book.author} • {book.genre}</div>
            <div className="text-sm">Status: {book.status} • Progress: {book.pagesRead}/{book.totalPages}</div>
            {book.rating && <div className="text-sm">Rating: {book.rating} ⭐</div>}
            <hr className="my-3" />
            <h4 className="font-semibold mb-2">Notes</h4>
            {(book.notes && book.notes.length > 0) ? (
              book.notes.map(n => (
                <div key={n.id} className="text-sm mb-1">• {n.text}</div>
              ))
            ) : (
              <div className="text-sm text-muted">No notes yet.</div>
            )}
            <h4 className="font-semibold mt-3 mb-2">Quotes</h4>
            {(book.quotes && book.quotes.length > 0) ? (
              book.quotes.map(q => (
                <div key={q.id} className="text-sm mb-1">“{q.text}” — p.{q.pageNumber}</div>
              ))
            ) : (
              <div className="text-sm text-muted">No quotes yet.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
export default BookDetails;
