export enum UserType {
  permanent = "permanent",
  occasional = "occasional",
  newcomer = "newcomer",
}

export interface User {
  id: number;
  lastName: string;
  firstName: string;
  username: string;
  birthdate: string;
  codePostal: string;
  email: string | null;
  phoneNumber: string;
  /** Null when isAdmin = false */
  password: string | null;
  isActive: boolean;
  isAdmin: boolean;
  type: UserType;
  collections?: Array<{
    collectionId: number;
    collection: {
      id: number;
      title: string;
      isActive: boolean;
      formUrl: string;
    };
  }>;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user?: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  fetchUserData: () => Promise<void>;
}
