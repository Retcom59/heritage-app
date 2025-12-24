import type { CulturalSite } from "../../types/site";
import {
  X,
  Navigation,
  MapPin,
  Clock,
  Ticket,
  Globe,
  Award,
  Calendar,
  Car,
  Bike,
  Footprints,
  Hourglass,
} from "lucide-react";

interface SiteDetailProps {
  site: CulturalSite;
  onClose: () => void;
  onGetDirections?: () => void;
  // Mod bilgisini de içeren yeni tip
  routeStats?: {
    distance: number;
    duration: number;
    mode: "car" | "bike" | "walk";
  } | null;
}

// Süreyi Formatlama
const formatDuration = (seconds: number) => {
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} dk`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} sa ${mins} dk` : `${hours} saat`;
};

// Mod Etiketi ve İkonu
const getModeDetails = (mode: "car" | "bike" | "walk") => {
  switch (mode) {
    case "walk":
      return {
        label: "Yürüyerek",
        icon: <Footprints size={18} color="#10b981" />,
      };
    case "bike":
      return { label: "Bisikletle", icon: <Bike size={18} color="#f59e0b" /> };
    case "car":
    default:
      return { label: "Araçla", icon: <Car size={18} color="#3b82f6" /> };
  }
};

export default function SiteDetail({
  site,
  onClose,
  onGetDirections,
  routeStats,
}: SiteDetailProps) {
  const isMobile = window.innerWidth < 768;
  const modeDetails = routeStats ? getModeDetails(routeStats.mode) : null;

  return (
    <div
      className="animate-slide-up"
      style={{
        /* ... (Stiller aynı) ... */
        position: "absolute",
        zIndex: 2000,
        bottom: isMobile ? 0 : "20px",
        left: isMobile ? 0 : "20px",
        width: isMobile ? "100%" : "400px",
        maxHeight: isMobile ? "85vh" : "90vh",
        backgroundColor: "white",
        borderRadius: isMobile ? "24px 24px 0 0" : "20px",
        boxShadow: "0 -4px 40px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        border: isMobile ? "none" : "1px solid rgba(0,0,0,0.05)",
      }}
    >
      {/* ... (Resim ve İçerik Kısımları AYNI) ... */}
      <div
        style={{
          position: "relative",
          height: "200px",
          flexShrink: 0,
          backgroundColor: "#f1f5f9",
        }}
      >
        {site.main_image_url ? (
          <img
            src={site.main_image_url}
            alt={site.name_tr}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
          >
            {" "}
            <MapPin size={48} />{" "}
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            border: "none",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            cursor: "pointer",
          }}
        >
          {" "}
          <X size={18} />{" "}
        </button>
        <div
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            backgroundColor: "rgba(255,255,255,0.95)",
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#0f172a",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {" "}
          {site.category}{" "}
        </div>
      </div>

      <div
        className="custom-scroll"
        style={{
          padding: "24px",
          overflowY: "auto",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* ... (Başlık ve Bilgiler AYNI) ... */}
        <div>
          <h2
            style={{
              margin: "0 0 8px 0",
              fontSize: "22px",
              fontWeight: "700",
              color: "#0f172a",
            }}
          >
            {site.name_tr}
          </h2>
          {site.city && (
            <div
              style={{
                display: "flex",
                gap: "6px",
                fontSize: "13px",
                color: "#64748b",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <MapPin size={14} />
              <span>
                {site.district ? `${site.district}, ` : ""}
                {site.city}
              </span>
            </div>
          )}
          <p style={{ fontSize: "15px", color: "#334155", margin: 0 }}>
            {site.summary_tr || "Açıklama yok."}
          </p>
        </div>
        {/* ... (Saatler, Ücret vb. AYNI) ... */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
          }}
        >
          {/* ...Kutucuklar... */}
        </div>

        {/* --- 3. ROTA VE İSTATİSTİKLER (GÜNCELLENDİ) --- */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {/* 👇 ROTA İSTATİSTİKLERİ KUTUSU */}
          {routeStats && modeDetails && (
            <div
              className="fade-in"
              style={{
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#1e293b",
                color: "white",
                padding: "12px 16px",
                borderRadius: "12px",
                alignItems: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  {modeDetails.icon}
                  <span style={{ fontWeight: "700", fontSize: "15px" }}>
                    {(routeStats.distance / 1000).toFixed(1)} km
                  </span>
                </div>
                <div
                  style={{
                    width: "1px",
                    height: "16px",
                    background: "rgba(255,255,255,0.2)",
                  }}
                ></div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <Hourglass size={16} color="#fbbf24" />
                  <span style={{ fontWeight: "600", fontSize: "14px" }}>
                    {formatDuration(routeStats.duration)}
                  </span>
                </div>
              </div>
              <span style={{ fontSize: "11px", opacity: 0.7 }}>
                {modeDetails.label}
              </span>
            </div>
          )}

          <button
            onClick={onGetDirections}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              backgroundColor: routeStats ? "#eff6ff" : "#2563eb",
              color: routeStats ? "#2563eb" : "white",
              border: routeStats ? "1px solid #bfdbfe" : "none",
              padding: "14px",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: routeStats
                ? "none"
                : "0 4px 12px rgba(37, 99, 235, 0.3)",
              transition: "all 0.2s",
            }}
          >
            <Navigation size={20} />
            {routeStats ? "Rotayı Yenile" : "Rota Oluştur"}
          </button>
        </div>
      </div>
    </div>
  );
}
