import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

export type UserRole = "investigador" | "editor" | "revisor" | "admin" | null;

export interface UserProfile {
  id?: number;
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
  token: string | null;
  openAuth: () => void;
  login: (user: UserProfile, token?: string) => void;
  logout: () => void;
  authOpen: boolean;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  userName: undefined,
  userRole: null,
  token: null,
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
    institution: "SaberUnerg Editorial Board",
  },
  "jurado@demo.com": {
    name: "Dr. Marco Rinaldi",
    email: "jurado@demo.com",
    role: "revisor",
    institution: "INFN Sezione di Pisa",
  },
  "admin@demo.com": {
    name: "Admin SaberUnerg",
    email: "admin@demo.com",
    role: "admin",
    institution: "SaberUnerg",
  },
};

export const ROLE_CONFIG: Record<NonNullable<UserRole>, { label: string; color: string; bg: string; dashboardPath: string }> = {
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
  revisor: {
    label: "Revisor",
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
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem("revista_auth");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("revista_auth", JSON.stringify(user));
    } else {
      localStorage.removeItem("revista_auth");
    }
  }, [user]);

  const login = (profile: UserProfile, jwt?: string) => {
    setUser(profile);
    if (jwt) {
      setToken(jwt);
      localStorage.setItem("token", jwt);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: user !== null,
        user,
        userName: user?.name,
        userRole: user?.role ?? null,
        token,
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
