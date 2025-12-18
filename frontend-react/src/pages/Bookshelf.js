import { useEffect, useState } from "react";
import { getBooks } from "../services/api";
import { Navbar } from "../components/Navbar";

function Bookshelf() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    getBooks().then(setBooks);
  }, []);

  const downloadPdf = (endpoint, filename) => {
    fetch(`http://localhost:8080/api/pdf/${endpoint}/1`)
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(err => console.error('Download failed:', err));
  };

  return (
    <div>
      <Navbar />
      <div className="page">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold heading-primary">My Bookshelf</h2>
        
        <div className="flex gap-2">
          <button
            onClick={() => downloadPdf('favorites', 'favorites.pdf')}
            className="btn"
          >
            📥 Download Favorites
          </button>
          <button
            onClick={() => downloadPdf('top5', 'top5-books.pdf')}
            className="btn btn-secondary"
          >
            ⭐ Download Top 5
          </button>
          <button
            onClick={() => downloadPdf('all', 'my-books.pdf')}
            className="btn btn-tertiary"
          >
            📚 Download All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {books.map(book => (
          <div key={book.id} className="card">
            <h3 className="font-bold">{book.title}</h3>
            <p className="text-sm text-muted">{book.author}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default Bookshelf;
