export function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }
  return Math.floor(parsed);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parseSearch(value: unknown, maxLength = 60): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

export function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.toLowerCase() === 'true';
}