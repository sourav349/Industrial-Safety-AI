import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

const demoUsers = {
  admin: { password: "admin123", role: "Admin", name: "Safety Admin" },
  supervisor: { password: "super123", role: "Supervisor", name: "Shift Supervisor" },
  viewer: { password: "viewer123", role: "Viewer", name: "Safety Viewer" },
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("humanshield-user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (username, password) => {
    const match = demoUsers[username];
    if (!match || match.password !== password) {
      throw new Error("Invalid username or password.");
    }
    const loggedIn = { username, name: match.name, role: match.role };
    localStorage.setItem("humanshield-user", JSON.stringify(loggedIn));
    setUser(loggedIn);
  };

  const logout = () => {
    localStorage.removeItem("humanshield-user");
    setUser(null);
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
