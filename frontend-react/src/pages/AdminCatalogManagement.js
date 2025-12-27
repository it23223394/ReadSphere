import React, { useState, useEffect } from 'react';
import { listCatalog, createCatalogBook, updateCatalogBook, deleteCatalogBook } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AdminNavbar } from '../components/AdminNavbar';
import '../styles/Auth.css';

function AdminCatalogManagement() {
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    description: '',
    rating: '',
    pageCount: ''
  });
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }
    fetchBooks();
  }, [role, navigate, currentPage, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const data = await listCatalog(currentPage, 20, searchTerm);
      // If current page is out of range (e.g., after deletions), snap to the last page
      if (data.totalPages && currentPage >= data.totalPages) {
        setCurrentPage(Math.max(data.totalPages - 1, 0));
        return;
      }

      setBooks(data.books);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load catalog');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage((prev) => {
      const maxPageIndex = Math.max((totalPages || 1) - 1, 0);
      const target = Math.min(Math.max(pageNumber, 0), maxPageIndex);
      return target === prev ? prev : target;
    });
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        author: formData.author,
        genre: formData.genre,
        description: formData.description,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        pageCount: formData.pageCount ? parseInt(formData.pageCount) : null
      };

      if (editingId) {
        await updateCatalogBook(editingId, payload);
        setError('Book updated successfully');
      } else {
        await createCatalogBook(payload);
        setError('Book created successfully');
      }

      setFormData({ title: '', author: '', genre: '', description: '', rating: '', pageCount: '' });
      setShowForm(false);
      setEditingId(null);
      fetchBooks();
    } catch (err) {
      setError(err.message || 'Failed to save book');
    }
  };

  const handleEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      description: book.description || '',
      rating: book.averageRating || '',
      pageCount: book.totalPages || ''
    });
    setEditingId(book.id);
    setShowForm(true);
  };

  const handleDelete = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) {
      return;
    }

    try {
      await deleteCatalogBook(bookId);
      fetchBooks();
    } catch (err) {
      setError(err.message || 'Failed to delete book');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ title: '', author: '', genre: '', description: '', rating: '', pageCount: '' });
  };

  if (loading) {
    return <div className="container"><div className="loading-state">Loading catalog...</div></div>;
  }

  return (
    <>
      <AdminNavbar />
      <div className="container">
      <div className="admin-section">
        <div className="section-header">
          <h1>Catalog Management</h1>
          <p>Add, edit, and manage books in the catalog</p>
          <button 
            className="btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '❌ Cancel' : '➕ Add New Book'}
          </button>
        </div>

        {error && <div className="info-message">{error}</div>}

        {showForm && (
          <div className="form-container">
            <form onSubmit={handleSubmit} className="catalog-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                    placeholder="Book title"
                  />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input
                    type="text"
                    name="author"
                    value={formData.author}
                    onChange={handleFormChange}
                    required
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Genre *</label>
                  <select
                    name="genre"
                    value={formData.genre}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select genre</option>
                    <option value="Self-Help">Self-Help</option>
                    <option value="Fiction">Fiction</option>
                    <option value="Mystery">Mystery</option>
                    <option value="Science">Science</option>
                    <option value="Romance">Romance</option>
                    <option value="Horror">Horror</option>
                    <option value="Fantasy">Fantasy</option>
                    <option value="Biography">Biography</option>
                    <option value="History">History</option>
                    <option value="Finance">Finance</option>
                    <option value="Technology">Technology</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Rating (0-5)</label>
                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleFormChange}
                    min="0"
                    max="5"
                    step="0.1"
                    placeholder="4.5"
                  />
                </div>
                <div className="form-group">
                  <label>Page Count</label>
                  <input
                    type="number"
                    name="pageCount"
                    value={formData.pageCount}
                    onChange={handleFormChange}
                    min="1"
                    placeholder="300"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Book description"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update Book' : 'Add Book'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="search-box">
          <input
            type="text"
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(0);
            }}
            className="search-input"
          />
          <span className="search-count">{books.length} books</span>
        </div>

        <div className="table-container">
          <table className="catalog-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Author</th>
                <th>Genre</th>
                <th>Rating</th>
                <th>Pages</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No books found</td>
                </tr>
              ) : (
                books.map((book, index) => {
                  const rowNumber = currentPage * 20 + index + 1;
                  return (
                  <tr key={book.id}>
                    <td>{rowNumber}</td>
                    <td className="text-ellipsis">{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td>{book.averageRating ? Number(book.averageRating).toFixed(1) : '—'}</td>
                    <td>{book.totalPages || '—'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-small btn-primary"
                          onClick={() => handleEdit(book)}
                          title="Edit book"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleDelete(book.id)}
                          title="Delete book"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              type="button"
              className="btn-small"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 0}
            >
              ← Previous
            </button>
            <span className="page-info">
              Page {currentPage + 1} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              className="btn-small"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default AdminCatalogManagement;
