// Dosya: src/context/AuthContext.tsx

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

// Kullanıcı tipi
interface User {
  username: string;
}

// Context tipi
interface AuthContextType {
  user: User | null;
  login: (username: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Context oluşturma
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider bileşeni
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string) => {
    setUser({ username });
    console.log("Giriş yapıldı:", username);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook (Bunu export etmezsek MainLayout hata verir!)
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
