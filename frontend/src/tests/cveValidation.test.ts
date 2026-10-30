import { describe, it, expect } from 'vitest';

export const validateCveId = (cve: string): boolean => {
  const cveRegex = /^CVE-\d{4}-\d{4,7}$/i;
  return cveRegex.test(cve.trim());
};

describe('CVE Format Validation', () => {
  it('accepts standard 4-digit sequence CVEs', () => {
    expect(validateCveId('CVE-2024-3094')).toBe(true);
    expect(validateCveId('CVE-2023-4863')).toBe(true);
    expect(validateCveId('CVE-2021-44228')).toBe(true);
  });

  it('accepts lowercase and trims whitespace', () => {
    expect(validateCveId('  cve-2024-3094  ')).toBe(true);
  });

  it('rejects invalid or malformed identifiers', () => {
    expect(validateCveId('CVE-24-3094')).toBe(false); // 2-digit year
    expect(validateCveId('CVE-2024-30')).toBe(false); // only 2 digits in sequence
    expect(validateCveId('GHSA-1234-5678')).toBe(false); // not a CVE
    expect(validateCveId('')).toBe(false);
    expect(validateCveId('not-a-cve')).toBe(false);
  });
});

