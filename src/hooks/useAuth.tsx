import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { auth } from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, metadata?: any) => Promise<boolean>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    auth.getCurrentUser().then((user) => {
      setUser(user);
      setLoading(false);
    }).catch(() => {
      // Fallback for development without Supabase
      setUser(null);
      setLoading(false);
    });

    // Listen for auth changes
    try {
      const { data: { subscription } } = auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          setLoading(false);
          
          // Check admin status
          if (session?.user) {
            setIsAdmin(false);
          } else {
            setIsAdmin(false);
          }
        }
      );

      return () => subscription.unsubscribe();
    } catch (error) {
      // Fallback for development
      setLoading(false);
      console.warn('Supabase auth not available:', error);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await auth.signIn(email, password);
      
      if (error) {
        toast.error('Erro ao fazer login: ' + error.message);
        return false;
      }
      
      toast.success('Login realizado com sucesso!');
      return true;
    } catch (error) {
      toast.error('Erro inesperado ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await auth.signUp(email, password, metadata);
      
      if (error) {
        toast.error('Erro ao criar conta: ' + error.message);
        return false;
      }
      
      toast.success('Conta criada com sucesso! Verifique seu email.');
      return true;
    } catch (error) {
      toast.error('Erro inesperado ao criar conta');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      await auth.signOut();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};