const API_URL = "http://localhost:8080/api";

export const getBooks = async () => {
  const response = await fetch(`${API_URL}/books`);
  return response.json();
};

export const getRecommendations = async (userId) => {
  const res = await fetch(`${API_URL}/recommendations/${userId}`);
  if (!res.ok) throw new Error("Failed to fetch recommendations");
  return res.json();
};
