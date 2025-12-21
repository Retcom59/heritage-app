import { Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function MainLayout() {
  const { user, login, logout } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        width: "100vw",
      }}
    >
      <header
        style={{
          height: "60px",
          backgroundColor: "#1e293b",
          color: "white",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          justifyContent: "space-between",
          zIndex: 1000,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "1.2rem" }}>🏛️ Heritage GIS</h1>
          <nav></nav>
        </div>
        <div>
          {user ? (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <span>{user.username}</span>
              <button
                onClick={logout}
                style={{ cursor: "pointer", padding: "5px" }}
              >
                Çıkış
              </button>
            </div>
          ) : (
            <button
              onClick={() => login("DemoUser")}
              style={{
                padding: "6px 12px",
                cursor: "pointer",
                background: "#3b82f6",
                border: "none",
                color: "white",
                borderRadius: "4px",
              }}
            >
              Giriş Yap (Demo)
            </button>
          )}
        </div>
      </header>

      <div style={{ flex: 1, position: "relative" }}>
        <Outlet />
      </div>
    </div>
  );
}
