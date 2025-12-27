import { useEffect, useRef, useState } from "react";
import { 
  getBooksByUser,
  getUserBooks,
  searchBooks,
  filterBooksByStatus,
  createBook,
  updateBook,
  deleteBook,
  deleteUserBook,
  
  importBooksCSV,
  getBookById,
    getProfile
} from "../services/api";
import { Navbar } from "../components/Navbar";
import { Link } from "react-router-dom";
import Modal from "../components/Modal";
import StarRating from "../components/StarRating";

function Bookshelf() {
  const [books, setBooks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", author: "", genre: "", totalPages: 1, pagesRead: 0, status: "WANT_TO_READ", rating: null });
  const [editing, setEditing] = useState(null);
  const [csvFile, setCsvFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getProfile().then(p => {
      const uid = p?.id || p?.user?.id; // support different profile shapes
      setUserId(uid || 1);
    }).catch(() => setUserId(1));
  }, []);

  useEffect(() => {
    if (userId) {
      Promise.all([
        getBooksByUser(userId),
        getUserBooks(userId)
      ]).then(([legacyBooks, catalogBooks]) => {
        // Transform catalogBooks from UserBook format to Books format for display
        const transformedCatalogBooks = catalogBooks.map(ub => ({
          id: `catalog_${ub.id}`, // prefix to avoid conflicts
          title: ub.book.title,
          author: ub.book.author,
          genre: ub.book.genre,
          coverUrl: ub.book.coverUrl,
          totalPages: ub.book.totalPages,
          pagesRead: ub.pagesRead || 0,
          status: ub.status,
          rating: ub.rating,
          description: ub.book.description,
          isFromCatalog: true,
          userBookId: ub.id // for updates
        }));
        // Combine both arrays
        setBooks([...transformedCatalogBooks.map(b => ({...b, coverUrl: b.coverUrl })), ...legacyBooks]);
      }).catch(err => {
        console.error('Failed to load books:', err);
        getBooksByUser(userId).then(setBooks);
      });
    }
  }, [userId]);

  const downloadPdf = (endpoint, filename) => {
    const uid = userId || 1;
    fetch(`http://localhost:8080/api/pdf/${endpoint}/${uid}`)
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

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQ(value);
    if (!userId) return;
    const result = await searchBooks(userId, value);
    setBooks(result);
  };

  const handleFilter = async (e) => {
    const value = e.target.value;
    setStatus(value);
    if (!userId) return;
    if (!value) {
      const all = await getBooksByUser(userId);
      setBooks(all);
    } else {
      const result = await filterBooksByStatus(userId, value);
      setBooks(result);
    }
  };

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!userId) return;
    const created = await createBook(userId, form);
    setBooks([created, ...books]);
    setShowAdd(false);
    setForm({ title: "", author: "", genre: "", totalPages: 1, pagesRead: 0, status: "WANT_TO_READ", rating: null });
  };

  const startEdit = async (id) => {
    const b = await getBookById(id);
    setEditing(b);
    setForm({ title: b.title, author: b.author, genre: b.genre, totalPages: b.totalPages, pagesRead: b.pagesRead, status: b.status, rating: b.rating });
    setShowAdd(true);
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    const updated = await updateBook(editing.id, form);
    setBooks(books.map(b => b.id === updated.id ? updated : b));
    setEditing(null);
    setShowAdd(false);
    setForm({ title: "", author: "", genre: "", totalPages: 1, pagesRead: 0, status: "WANT_TO_READ", rating: null });
  };

  const confirmDelete = async (id, isFromCatalog = false, userBookId = null) => {
    if (!window.confirm("Delete this book? This will also remove notes & quotes.")) return;
    try {
      if (isFromCatalog && userBookId) {
        await deleteUserBook(userBookId);
      } else {
        await deleteBook(id);
      }
      setBooks(books.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete book: ' + err.message);
    }
  };

  // Cover upload removed per user request

  // Reading progress controls removed per request

  const handleClickImport = () => fileInputRef.current?.click();
  const handleCsvChosen = async (e) => {
    const f = e.target.files?.[0];
    if (!f || !userId) return;
    setCsvFile(f);
    const result = await importBooksCSV(userId, f);
    alert(`Imported: ${result.imported}, Failed: ${result.failed}`);
    const refreshed = await getBooksByUser(userId);
    setBooks(refreshed);
    setCsvFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div>
      <Navbar />
      <div className="page">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="text-2xl font-semibold heading-primary">My Bookshelf</h2>
          <div className="flex flex-wrap gap-2 items-center">
            <input
              value={q}
              onChange={handleSearch}
              placeholder="Search by title, author, genre"
              className="input"
              style={{ minWidth: 260 }}
            />
            <select value={status} onChange={handleFilter} className="input">
              <option value="">All Status</option>
              <option value="READ">Read</option>
              <option value="READING">Reading</option>
              <option value="WANT_TO_READ">Want to Read</option>
            </select>
            <button className="btn btn-secondary" onClick={() => setShowAdd(true)}>➕ Add Book</button>
            <div className="flex gap-2">
              <button
                onClick={() => downloadPdf('favorites', 'favorites.pdf')}
                className="btn btn-secondary"
                title="Download Favorites PDF"
              >
                📥 Favorites
              </button>
              <button
                onClick={() => downloadPdf('top5', 'top5-books.pdf')}
                className="btn btn-secondary"
                title="Download Top 5 PDF"
              >
                ⭐ Top 5
              </button>
              <button
                onClick={() => downloadPdf('all', 'my-books.pdf')}
                className="btn btn-secondary"
                title="Download All Books PDF"
              >
                📚 All
              </button>
            </div>
            <button className="btn btn-secondary" onClick={handleClickImport}>📤 Import CSV</button>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleCsvChosen} style={{ display: 'none' }} />
          </div>
        </div>
        {/* Import runs immediately after file selection */}
      </div>

      <Modal
        open={showAdd}
        onClose={() => { setShowAdd(false); setEditing(null); }}
        title={editing ? "Edit Book" : "Add Book"}
        footer={[
          <button key="cancel" type="button" className="btn btn-tertiary" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button>,
          <button key="submit" type="submit" form="book-form" className="btn">{editing ? "Save Changes" : "Add Book"}</button>
        ]}
      >
        <form id="book-form" onSubmit={editing ? submitEdit : submitAdd} className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Title</span>
            <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Author</span>
            <input className="input" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Genre</span>
            <input className="input" value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Status</span>
            <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="READ">Read</option>
              <option value="READING">Reading</option>
              <option value="WANT_TO_READ">Want to Read</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Total Pages</span>
            <input className="input" type="number" min="1" value={form.totalPages} onChange={e => setForm({ ...form, totalPages: parseInt(e.target.value || '0', 10) })} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-muted">Pages Read</span>
            <input className="input" type="number" min="0" value={form.pagesRead} onChange={e => setForm({ ...form, pagesRead: parseInt(e.target.value || '0', 10) })} />
          </label>
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs text-muted">Rating</span>
            <StarRating value={form.rating} onChange={(n) => setForm({ ...form, rating: n })} />
          </label>
          <div className="text-xs text-muted md:col-span-2">Tip: Status controls where it appears in filters.</div>
        </form>
      </Modal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-slide-up">
        {books.length === 0 && (
          <div className="col-span-full card text-center text-muted">No books yet. Click "Add Book" to get started.</div>
        )}
        {books.map(book => (
          <div key={book.id} className="card hover-lift">
            {book.coverUrl && (
              <img src={book.coverUrl} alt={book.title} style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }} />
            )}
            <h3 className="font-bold"><Link to={`/book/${book.id}`}>{book.title}</Link></h3>
            <p className="text-sm text-muted">{book.author}</p>
            <div className="text-xs text-muted">{book.genre} • {book.pagesRead}/{book.totalPages} • {book.status}</div>
            <div className="flex gap-2 mt-2">
              <button className="btn btn-compact" onClick={() => startEdit(book.id)}>✏️ Edit</button>
              <button className="btn btn-compact" onClick={() => confirmDelete(book.id, book.isFromCatalog, book.userBookId)}>🗑️ Delete</button>
              {/* Cover upload removed */}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

export default Bookshelf;
