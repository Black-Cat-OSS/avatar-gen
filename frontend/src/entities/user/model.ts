// User entity model
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  avatar?: string;
}

export interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
}
