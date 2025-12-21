import { Footprints, Bike, Car, Radar, X, Navigation } from "lucide-react";

interface RoamingControlsProps {
  isActive: boolean;
  currentRadius: number;
  onToggle: (active: boolean) => void;
  // 👇 YENİ: Mod Değişimini Bildir
  onChangeMode: (radius: number, mode: "walk" | "bike" | "car") => void;
}

export default function RoamingControls({
  isActive,
  currentRadius,
  onToggle,
  onChangeMode,
}: RoamingControlsProps) {
  // Mod Listesi (ID'leri 'walk', 'bike', 'car' olarak düzelttik)
  const modes = [
    {
      id: "walk",
      label: "Yürüme",
      radius: 500,
      icon: <Footprints size={20} />,
    },
    { id: "bike", label: "Bisiklet", radius: 2000, icon: <Bike size={20} /> },
    { id: "car", label: "Araç", radius: 10000, icon: <Car size={20} /> },
  ];

  if (!isActive) {
    return (
      <button
        onClick={() => onToggle(true)}
        style={{
          position: "absolute",
          bottom: "110px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          backgroundColor: "#0f172a",
          color: "white",
          padding: "12px 24px",
          borderRadius: "30px",
          border: "none",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          cursor: "pointer",
          fontWeight: "600",
          transition: "transform 0.2s",
          fontSize: "15px",
        }}
        onMouseDown={(e) =>
          (e.currentTarget.style.transform = "translateX(-50%) scale(0.95)")
        }
        onMouseUp={(e) =>
          (e.currentTarget.style.transform = "translateX(-50%) scale(1)")
        }
      >
        <Radar size={20} className={isActive ? "animate-spin" : ""} />
        Gezici Modu Başlat
      </button>
    );
  }

  return (
    <div
      className="animate-slide-up"
      style={{
        position: "absolute",
        bottom: "30px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        backgroundColor: "rgba(255, 255, 255, 0.90)",
        padding: "16px",
        borderRadius: "24px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(255,255,255,0.6)",
        width: "90%",
        maxWidth: "380px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              padding: "8px",
              background: "#eff6ff",
              borderRadius: "50%",
              color: "#2563eb",
            }}
          >
            <Navigation size={18} className="animate-pulse" />
          </div>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: "15px",
                color: "#0f172a",
                fontWeight: "700",
              }}
            >
              Canlı Keşif
            </h4>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Çevrendeki değerler taranıyor...
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggle(false)}
          style={{
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
          }}
        >
          {" "}
          <X size={18} />{" "}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "8px",
          justifyContent: "space-between",
          backgroundColor: "#f8fafc",
          padding: "6px",
          borderRadius: "16px",
        }}
      >
        {modes.map((mode) => {
          const isSelected = currentRadius === mode.radius;
          return (
            <button
              key={mode.id}
              // 👇 Mod ve Yarıçapı Birlikte Gönder
              onClick={() =>
                onChangeMode(mode.radius, mode.id as "walk" | "bike" | "car")
              }
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "10px 4px",
                borderRadius: "12px",
                border: "none",
                backgroundColor: isSelected ? "white" : "transparent",
                color: isSelected ? "#2563eb" : "#64748b",
                boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                cursor: "pointer",
                transition: "all 0.2s",
                fontWeight: isSelected ? "700" : "500",
              }}
            >
              {mode.icon}
              <span style={{ fontSize: "12px" }}>{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
