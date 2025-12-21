import { useState } from "react";
import { Info, X, Moon, Landmark, Shield, LayoutGrid } from "lucide-react";

export default function Legend() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "absolute",
          bottom: "30px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "12px",
          borderRadius: "50%",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Info size={24} color="#0f172a" />
      </button>
    );
  }

  const items = [
    {
      label: "Dini & Anıt (Cami, Kilise, Türbe)", // İsim Genişletildi
      color: "#ef4444",
      icon: (
        <Moon size={18} color="#ef4444" fill="currentColor" fillOpacity={0.1} />
      ),
    },
    {
      label: "Müze, Antik Kent & Sit Alanı", // İsim Genişletildi
      color: "#8b5cf6",
      icon: <Landmark size={18} color="#8b5cf6" />,
    },
    {
      label: "Askeri (Kale, Sur, Burç)",
      color: "#10b981",
      icon: <Shield size={18} color="#10b981" />,
    },
    {
      label: "Sivil (Han, Hamam, Köprü)", // İsim Genişletildi
      color: "#f59e0b",
      icon: <LayoutGrid size={18} color="#f59e0b" />,
    },
  ];

  return (
    <div
      style={{
        position: "absolute",
        bottom: "30px",
        right: "20px",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        padding: "16px",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        minWidth: "240px", // Genişlik arttı
        backdropFilter: "blur(5px)",
        border: "1px solid rgba(255,255,255,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          borderBottom: "1px solid #eee",
          paddingBottom: "8px",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: "700",
            color: "#0f172a",
          }}
        >
          Harita Gösterimi
        </h4>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            display: "flex",
          }}
        >
          <X size={16} color="#94a3b8" />
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: "white",
                border: `2px solid ${item.color}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                flexShrink: 0,
              }}
            >
              {item.icon}
            </div>
            <span
              style={{ fontSize: "13px", color: "#334155", fontWeight: "500" }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
