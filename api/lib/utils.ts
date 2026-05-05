export function sanitizeArray(arr?: string[]): string[] {
  return (arr || []).map(item => item.toLowerCase());
}

export function parseGpa(gpa?: string | number): number {
  if (typeof gpa === 'number') return gpa;
  return parseFloat(gpa || '0') || 0;
}
