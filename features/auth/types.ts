export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
};

export type AuthToken = {
  token: string;
  userEmail: string;
  userNicename: string;
  userDisplayName: string;
};

export type AuthUser = {
  email: string;
  nicename: string;
  displayName: string;
};

export type AuthState = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;
};
