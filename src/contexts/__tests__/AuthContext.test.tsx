import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@/test-utils/render';
import { AuthProvider, useAuth } from '../AuthContext';
import { createMockUser, createMockSession } from '@/test-utils/factories';

const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(),
        maybeSingle: vi.fn(),
      })),
    })),
  })),
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

// Mock do useToast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Componente de teste
const TestComponent = () => {
  const { user, session, loading, isAdmin, signUp, signIn, signOut } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="user">{user?.email || 'No user'}</div>
      <div data-testid="session">{session ? 'Has session' : 'No session'}</div>
      <div data-testid="isAdmin">{isAdmin ? 'Admin' : 'Not admin'}</div>
      <button data-testid="sign-up" onClick={() => signUp('test@example.com', 'password', 'Test User')}>
        Sign Up
      </button>
      <button data-testid="sign-in" onClick={() => signIn('test@example.com', 'password')}>
        Sign In
      </button>
      <button data-testid="sign-out" onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide initial state', () => {
    mockSupabase.auth.getSession.mockResolvedValue({ data: { session: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(getByTestId('user')).toHaveTextContent('No user');
    expect(getByTestId('session')).toHaveTextContent('No session');
    expect(getByTestId('isAdmin')).toHaveTextContent('Not admin');
  });

  it('should handle sign up', async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpButton = getByTestId('sign-up');
    signUpButton.click();

    await vi.waitFor(() => {
      expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
        options: {
          data: { full_name: 'Test User' },
        },
      });
    });
  });

  it('should handle sign in', async () => {
    mockSupabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: createMockUser() },
      error: null,
    });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = getByTestId('sign-in');
    signInButton.click();

    await vi.waitFor(() => {
      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password',
      });
    });
  });

  it('should handle sign out', async () => {
    mockSupabase.auth.signOut.mockResolvedValue({ error: null });

    const { getByTestId } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signOutButton = getByTestId('sign-out');
    signOutButton.click();

    await vi.waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });
});