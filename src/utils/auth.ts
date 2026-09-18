import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

const LOCAL_USER_KEY = 'qubitlab-local-auth-user';

const readLocalUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) as AuthUser : null;
  } catch {
    return null;
  }
};

const saveLocalUser = (user: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) window.localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(user));
    else window.localStorage.removeItem(LOCAL_USER_KEY);
  } catch {
    // Local storage is optional
  }
};

const mapUser = (user: { id: string; email?: string | null; created_at?: string; user_metadata?: Record<string, unknown> }): AuthUser => ({
  id: user.id,
  email: user.email || '',
  name: typeof user.user_metadata?.name === 'string' && user.user_metadata.name.trim()
    ? user.user_metadata.name.trim()
    : user.email?.split('@')[0] || 'Learner',
  createdAt: user.created_at || new Date().toISOString(),
});

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  if (!isSupabaseConfigured) {
    return readLocalUser();
  }
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return null;
    return mapUser(data.user);
  } catch {
    return null;
  }
};

export const login = async (email: string, password: string): Promise<AuthUser> => {
  if (!isSupabaseConfigured) {
    const localUser: AuthUser = {
      id: `local-${Date.now()}`,
      email: email.trim(),
      name: email.trim().split('@')[0] || 'Learner',
      createdAt: new Date().toISOString(),
    };
    saveLocalUser(localUser);
    return localUser;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error || !data.user) throw new Error(error?.message || 'Unable to sign in.');
  return mapUser(data.user);
};

export const signup = async (name: string, email: string, password: string): Promise<AuthUser> => {
  if (!isSupabaseConfigured) {
    const localUser: AuthUser = {
      id: `local-${Date.now()}`,
      email: email.trim(),
      name: name.trim() || email.trim().split('@')[0] || 'Learner',
      createdAt: new Date().toISOString(),
    };
    saveLocalUser(localUser);
    return localUser;
  }
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() } },
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Unable to create your account.');

  if (!data.session) {
    throw new Error('Account created. Check your email to confirm your account, then sign in.');
  }

  return mapUser(data.user);
};

export const logout = async () => {
  saveLocalUser(null);
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message || 'Unable to log out.');
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
  }
};

export const loginWithGoogle = async () => {
  if (!isSupabaseConfigured) {
    const guestUser: AuthUser = {
      id: `google-local-${Date.now()}`,
      email: 'learner@qubitlab.internal',
      name: 'Quantum Explorer',
      createdAt: new Date().toISOString(),
    };
    saveLocalUser(guestUser);
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw new Error(error.message || 'Unable to start Google sign-in.');
};

