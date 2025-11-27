export type LoginForm = {
  email: string;
  password: string;
};

export type TokenOut = {
  access_token: string;
  token_type: 'bearer';
};

export type Me = {
  id: string;
  status?: string;
  email: string;
  role: number;
};

export type LoginIn = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  email: string;
  role: number;
};

export type AuthContextValue = {
  user: User;
  loading: boolean;
  reload: () => Promise<void>;
  setUser: (u: User) => void;
};
