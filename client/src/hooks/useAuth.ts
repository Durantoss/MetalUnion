// Simplified auth hook without React hooks for now
export function useAuth() {
  return {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    extendSession: () => {}
  };
}