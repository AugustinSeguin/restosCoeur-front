import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useMemo,
} from "react";
import type { AuthContextType, User } from "../types/User";

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_TOKEN_KEY = "authToken";
const AUTH_USER_KEY = "authUser";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const savedUser = localStorage.getItem(AUTH_USER_KEY);

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser) as User);
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
  }, []);

  const setCachedUser = (newUser: User | null) => {
    if (!newUser) {
      localStorage.removeItem(AUTH_USER_KEY);
      setUser(null);
      return;
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = (newToken: string, newUser?: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, newToken);
    setToken(newToken);

    if (newUser) {
      setCachedUser(newUser);
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const fetchUserData = async () => {
    return;
  };

  const isAuthenticated = !!token;

  const value = useMemo(
    () => ({
      token,
      isAuthenticated,
      login,
      logout,
      user,
      setUser: setCachedUser,
      fetchUserData,
    }),
    [token, isAuthenticated, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
