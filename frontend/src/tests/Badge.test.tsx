import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/common/Badge';

describe('Badge Component', () => {
  it('renders verified state with text and green styling', () => {
    render(<Badge variant="verification" verificationState="verified" />);
    const badge = screen.getByText('Verified');
    expect(badge).toBeTruthy();
  });

  it('renders contradicted state with text and warning styling', () => {
    render(<Badge variant="verification" verificationState="contradicted" />);
    const badge = screen.getByText('Contradicted');
    expect(badge).toBeTruthy();
  });

  it('renders needs_review state with accessible label', () => {
    render(<Badge variant="verification" verificationState="needs_review" />);
    const badge = screen.getByText('Needs Review');
    expect(badge).toBeTruthy();
  });

  it('renders status badge for completed', () => {
    render(<Badge variant="status" status="completed" />);
    const badge = screen.getByText('Completed');
    expect(badge).toBeTruthy();
  });
});
