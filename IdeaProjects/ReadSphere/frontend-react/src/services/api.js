const API_URL = "http://localhost:8080/api";

export const getBooks = async () => {
  const response = await fetch(`${API_URL}/books`);
  return response.json();
};
