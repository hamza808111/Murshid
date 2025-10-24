import { vi } from 'vitest'

// Mock user data
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    name: 'Test User',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

export const mockAdminUser = {
  id: 'admin-user-id',
  email: 'admin@example.com',
  user_metadata: {
    name: 'Admin User',
  },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

export const mockProfile = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  establishment_name: 'Test University',
  level: '1st Year',
  gender: 'Male',
  role: 'Student',
  student_type: 'University',
  track: 'Science',
  is_admin: false,
  created_at: new Date().toISOString(),
}

export const mockAdminProfile = {
  id: 'admin-user-id',
  name: 'Admin User',
  email: 'admin@example.com',
  establishment_name: null,
  level: null,
  gender: null,
  role: null,
  student_type: null,
  track: null,
  is_admin: true,
  created_at: new Date().toISOString(),
}

// Mock Supabase client
export const createMockSupabaseClient = () => {
  const mockAuth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    admin: {
      deleteUser: vi.fn(),
    },
  }

  const mockFrom = vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    order: vi.fn().mockReturnThis(),
  }))

  return {
    auth: mockAuth,
    from: mockFrom,
  }
}

// Mock successful login response
export const mockLoginSuccess = {
  data: {
    user: mockUser,
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    },
  },
  error: null,
}

// Mock failed login response
export const mockLoginError = {
  data: {
    user: null,
    session: null,
  },
  error: {
    message: 'Invalid login credentials',
    status: 400,
  },
}

// Mock signup success response
export const mockSignupSuccess = {
  data: {
    user: mockUser,
    session: {
      access_token: 'mock-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: mockUser,
    },
  },
  error: null,
}

// Mock profile fetch success
export const mockProfileFetchSuccess = {
  data: mockProfile,
  error: null,
}

