// Tests for the URL normalization utility used in SearchBar

const normalizeApiBaseUrl = (rawUrl) => {
  const trimmedUrl = (rawUrl || '').trim();
  if (!trimmedUrl || trimmedUrl === 'undefined' || trimmedUrl === 'null') {
    return 'http://localhost:5000';
  }
  return trimmedUrl.replace(/\/+$/, '');
};

describe('normalizeApiBaseUrl', () => {
  it('returns default URL for empty string', () => {
    expect(normalizeApiBaseUrl('')).toBe('http://localhost:5000');
  });

  it('returns default URL for undefined', () => {
    expect(normalizeApiBaseUrl(undefined)).toBe('http://localhost:5000');
  });

  it('returns default URL for null', () => {
    expect(normalizeApiBaseUrl(null)).toBe('http://localhost:5000');
  });

  it('returns default URL for string "undefined"', () => {
    expect(normalizeApiBaseUrl('undefined')).toBe('http://localhost:5000');
  });

  it('strips trailing slash', () => {
    expect(normalizeApiBaseUrl('http://localhost:5000/')).toBe('http://localhost:5000');
  });

  it('strips multiple trailing slashes', () => {
    expect(normalizeApiBaseUrl('http://localhost:5000///')).toBe('http://localhost:5000');
  });

  it('preserves valid URL unchanged', () => {
    expect(normalizeApiBaseUrl('http://prod.example.com/sdt')).toBe('http://prod.example.com/sdt');
  });

  it('trims whitespace', () => {
    expect(normalizeApiBaseUrl('  http://localhost:5000  ')).toBe('http://localhost:5000');
  });
});
