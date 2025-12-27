const API_URL = "http://localhost:8080/api";

// Helper to get authorization headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const getBooks = async () => {
  const response = await fetch(`${API_URL}/books`, {
    headers: getAuthHeaders()
  });
  return response.json();
};

export const getBooksByUser = async (userId) => {
  const res = await fetch(`${API_URL}/books/user/${userId}`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const getBookById = async (id) => {
  const res = await fetch(`${API_URL}/books/${id}`, { headers: getAuthHeaders() });
  return res.json();
};

export const createBook = async (userId, payload) => {
  const res = await fetch(`${API_URL}/books/user/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create book');
  return data;
};

export const updateBook = async (id, payload) => {
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update book');
  return data;
};

export const deleteBook = async (id) => {
  const res = await fetch(`${API_URL}/books/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to delete book');
};

export const deleteUserBook = async (userBookId) => {
  const res = await fetch(`${API_URL}/user-books/${userBookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({error: 'Failed to delete book'}));
    throw new Error(data.error || 'Failed to delete book');
  }
  return res.json();
};

export const searchBooks = async (userId, q) => {
  const res = await fetch(`${API_URL}/books/user/${userId}/search?q=${encodeURIComponent(q)}`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const filterBooksByStatus = async (userId, status) => {
  const res = await fetch(`${API_URL}/books/user/${userId}/status?status=${encodeURIComponent(status)}`, {
    headers: getAuthHeaders()
  });
  return res.json();
};

export const uploadBookCover = async (id, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/books/${id}/cover`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to upload cover');
  return data;
};

export const uploadUserBookCover = async (userBookId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/user-books/${userBookId}/cover`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    body: formData
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data && data.error) || 'Failed to upload cover');
  return data;
};

export const importBooksCSV = async (userId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/books/user/${userId}/import-csv`, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    body: formData
  });
  return res.json();
};

export const updateBookProgress = async (id, pagesRead) => {
  const res = await fetch(`${API_URL}/books/${id}/progress?pagesRead=${encodeURIComponent(pagesRead)}`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update progress');
  return data;
};

// Reading Tracker APIs
export const addReadingLog = async (userId, { bookId, pages, date }) => {
  const res = await fetch(`${API_URL}/reading/logs/user/${userId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ bookId, pages, date })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add reading log');
  return data;
};

export const getReadingSummary = async (userId, range = 'weekly') => {
  const res = await fetch(`${API_URL}/reading/summary?userId=${encodeURIComponent(userId)}&range=${encodeURIComponent(range)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch reading summary');
  return res.json();
};

export const getReadingStreak = async (userId) => {
  const res = await fetch(`${API_URL}/reading/streak?userId=${encodeURIComponent(userId)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch reading streak');
  return res.json();
};

export const getReadingTimeline = async (userId) => {
  const res = await fetch(`${API_URL}/reading/timeline?userId=${encodeURIComponent(userId)}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error('Failed to fetch reading timeline');
  return res.json();
};

export const getRecommendations = async (userId, { refresh = false, source = 'catalog' } = {}) => {
  const url = new URL(`${API_URL}/recommendations/${userId}`);
  if (refresh) url.searchParams.set('refresh', 'true');
  if (source) url.searchParams.set('source', source);
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
};

export const submitRecommendationFeedback = async (userId, bookId, feedback) => {
  const res = await fetch(`${API_URL}/recommendations/${userId}/${bookId}/feedback`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ feedback })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to submit feedback');
  }
  return res.json();
};

// Catalog APIs
export const getCatalog = async (genre) => {
  const url = new URL(`${API_URL}/catalog`);
  if (genre) url.searchParams.set('genre', genre);
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch catalog');
  return res.json();
};

export const getCatalogBook = async (id) => {
  const res = await fetch(`${API_URL}/catalog/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch catalog book');
  return res.json();
};

export const searchCatalog = async (query, searchBy = 'title') => {
  const url = new URL(`${API_URL}/catalog/search`);
  if (query) url.searchParams.set('q', query);
  url.searchParams.set('by', searchBy);
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to search catalog');
  return res.json();
};

export const getCatalogGenres = async () => {
  const res = await fetch(`${API_URL}/catalog/genres`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch genres');
  return res.json();
};

// UserBook APIs
export const getUserBooks = async (userId) => {
  const res = await fetch(`${API_URL}/user-books/user/${userId}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch user books');
  return res.json();
};

export const addBookToShelf = async (userId, catalogBookId, status = 'WANT_TO_READ') => {
  const res = await fetch(`${API_URL}/user-books/user/${userId}/add/${catalogBookId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to add book');
  }
  return res.json();
};

// Notes APIs
export const getNotesByBook = async (userId, bookId) => {
  const res = await fetch(`${API_URL}/notes/book/${bookId}?userId=${userId}`, { headers: getAuthHeaders() });
  return res.json();
};
export const addNote = async (userId, bookId, text) => {
  const res = await fetch(`${API_URL}/notes/book/${bookId}?userId=${userId}`, {
    method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ text })
  });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to add note'); return data;
};
export const editNote = async (id, text) => {
  const res = await fetch(`${API_URL}/notes/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ text }) });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to edit note'); return data;
};
export const deleteNoteApi = async (id) => {
  const res = await fetch(`${API_URL}/notes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to delete note');
};
export const uploadNoteImage = async (id, file) => {
  const form = new FormData(); form.append('file', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/notes/${id}/image`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : undefined, body: form });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to upload image'); return data;
};
export const setNoteTags = async (id, tags) => {
  const res = await fetch(`${API_URL}/notes/${id}/tags`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify(tags) });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to set tags'); return data;
};
export const searchNotes = async (q, bookId) => {
  const url = new URL(`${API_URL}/notes/search`);
  url.searchParams.set('q', q);
  if (bookId) url.searchParams.set('bookId', bookId);
  const res = await fetch(url, { headers: getAuthHeaders() });
  return res.json();
};

// Quotes APIs
export const getQuotesByBook = async (userId, bookId) => {
  const res = await fetch(`${API_URL}/quotes/book/${bookId}?userId=${userId}`, { headers: getAuthHeaders() });
  return res.json();
};
export const addQuote = async (userId, bookId, { text, pageNumber }) => {
  const res = await fetch(`${API_URL}/quotes/book/${bookId}?userId=${userId}`, { method: 'POST', headers: getAuthHeaders(), body: JSON.stringify({ text, pageNumber }) });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to add quote'); return data;
};
export const editQuote = async (id, { text, pageNumber }) => {
  const res = await fetch(`${API_URL}/quotes/${id}`, { method: 'PUT', headers: getAuthHeaders(), body: JSON.stringify({ text, pageNumber }) });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to edit quote'); return data;
};
export const deleteQuoteApi = async (id) => {
  const res = await fetch(`${API_URL}/quotes/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to delete quote');
};
export const uploadQuoteImage = async (id, file) => {
  const form = new FormData(); form.append('file', file);
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_URL}/quotes/${id}/image`, { method: 'POST', headers: token ? { 'Authorization': `Bearer ${token}` } : undefined, body: form });
  const data = await res.json(); if (!res.ok) throw new Error(data.error || 'Failed to upload image'); return data;
};
export const searchQuotes = async (q, bookId) => {
  const url = new URL(`${API_URL}/quotes/search`);
  url.searchParams.set('q', q);
  if (bookId) url.searchParams.set('bookId', bookId);
  const res = await fetch(url, { headers: getAuthHeaders() });
  return res.json();
};

// Admin APIs

export const getAdminDashboard = async () => {
  const res = await fetch(`${API_URL}/admin/dashboard`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard');
  return data;
};

export const getAllUsers = async () => {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
  return data;
};

export const getUserDetails = async (userId) => {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user details');
  return data;
};

export const deleteUser = async (userId) => {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete user');
  return data;
};

export const deactivateUser = async (userId) => {
  const res = await fetch(`${API_URL}/admin/users/${userId}/deactivate`, {
    method: 'PATCH',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to deactivate user');
  return data;
};

// Admin Analytics APIs
export const getAdminAnalyticsOverview = async () => {
  const res = await fetch(`${API_URL}/admin/analytics/overview`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch analytics overview');
  return data;
};

export const getAdminAnalyticsReading = async (range = 'weekly') => {
  const url = new URL(`${API_URL}/admin/analytics/reading`);
  if (range) url.searchParams.set('range', range);
  const res = await fetch(url, { headers: getAuthHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch reading analytics');
  return data;
};

// Admin System APIs
export const getAdminSystemHealth = async () => {
  const res = await fetch(`${API_URL}/admin/system/health`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch system health');
  return data;
};

export const getAdminSystemLogs = async () => {
  const res = await fetch(`${API_URL}/admin/system/logs`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch system logs');
  return data;
};

// Catalog CRUD APIs

export const listCatalog = async (page = 0, size = 20, search = '') => {
  const query = new URLSearchParams();
  query.append('page', page);
  query.append('size', size);
  if (search) query.append('search', search);
  
  const res = await fetch(`${API_URL}/admin/catalog?${query.toString()}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch catalog');
  return data;
};

export const getAdminCatalogBook = async (bookId) => {
  const res = await fetch(`${API_URL}/admin/catalog/${bookId}`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch book');
  return data;
};

export const createCatalogBook = async (payload) => {
  const res = await fetch(`${API_URL}/admin/catalog`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create book');
  return data;
};

export const updateCatalogBook = async (bookId, payload) => {
  const res = await fetch(`${API_URL}/admin/catalog/${bookId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update book');
  return data;
};

export const deleteCatalogBook = async (bookId) => {
  const res = await fetch(`${API_URL}/admin/catalog/${bookId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete book');
  return data;
};

// Auth & User Management APIs

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
};

export const register = async (payload) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
};

export const getProfile = async () => {
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch profile');
  return data;
};

export const updateProfile = async (payload) => {
  const res = await fetch(`${API_URL}/users/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data;
};

export const changePassword = async (payload) => {
  const res = await fetch(`${API_URL}/users/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to change password');
  return data;
};

export const getSettings = async () => {
  const res = await fetch(`${API_URL}/users/settings`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
  return data;
};

export const updateSettings = async (payload) => {
  const res = await fetch(`${API_URL}/users/settings`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update settings');
  return data;
};

export const requestPasswordReset = async (email) => {
  const res = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to request reset');
  return data;
};

export const resetPassword = async ({ token, newPassword, confirmPassword }) => {
  const res = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword, confirmPassword })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to reset password');
  return data;
};

export const resendVerification = async () => {
  const res = await fetch(`${API_URL}/users/resend-verification`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to send verification');
  return data;
};

export const verifyEmail = async (token) => {
  const res = await fetch(`${API_URL}/auth/verify-email?token=${encodeURIComponent(token)}`, {
    method: 'GET'
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to verify email');
  return data;
};


