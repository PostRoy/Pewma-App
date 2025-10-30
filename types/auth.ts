export interface User {
  id: string;
  email: string;
  username: string;
  bio?: string;
  createdAt: string;
}

export interface AuthData {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}
