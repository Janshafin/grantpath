import React from 'react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ErrorBoundary } from '../client/src/frontend-refactor/ErrorBoundary.js';

describe('Error Recovery (ErrorBoundary)', () => {
  afterEach(() => {
    cleanup();
  });

  it('Captures rendering crashes and allows user to Retry without refreshing the page', () => {
    // Suppress console.error so it doesn't clutter our test output when the boundary catches it
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Create a dummy component that intentionally throws an error
    const Bomb = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) {
        throw new Error('500 Internal Server Error');
      }
      return <div>Safe Component Loaded Successfully</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <Bomb shouldThrow={true} />
      </ErrorBoundary>
    );

    // Verify Error Boundary caught the error and shows the custom fallback UI
    expect(screen.getByText('Something went wrong')).toBeTruthy();
    expect(screen.getByText(/500 Internal Server Error/i)).toBeTruthy();

    // Verify 'Try Again' button exists for user recovery
    const retryButton = screen.getByText(/Try Again/i);
    expect(retryButton).toBeTruthy();

    // Re-render the child component in a safe state (simulating a successful network retry)
    rerender(
      <ErrorBoundary>
        <Bomb shouldThrow={false} />
      </ErrorBoundary>
    );

    // Click retry to reset the boundary's error state and render the safe children
    fireEvent.click(retryButton);

    // Verify recovery was successful and the fallback UI was wiped
    expect(screen.queryByText('Something went wrong')).toBeNull();
    expect(screen.getByText('Safe Component Loaded Successfully')).toBeTruthy();

    consoleSpy.mockRestore();
  });
});
