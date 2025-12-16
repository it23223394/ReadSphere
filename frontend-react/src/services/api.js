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
