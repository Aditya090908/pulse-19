
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchWhoReports(limit = 20) {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/outbreaks?limit=${limit}`
  );

  if (!response.ok) {
    throw new Error(
      `WHO API request failed: ${response.status}`
    );
  }

  const result = await response.json();

  if (!Array.isArray(result.data)) {
    throw new Error('Invalid WHO API response');
  }

  return result;
}
