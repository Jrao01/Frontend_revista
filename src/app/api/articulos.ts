// src/app/api/articulos.ts
/**
 * Helper functions for interacting with the backend articles API.
 * Adjust the BASE_URL if your backend runs on a different host/port.
 */

const BASE_URL = "http://localhost:5000"; // backend server URL

/**
 * Fetch the list of approved articles.
 * The backend should expose an endpoint that returns an array of articles.
 * Example response shape should match the `Article` interface defined in
 * `ApprovedArticlesList.tsx`.
 */
export async function fetchApprovedArticles() {
  const response = await fetch(`${BASE_URL}/api/articulos/aprobados`);
  if (!response.ok) {
    throw new Error(`Failed to fetch approved articles: ${response.status}`);
  }
  // Assuming the backend returns JSON array matching Article interface
  const data = await response.json();
  return data;
}

// You can add additional API helpers here, e.g., createArticle, deleteArticle, etc.
