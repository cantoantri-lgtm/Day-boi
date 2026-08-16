// Helper to convert sheet rows array to object array
export function rowsToObjects<T>(rows: any[][] | null | undefined, headers: string[]): T[] {
  if (!rows || rows.length === 0) return [];
  // Assuming the first row in 'rows' is data, not header, because we skip header in our fetch usually
  // Or we fetch everything including header. Let's assume 'rows' includes header.
  const actualHeaders = rows[0];
  const dataRows = rows.slice(1);
  return dataRows
  .filter(row => row.some(cell => cell !== '' && cell !== null && cell !== undefined))
  .map(row => {
    const obj: any = {};
    actualHeaders.forEach((header, index) => {
      obj[header] = row[index] !== undefined ? row[index] : null;
    });
    return obj as T;
  });
}

// Helper to find the row index (1-based) by a specific column value
// Requires fetching the whole column first.
