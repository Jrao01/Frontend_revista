import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "investigador" | "editor" | "jurado" | "admin" | null;

export interface UserProfile {
  name: string;
  email: string;
  role: UserRole;
  institution?: string;
  avatar?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: UserProfile | null;
  userName?: string;
  userRole: UserRole;
  openAuth: () => void;
  login: (user: UserProfile) => void;
  logout: () => void;
  authOpen: boolean;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  userName: undefined,
  userRole: null,
  openAuth: () => {},
  login: () => {},
  logout: () => {},
  authOpen: false,
  closeAuth: () => {},
});

// Demo accounts for quick access
export const DEMO_ACCOUNTS: Record<string, UserProfile> = {
  "investigador@demo.com": {
    name: "Dr. Alejandro García",
    email: "investigador@demo.com",
    role: "investigador",
    institution: "Instituto de Neurociencias, UNAM",
  },
  "editor@demo.com": {
    name: "Dra. Carmen Vidal",
    email: "editor@demo.com",
    role: "editor",
    institution: "CienciaEduc Editorial Board",
  },
  "jurado@demo.com": {
    name: "Dr. Marco Rinaldi",
    email: "jurado@demo.com",
    role: "jurado",
    institution: "INFN Sezione di Pisa",
  },
  "admin@demo.com": {
    name: "Admin CienciaEduc",
    email: "admin@demo.com",
    role: "admin",
    institution: "CienciaEduc",
  },
};

export const ROLE_CONFIG = {
  investigador: {
    label: "Investigador",
    color: "#3ecf8e",
    bg: "rgba(62,207,142,0.12)",
    dashboardPath: "/dashboard/investigador",
  },
  editor: {
    label: "Editor",
    color: "#6c8ebf",
    bg: "rgba(108,142,191,0.12)",
    dashboardPath: "/dashboard/editor",
  },
  jurado: {
    label: "Jurado",
    color: "#9b7fd4",
    bg: "rgba(155,127,212,0.12)",
    dashboardPath: "/dashboard/jurado",
  },
  admin: {
    label: "Admin",
    color: "#e05252",
    bg: "rgba(224,82,82,0.12)",
    dashboardPath: "/dashboard/admin",
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const login = (profile: UserProfile) => {
    setUser(profile);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: user !== null,
        user,
        userName: user?.name,
        userRole: user?.role ?? null,
        openAuth: () => setAuthOpen(true),
        login,
        logout,
        authOpen,
        closeAuth: () => setAuthOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
