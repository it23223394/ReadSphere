import { useEffect, useRef, useState } from "react";
import { 
  getBooksByUser,
  getUserBooks,
  searchBooks,
  filterBooksByStatus,
  createBook,
  updateBook,
  updateUserBook,
  deleteBook,
  deleteUserBook,
  getBookById,
  getProfile,
  getCatalogGenres
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
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportModalTitle, setExportModalTitle] = useState('');
  const [exportModalItems, setExportModalItems] = useState([]);
  const [exportEndpoint, setExportEndpoint] = useState('');
  const [exportFilename, setExportFilename] = useState('');
  
  // Genre autocomplete states
  const [catalogGenres, setCatalogGenres] = useState([]);
  const [genreInput, setGenreInput] = useState("");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [filteredGenres, setFilteredGenres] = useState([]);
  const [isCustomGenre, setIsCustomGenre] = useState(false);
  const genreInputRef = useRef(null);
  const genreDropdownRef = useRef(null);

  useEffect(() => {
    getProfile().then(p => {
      const uid = p?.id || p?.user?.id; // support different profile shapes
      setUserId(uid || 1);
    }).catch(() => setUserId(1));
    
    // Fetch catalog genres
    getCatalogGenres().then(genres => {
      setCatalogGenres(genres);
    }).catch(err => {
      console.error('Failed to load genres:', err);
    });
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

  const openExportModal = (type) => {
    let items = [];
    let title = '';
    let endpoint = '';
    let filename = '';
    if (type === 'favorites') {
      items = books.filter(b => (b.rating || 0) >= 4);
      title = 'Favorites';
      endpoint = 'favorites';
      filename = 'favorites.pdf';
    } else if (type === 'top5') {
      items = [...books].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
      title = 'Top 5';
      endpoint = 'top5';
      filename = 'top5-books.pdf';
    } else {
      items = books;
      title = 'All Books';
      endpoint = 'all';
      filename = 'my-books.pdf';
    }
    setExportModalItems(items);
    setExportModalTitle(title);
    setExportEndpoint(endpoint);
    setExportFilename(filename);
    setExportModalOpen(true);
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

  // Genre autocomplete handlers
  const handleGenreInputChange = (e) => {
    const value = e.target.value;
    setGenreInput(value);
    setIsCustomGenre(false);
    
    if (value.trim() === "") {
      setFilteredGenres([]);
      setShowGenreDropdown(false);
    } else {
      // Filter genres that start with the input value (case insensitive)
      const filtered = catalogGenres.filter(genre => 
        genre.toLowerCase().startsWith(value.toLowerCase())
      );
      setFilteredGenres(filtered);
      setShowGenreDropdown(true);
    }
    
    // Update form genre value
    setForm({ ...form, genre: value });
  };

  const handleGenreSelect = (genre) => {
    if (genre === "Other") {
      setIsCustomGenre(true);
      setGenreInput("");
      setForm({ ...form, genre: "" });
      setShowGenreDropdown(false);
    } else {
      // Set both genreInput (for display) and form.genre (for submission)
      setGenreInput(genre);
      setForm({ ...form, genre: genre });
      setShowGenreDropdown(false);
      setIsCustomGenre(false);
      setFilteredGenres([]);
    }
  };

  const handleGenreFocus = () => {
    if (genreInput.trim() !== "" && filteredGenres.length > 0) {
      setShowGenreDropdown(true);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (genreDropdownRef.current && !genreDropdownRef.current.contains(event.target) &&
          genreInputRef.current && !genreInputRef.current.contains(event.target)) {
        setShowGenreDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const submitAdd = async (e) => {
    e.preventDefault();
    if (!userId) return;
    const created = await createBook(userId, form);
    setBooks([created, ...books]);
    setShowAdd(false);
    setForm({ title: "", author: "", genre: "", totalPages: 1, pagesRead: 0, status: "WANT_TO_READ", rating: null });
    setGenreInput("");
    setIsCustomGenre(false);
  };

  const startEdit = async (id) => {
    // For catalog books (prefixed with catalog_), use data from state
    const bookFromState = books.find(b => b.id === id);
    if (bookFromState && bookFromState.isFromCatalog) {
      setEditing(bookFromState);
      setForm({ 
        title: bookFromState.title, 
        author: bookFromState.author, 
        genre: bookFromState.genre, 
        totalPages: bookFromState.totalPages, 
        pagesRead: bookFromState.pagesRead, 
        status: bookFromState.status, 
        rating: bookFromState.rating 
      });
      setGenreInput(bookFromState.genre || "");
      setIsCustomGenre(false);
      setShowAdd(true);
    } else {
      // For legacy books, fetch from API
      const b = await getBookById(id);
      setEditing(b);
      setForm({ title: b.title, author: b.author, genre: b.genre, totalPages: b.totalPages, pagesRead: b.pagesRead, status: b.status, rating: b.rating });
      setGenreInput(b.genre || "");
      setIsCustomGenre(false);
      setShowAdd(true);
    }
  };

  const submitEdit = async (e) => {
    e.preventDefault();
    try {
      if (editing.isFromCatalog) {
        // For catalog books, update via UserBook API
        await updateUserBook(editing.userBookId, {
          status: form.status,
          pagesRead: form.pagesRead,
          rating: form.rating
        });
        // Update in state with new values
        const updatedBook = {
          ...editing,
          status: form.status,
          pagesRead: form.pagesRead,
          rating: form.rating
        };
        setBooks(books.map(b => b.id === editing.id ? updatedBook : b));
      } else {
        // For legacy books, use original updateBook API
        const updated = await updateBook(editing.id, form);
        setBooks(books.map(b => b.id === updated.id ? updated : b));
      }
      setEditing(null);
      setShowAdd(false);
      setForm({ title: "", author: "", genre: "", totalPages: 1, pagesRead: 0, status: "WANT_TO_READ", rating: null });
      setGenreInput("");
      setIsCustomGenre(false);
    } catch (err) {
      alert('Failed to update book: ' + err.message);
    }
  };

  const confirmDelete = async (id, isFromCatalog = false, userBookId = null) => {
    if (!window.confirm("Delete this book? This will also remove notes & quotes.")) return;
    try {
      if (isFromCatalog && userBookId) {
        await deleteUserBook(userBookId);
      } else {
        // Extract numeric ID if it has catalog_ prefix, ensure it's a number
        let numericId = id;
        if (typeof id === 'string' && id.startsWith('catalog_')) {
          numericId = parseInt(id.replace('catalog_', ''), 10);
        } else if (typeof id === 'string') {
          numericId = parseInt(id, 10);
        }
        
        if (isNaN(numericId)) {
          throw new Error('Invalid book ID');
        }
        
        await deleteBook(numericId);
      }
      setBooks(books.filter(b => b.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete book: ' + err.message);
    }
  };

  // Cover upload removed per user request

  // Reading progress controls removed per request

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
            <button className="btn btn-secondary" onClick={() => {
              setForm({ title: "", author: "", genre: "", totalPages: 1, pagesRead: 0, status: "WANT_TO_READ", rating: null });
              setGenreInput("");
              setIsCustomGenre(false);
              setShowGenreDropdown(false);
              setEditing(null);
              setShowAdd(true);
            }}>➕ Add Book</button>
            <div className="flex gap-2">
              <button
                onClick={() => openExportModal('favorites')}
                className="btn btn-secondary"
                title="View Favorites"
              >
                📥 Favorites
              </button>
              <button
                onClick={() => openExportModal('top5')}
                className="btn btn-secondary"
                title="View Top 5"
              >
                ⭐ Top 5
              </button>
              <button
                onClick={() => openExportModal('all')}
                className="btn btn-secondary"
                title="View All Books"
              >
                📚 All
              </button>
            </div>
          </div>
        </div>

        {/* Export List Modal */}
        <Modal
          open={exportModalOpen}
          title={`📄 ${exportModalTitle}`}
          onClose={() => setExportModalOpen(false)}
          footer={
            <>
              <button
                onClick={() => downloadPdf(exportEndpoint, exportFilename)}
                className="btn btn-item"
                title="Export PDF"
              >
                ⬇️ Export PDF
              </button>
              <button className="btn btn-secondary" onClick={() => setExportModalOpen(false)}>Close</button>
            </>
          }
        >
          <div className="space-y-3">
            {exportModalItems.length === 0 ? (
              <div className="text-muted">No items to show.</div>
            ) : (
              exportModalItems.map(item => (
                <div key={item.id} className="flex items-center gap-3 card p-3">
                  {item.coverUrl && (
                    <img src={item.coverUrl} alt={item.title} className="w-16 h-16 object-cover rounded" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold">{item.title}</div>
                    <div className="text-sm text-muted">{item.author} • {item.genre}</div>
                    {item.rating != null && (
                      <div className="text-xs text-muted">Rating: {item.rating}</div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Modal>
      </div>

      <Modal
        open={showAdd}
        onClose={() => { 
          setShowAdd(false); 
          setEditing(null); 
          setGenreInput(""); 
          setIsCustomGenre(false); 
          setShowGenreDropdown(false);
        }}
        title={editing ? "Edit Book" : "Add Book"}
        footer={[
          <button key="cancel" type="button" className="btn btn-tertiary" onClick={() => { 
            setShowAdd(false); 
            setEditing(null); 
            setGenreInput(""); 
            setIsCustomGenre(false); 
            setShowGenreDropdown(false);
          }}>Cancel</button>,
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
          <label className="flex flex-col gap-1" style={{ position: 'relative' }}>
            <span className="text-xs text-muted">Genre</span>
            {isCustomGenre ? (
              <div>
                <input 
                  className="input" 
                  value={form.genre} 
                  onChange={e => setForm({ ...form, genre: e.target.value })} 
                  placeholder="Enter custom genre"
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => {
                    setIsCustomGenre(false);
                    setGenreInput("");
                    setForm({ ...form, genre: "" });
                  }}
                  className="text-xs text-muted"
                  style={{ marginTop: '4px' }}
                >
                  ← Back to genre list
                </button>
              </div>
            ) : (
              <>
                <input 
                  ref={genreInputRef}
                  className="input" 
                  value={genreInput} 
                  onChange={handleGenreInputChange}
                  onFocus={handleGenreFocus}
                  placeholder="Type to search genres..."
                  required 
                />
                {showGenreDropdown && (filteredGenres.length > 0 || genreInput.trim() !== "") && (
                  <div 
                    ref={genreDropdownRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: '#faf8f5',
                      border: '1px solid #d4c5b0',
                      borderRadius: '4px',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      marginTop: '2px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                    }}
                  >
                    {filteredGenres.map((genre, index) => (
                      <div
                        key={index}
                        onClick={() => handleGenreSelect(genre)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: '1px solid #e8dfd0',
                          backgroundColor: '#faf8f5',
                          color: '#4a3c2a'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0e8d8';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#faf8f5';
                        }}
                      >
                        {genre}
                      </div>
                    ))}
                    <div
                      onClick={() => handleGenreSelect("Other")}
                      style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontStyle: 'italic',
                        color: '#8c7a5f',
                        backgroundColor: '#faf8f5'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0e8d8';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#faf8f5';
                      }}
                    >
                      Other (enter custom genre)
                    </div>
                  </div>
                )}
              </>
            )}
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
