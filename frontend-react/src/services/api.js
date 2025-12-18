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

export const getRecommendations = async (userId) => {
  const res = await fetch(`${API_URL}/recommendations/${userId}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
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
