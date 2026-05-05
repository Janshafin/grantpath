import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAsync } from '../client/src/frontend-refactor/hooks/useAsync.js'; // The file path doesn't matter for the test execution as long as the module resolves

describe('The Race-Condition Lock (useAsync)', () => {
  it('Double-Submit Simulation: ignores second call while first is pending', async () => {
    // Create a mock network request that takes 50ms to resolve
    const mockApiCall = vi.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('success'), 50))
    );

    const { result } = renderHook(() => useAsync(mockApiCall));

    // Simulate an aggressive user double-clicking the submit button
    act(() => {
      result.current.execute();
      result.current.execute(); // The second click happens instantly while isSubmittingRef.current = true
    });

    // We must wait for the hook's internal promise to resolve to clean up the isLoading state
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verification: The execute function should have hard-locked the second request,
    // resulting in the mock API only receiving exactly ONE call.
    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(result.current.data).toBe('success');
  });

  it('Error Recovery: gracefully catches 500 Internal Server Error without crashing', async () => {
    // Mock an API that throws a 500 error
    const mockApiCall = vi.fn().mockRejectedValue(new Error('500 Internal Server Error'));

    const { result } = renderHook(() => useAsync(mockApiCall));

    await act(async () => {
      await result.current.execute();
    });

    // Verification: The useAsync hook traps the error and binds it to the local error state
    expect(mockApiCall).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBe('500 Internal Server Error');
  });
});
