import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import Modal from '../components/Modal';
import {
  getBooksByUser, getNotesByBook, addNote, editNote, deleteNoteApi,
  uploadNoteImage, setNoteTags, searchNotes,
  getQuotesByBook, addQuote, editQuote, deleteQuoteApi, uploadQuoteImage, searchQuotes,
  getProfile
} from '../services/api';
import '../styles/NotesQuotes.css';

function NotesQuotes() {
  const { user } = useAuth();
  const [userId, setUserId] = useState(null);
  const [books, setBooks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [tab, setTab] = useState('notes'); // 'notes' or 'quotes'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBookId, setFilterBookId] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [editingQuote, setEditingQuote] = useState(null);
  const [editingQuoteImagePreview, setEditingQuoteImagePreview] = useState(null);
  const [editingQuoteImage, setEditingQuoteImage] = useState(null);
  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [showAddQuoteForm, setShowAddQuoteForm] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [newNoteBook, setNewNoteBook] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteBook, setNewQuoteBook] = useState('');
  const [newQuotePageNum, setNewQuotePageNum] = useState('');
  const [newQuoteImage, setNewQuoteImage] = useState(null);
  const [newQuoteImagePreview, setNewQuoteImagePreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImageFor, setUploadingImageFor] = useState(null);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // Initialize userId
  useEffect(() => {
    const init = async () => {
      try {
        const profile = await getProfile();
        const uid = profile?.id || profile?.user?.id || localStorage.getItem('userId');
        setUserId(uid ? parseInt(uid) : null);
      } catch (err) {
        const uid = localStorage.getItem('userId');
        setUserId(uid ? parseInt(uid) : null);
      }
    };
    init();
  }, [user]);

  // Load books and all notes/quotes for current user
  useEffect(() => {
    const loadData = async () => {
      if (!userId) return;
      try {
        const booksData = await getBooksByUser(userId);
        setBooks(booksData || []);

        const allNotes = [];
        const allQuotes = [];

        for (const book of (booksData || [])) {
          const bookNotes = await getNotesByBook(userId, book.id);
          const bookQuotes = await getQuotesByBook(userId, book.id);
          allNotes.push(...(bookNotes || []).map(n => ({ ...n, bookId: book.id, bookTitle: book.title })));
          allQuotes.push(...(bookQuotes || []).map(q => ({ ...q, bookId: book.id, bookTitle: book.title })));
        }

        setNotes(allNotes);
        setQuotes(allQuotes);
      } catch (err) {
        console.error('Failed to load notes/quotes:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [userId]);

  // Search notes
  const handleSearchNotes = async () => {
    if (!searchTerm.trim()) {
      // Reload all notes if search is cleared
      const allNotes = [];
      for (const book of books) {
        const bookNotes = await getNotesByBook(userId, book.id);
        allNotes.push(...(bookNotes || []).map(n => ({ ...n, bookId: book.id, bookTitle: book.title })));
      }
      setNotes(allNotes);
    } else {
      try {
        const results = await searchNotes(searchTerm, filterBookId || null);
        setNotes(results || []);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  // Search quotes
  const handleSearchQuotes = async () => {
    if (!searchTerm.trim()) {
      const allQuotes = [];
      for (const book of books) {
        const bookQuotes = await getQuotesByBook(userId, book.id);
        allQuotes.push(...(bookQuotes || []).map(q => ({ ...q, bookId: book.id, bookTitle: book.title })));
      }
      setQuotes(allQuotes);
    } else {
      try {
        const results = await searchQuotes(searchTerm, filterBookId || null);
        setQuotes(results || []);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }
  };

  // Filter notes by book
  const filteredNotes = filterBookId
    ? notes.filter(n => n.bookId === parseInt(filterBookId))
    : notes;

  // Filter quotes by book
  const filteredQuotes = filterBookId
    ? quotes.filter(q => q.bookId === parseInt(filterBookId))
    : quotes;

  // Add note
  const handleAddNote = async () => {
    if (!newNoteText.trim() || !newNoteBook) {
      alert('Please select a book and enter note text.');
      return;
    }
    try {
      const newNote = await addNote(userId, parseInt(newNoteBook), newNoteText);
      if (newNoteTags.trim()) {
        const tagArray = newNoteTags.split(',').map(t => t.trim()).filter(t => t);
        await setNoteTags(newNote.id, tagArray);
        newNote.tags = tagArray;
      }
      setNotes([...notes, { ...newNote, bookId: parseInt(newNoteBook), bookTitle: books.find(b => b.id === parseInt(newNoteBook))?.title }]);
      setNewNoteText('');
      setNewNoteBook('');
      setNewNoteTags('');
      setShowAddNoteForm(false);
    } catch (err) {
      alert(`Failed to add note: ${err.message}`);
    }
  };

  // Edit note
  const handleEditNote = async (note) => {
    if (!editingNote.text.trim()) {
      alert('Note text cannot be empty.');
      return;
    }
    try {
      await editNote(note.id, editingNote.text);
      if (editingNote.tags !== note.tags) {
        const tagArray = (editingNote.tags || '').split(',').map(t => t.trim()).filter(t => t);
        await setNoteTags(note.id, tagArray);
      }
      const updated = { ...note, text: editingNote.text, tags: editingNote.tags || '' };
      setNotes(notes.map(n => n.id === note.id ? updated : n));
      setEditingNote(null);
    } catch (err) {
      alert(`Failed to edit note: ${err.message}`);
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await deleteNoteApi(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
    } catch (err) {
      alert(`Failed to delete note: ${err.message}`);
    }
  };

  // Upload note image
  const handleUploadNoteImage = async (noteId, file) => {
    try {
      setUploadingImageFor(noteId);
      await uploadNoteImage(noteId, file);
      setNotes(notes.map(n => n.id === noteId ? { ...n, imageUrl: URL.createObjectURL(file) } : n));
    } catch (err) {
      alert(`Failed to upload image: ${err.message}`);
    } finally {
      setUploadingImageFor(null);
    }
  };

  // Add quote
  const handleAddQuote = async () => {
    if (!newQuoteBook || !newQuotePageNum) {
      alert('Please select a book and provide a page number.');
      return;
    }
    if (!newQuoteText.trim() && !newQuoteImage) {
      alert('Please either type a quote or upload an image.');
      return;
    }
    try {
      const newQuote = await addQuote(userId, parseInt(newQuoteBook), { text: newQuoteText.trim(), pageNumber: parseInt(newQuotePageNum) });
      
      // Upload image if provided
      if (newQuoteImage) {
        try {
          const uploadResponse = await uploadQuoteImage(newQuote.id, newQuoteImage);
          // Backend returns the updated Quote object with imageUrl
          newQuote.imageUrl = uploadResponse?.imageUrl;
        } catch (imgErr) {
          console.warn('Image upload failed, but quote was saved:', imgErr);
        }
      }
      
      setQuotes([...quotes, { ...newQuote, bookId: parseInt(newQuoteBook), bookTitle: books.find(b => b.id === parseInt(newQuoteBook))?.title }]);
      setNewQuoteText('');
      setNewQuoteBook('');
      setNewQuotePageNum('');
      setNewQuoteImage(null);
      setNewQuoteImagePreview(null);
      setShowAddQuoteForm(false);
    } catch (err) {
      alert(`Failed to add quote: ${err.message}`);
    }
  };

  // Edit quote
  const handleEditQuote = async (quote) => {
    if (!editingQuote.text.trim() && !editingQuote.imageUrl && !editingQuoteImage) {
      alert('Quote must have text or an image.');
      return;
    }
    if (!editingQuote.pageNumber) {
      alert('Page number is required.');
      return;
    }
    try {
      await editQuote(quote.id, { text: editingQuote.text, pageNumber: parseInt(editingQuote.pageNumber) });
      
      // Upload new image if provided
      let updatedImageUrl = editingQuote.imageUrl;
      if (editingQuoteImage) {
        try {
          const uploadResponse = await uploadQuoteImage(quote.id, editingQuoteImage);
          // Backend returns the updated Quote object with imageUrl
          updatedImageUrl = uploadResponse?.imageUrl;
        } catch (imgErr) {
          console.warn('Image upload failed, but quote was updated:', imgErr);
        }
      }
      
      const updated = { ...quote, text: editingQuote.text, pageNumber: parseInt(editingQuote.pageNumber), imageUrl: updatedImageUrl };
      setQuotes(quotes.map(q => q.id === quote.id ? updated : q));
      setEditingQuote(null);
      setEditingQuoteImage(null);
      setEditingQuoteImagePreview(null);
    } catch (err) {
      alert(`Failed to edit quote: ${err.message}`);
    }
  };

  // Delete quote
  const handleDeleteQuote = async (quoteId) => {
    if (!window.confirm('Delete this quote?')) return;
    try {
      await deleteQuoteApi(quoteId);
      setQuotes(quotes.filter(q => q.id !== quoteId));
    } catch (err) {
      alert(`Failed to delete quote: ${err.message}`);
    }
  };

  // Upload quote image
  const handleUploadQuoteImage = async (quoteId, file) => {
    try {
      setUploadingImageFor(quoteId);
      const uploadResponse = await uploadQuoteImage(quoteId, file);
      const newUrl = uploadResponse?.imageUrl || URL.createObjectURL(file);
      setQuotes(quotes.map(q => q.id === quoteId ? { ...q, imageUrl: newUrl } : q));
    } catch (err) {
      alert(`Failed to upload image: ${err.message}`);
    } finally {
      setUploadingImageFor(null);
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="page">
          <div className="card">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="page">
        <h2 className="text-2xl font-bold heading-primary mb-4">Notes & Quotes</h2>
        <p className="text-muted mb-4">Capture and search your thoughts and favorite passages from books.</p>

        {/* Tabs */}
        <div className="tabs mb-4">
          <button
            className={`tab-btn ${tab === 'notes' ? 'active' : ''}`}
            onClick={() => setTab('notes')}
          >
            📝 Notes
          </button>
          <button
            className={`tab-btn ${tab === 'quotes' ? 'active' : ''}`}
            onClick={() => setTab('quotes')}
          >
            ✨ Quotes
          </button>
        </div>

        {/* Search & Filter */}
        <div className="search-filter-bar mb-4">
          <input
            type="text"
            placeholder={tab === 'notes' ? 'Search notes...' : 'Search quotes...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            onClick={tab === 'notes' ? handleSearchNotes : handleSearchQuotes}
            className="btn-toolbar"
          >
            🔍 Search
          </button>

          <select
            value={filterBookId}
            onChange={(e) => setFilterBookId(e.target.value)}
            className="filter-select"
          >
            <option value="">All Books</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              if (tab === 'notes') setShowAddNoteForm(true);
              else setShowAddQuoteForm(true);
            }}
            className="btn-toolbar"
          >
            {tab === 'notes' ? '➕ Add Note' : '➕ Add Quote'}
          </button>
        </div>

        {/* Add Note Modal */}
        <Modal
          open={showAddNoteForm}
          title="Add New Note"
          onClose={() => setShowAddNoteForm(false)}
          footer={
            <>
              <button onClick={handleAddNote} className="btn btn-item">Save Note</button>
              <button onClick={() => setShowAddNoteForm(false)} className="btn btn-secondary">Cancel</button>
            </>
          }
        >
          <div className="form space-y-4">
            <div>
              <label className="label">Select Book</label>
              <select
                value={newNoteBook}
                onChange={(e) => setNewNoteBook(e.target.value)}
                className="form-input"
              >
                <option value="">Select Book...</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Note</label>
              <textarea
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="Write your note..."
                className="form-input"
                rows="5"
              />
            </div>
            <div>
              <label className="label">Tags (optional)</label>
              <input
                type="text"
                value={newNoteTags}
                onChange={(e) => setNewNoteTags(e.target.value)}
                placeholder="Tags (comma-separated, e.g. inspiring, important)"
                className="form-input"
              />
            </div>
          </div>
        </Modal>

        {/* Add Quote Modal */}
        <Modal
          open={showAddQuoteForm}
          title="✨ Add New Quote"
          onClose={() => setShowAddQuoteForm(false)}
          footer={
            <>
              <button onClick={handleAddQuote} className="btn btn-item">Save Quote</button>
              <button onClick={() => setShowAddQuoteForm(false)} className="btn btn-secondary">Cancel</button>
            </>
          }
        >
          <div className="form space-y-4">
            <div>
              <label className="label">Select Book</label>
              <select
                value={newQuoteBook}
                onChange={(e) => setNewQuoteBook(e.target.value)}
                className="form-input"
              >
                <option value="">Select Book...</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Page Number</label>
              <input
                type="number"
                value={newQuotePageNum}
                onChange={(e) => setNewQuotePageNum(e.target.value)}
                placeholder="Page number"
                className="form-input"
                min="1"
              />
            </div>
            <div>
              <label className="label">Quote</label>
              <textarea
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                placeholder="Type the quote..."
                className="form-input"
                rows="4"
              />
            </div>
            <div>
              <label className="label">Or Upload Quote Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setNewQuoteImage(file);
                    setNewQuoteImagePreview(URL.createObjectURL(file));
                  }
                }}
                className="form-input"
              />
              {newQuoteImagePreview && (
                <div className="mt-2">
                  <img src={newQuoteImagePreview} alt="Preview" className="max-h-32 rounded" />
                </div>
              )}
            </div>
          </div>
        </Modal>

        {/* Notes List */}
        {tab === 'notes' && (
          <div className="content-list stagger-slide-up">
            {filteredNotes.length === 0 ? (
              <div className="card">
                <p className="text-muted">No notes yet. {newNoteBook === '' && 'Start adding your thoughts!'}</p>
              </div>
            ) : (
              filteredNotes.map(note => (
                <div key={note.id} className="content-card hover-lift">
                  {editingNote?.id === note.id ? (
                    <div>
                      <textarea
                        value={editingNote.text}
                        onChange={(e) => setEditingNote({ ...editingNote, text: e.target.value })}
                        className="form-input mb-2"
                        rows="3"
                      />
                      <input
                        type="text"
                        value={editingNote.tags || ''}
                        onChange={(e) => setEditingNote({ ...editingNote, tags: e.target.value })}
                        placeholder="Tags (comma-separated)"
                        className="form-input mb-2"
                      />
                      <div className="form-buttons">
                        <button onClick={() => handleEditNote(note)} className="btn-item">Save</button>
                        <button onClick={() => setEditingNote(null)} className="btn-secondary">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-sm text-muted">{note.bookTitle} • {new Date(note.createdAt || Date.now()).toLocaleDateString()}</div>
                      <p className="text-sm my-2">{note.text}</p>
                      {note.tags && Array.isArray(note.tags) && note.tags.length > 0 && (
                        <div className="tags mb-2">
                          {note.tags.map((tag, idx) => (
                            <span key={idx} className="tag">#{typeof tag === 'string' ? tag : tag.name}</span>
                          ))}
                        </div>
                      )}
                      <div className="content-buttons">
                        <button
                          onClick={() => setEditingNote({ ...note, tags: note.tags?.join(', ') || '' })}
                          className="btn btn-compact"
                        >
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteNote(note.id)} className="btn btn-compact">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Quotes List */}
        {tab === 'quotes' && (
          <div className="content-list stagger-slide-up">
            {filteredQuotes.length === 0 ? (
              <div className="card">
                <p className="text-muted">No quotes yet. Start capturing your favorite passages!</p>
              </div>
            ) : (
              filteredQuotes.map(quote => (
                <div key={quote.id} className="content-card hover-lift">
                  {editingQuote?.id === quote.id ? (
                    <div>
                      <textarea
                        value={editingQuote.text}
                        onChange={(e) => setEditingQuote({ ...editingQuote, text: e.target.value })}
                        className="form-input mb-2"
                        rows="3"
                      />
                      <input
                        type="number"
                        value={editingQuote.pageNumber}
                        onChange={(e) => setEditingQuote({ ...editingQuote, pageNumber: e.target.value })}
                        placeholder="Page number"
                        className="form-input mb-3"
                        min="1"
                      />
                      
                      {/* Image Upload in Edit Form */}
                      <div className="image-upload-box mb-3">
                        <label htmlFor="editQuoteImageInput" className="image-upload-label">
                          {editingQuoteImagePreview || editingQuote.imageUrl ? (
                            <>
                              <img src={editingQuoteImagePreview || editingQuote.imageUrl} alt="preview" className="image-preview" />
                              <div className="upload-text">Click to change</div>
                            </>
                          ) : (
                            <>
                              <div className="text-3xl mb-2">📸</div>
                              <div className="upload-text">Click to upload screenshot (optional)</div>
                            </>
                          )}
                        </label>
                        <input
                          id="editQuoteImageInput"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setEditingQuoteImage(file);
                              setEditingQuoteImagePreview(URL.createObjectURL(file));
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                      </div>
                      
                      <div className="form-buttons">
                        <button onClick={() => handleEditQuote(quote)} className="btn-item">Save</button>
                        <button onClick={() => {
                          setEditingQuote(null);
                          setEditingQuoteImage(null);
                          setEditingQuoteImagePreview(null);
                        }} className="btn-secondary">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {quote.imageUrl && (
                        <div
                          onClick={() => setFullscreenImage(quote.imageUrl)}
                          className="content-image-clickable mb-2"
                          style={{ cursor: 'pointer' }}
                        >
                          <img src={quote.imageUrl} alt="quote" className="content-image" />
                          <div className="image-overlay">Click to view full screen</div>
                        </div>
                      )}
                      <div className="text-sm text-muted">{quote.bookTitle} • p.{quote.pageNumber}</div>
                      {quote.text && (
                        <blockquote className="text-sm my-2 italic pl-3 border-l-2 border-primary">
                          "{quote.text}"
                        </blockquote>
                      )}
                      {!quote.imageUrl && !quote.text && (
                        <div className="text-sm text-muted italic">No content yet. Click Edit to add text or upload an image.</div>
                      )}
                      <div className="content-buttons">
                        <button
                          onClick={() => {
                            setEditingQuote({ ...quote });
                            setEditingQuoteImagePreview(quote.imageUrl);
                          }}
                          className="btn btn-compact"
                        >
                          ✏️ Edit
                        </button>
                        <button onClick={() => handleDeleteQuote(quote.id)} className="btn btn-compact">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fullscreen-image-modal" onClick={() => setFullscreenImage(null)}>
          <div className="fullscreen-image-container">
            <img src={fullscreenImage} alt="fullscreen" className="fullscreen-image" />
            <button className="close-fullscreen" onClick={() => setFullscreenImage(null)}>✕</button>
          </div>
        </div>
      )}    </div>
  );
}

export default NotesQuotes;
