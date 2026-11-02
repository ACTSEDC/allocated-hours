const SHEET_URL = import.meta.env.VITE_SHEET_URL;

// Sends the enrollment number to the Google Apps Script
// and returns { name, results, total }.
export async function searchRecords({ enrollment }) {
  if (!SHEET_URL) throw new Error('VITE_SHEET_URL is not set');

  const params = new URLSearchParams({ enrollment: enrollment.trim() });
  const res = await fetch(`${SHEET_URL}?${params}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}
