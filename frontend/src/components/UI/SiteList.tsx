import type { CulturalSite } from "../../types/site";
import { MapPin } from "lucide-react";

interface SiteListProps {
  sites: CulturalSite[];
  onSelect: (site: CulturalSite) => void;
}

export default function SiteList({ sites, onSelect }: SiteListProps) {
  if (sites.length === 0) return null;

  return (
    <div
      style={{
        marginTop: "10px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        maxHeight: "60vh", // Ekranın %60'ını kaplasın en fazla
        overflowY: "auto", // Kaydırma çubuğu çıksın
        width: "100%",
      }}
    >
      {sites.map((site) => (
        <div
          key={site.id}
          onClick={() => onSelect(site)}
          style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f1f5f9",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f8fafc")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
        >
          {/* Sol taraf: Ufak resim veya ikon */}
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              backgroundColor: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            {site.main_image_url ? (
              <img
                src={site.main_image_url}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <MapPin size={20} color="#64748b" />
            )}
          </div>

          {/* Sağ Taraf: Bilgiler */}
          <div>
            <h4 style={{ margin: 0, fontSize: "14px", color: "#0f172a" }}>
              {site.name_tr}
            </h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
              {site.district}, {site.city} •{" "}
              <span style={{ color: "#b91c1c" }}>{site.category}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
