export function contains(value: any, needle: any): boolean {
  if (Array.isArray(value)) {
    return value.includes(needle);
  }
  if (typeof value === 'string') {
    return value.includes(needle);
  }
  return false;
}

export function size(value: any): number {
  if (Array.isArray(value)) {
    return value.length;
  }
  if (typeof value === 'string') {
    return value.length;
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).length;
  }
  return 0;
}
