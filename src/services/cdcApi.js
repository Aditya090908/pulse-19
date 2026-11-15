
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export async function fetchLatestCDCSurveillance() {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/surveillance/cdc/latest`
  );

  if (!response.ok) {
    throw new Error(
      `CDC API request failed: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data || !Array.isArray(data.records)) {
    throw new Error('Invalid CDC surveillance response');
  }

  return data;
}
