import { useMemo } from "react";
import type { CulturalSite } from "../../types/site";
import { MapPin, Navigation, Radar } from "lucide-react";

interface ProximityListProps {
  sites: CulturalSite[];
  userLocation: { lat: number; lon: number } | null;
  radius: number;
  onSelect: (site: CulturalSite) => void;
}

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ProximityList({
  sites,
  userLocation,
  radius,
  onSelect,
}: ProximityListProps) {
  const nearbySites = useMemo(() => {
    if (!userLocation || sites.length === 0) return [];
    return sites
      .map((site) => ({
        ...site,
        distance: getDistanceFromLatLonInKm(
          userLocation.lat,
          userLocation.lon,
          site.latitude,
          site.longitude
        ),
      }))
      .filter((site) => site.distance * 1000 <= radius)
      .sort((a, b) => a.distance - b.distance);
  }, [sites, userLocation, radius]);

  if (!userLocation) return null;

  // BOŞ DURUM (Menzil boşsa)
  if (nearbySites.length === 0) {
    return (
      <div
        className="fade-in"
        style={{
          position: "absolute",
          top: "80px",
          right: "16px",
          zIndex: 1000,
          backgroundColor: "rgba(15, 23, 42, 0.8)",
          color: "white",
          padding: "10px 14px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "500",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          backdropFilter: "blur(8px)",
          maxWidth: "220px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <Radar
          size={16}
          className="animate-spin"
          style={{ opacity: 0.8, flexShrink: 0 }}
        />
        <span>
          Menzil taranıyor... (
          {radius < 1000 ? radius + "m" : radius / 1000 + "km"})
        </span>
      </div>
    );
  }

  return (
    <div
      className="fade-in custom-scroll"
      style={{
        position: "absolute",
        top: "50px", // Üstten biraz boşluk (Kontrollerle çakışmasın)
        right: "16px", // Sağdan boşluk
        zIndex: 1000,
        width: "260px",
        maxHeight: "20vh", // Ekranın %35'ini geçmesin (KISA TUTTUK)
        overflowY: "auto", // CSS'teki custom-scroll burada devreye girecek
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        paddingRight: "2px",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.95)",
          color: "white",
          padding: "10px 14px",
          borderRadius: "10px",
          fontSize: "12px",
          fontWeight: "600",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
          backdropFilter: "blur(4px)",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Navigation size={12} className="animate-pulse" />
          <span>Yakınında {nearbySites.length} yer var</span>
        </div>
        <span
          style={{
            fontSize: "10px",
            opacity: 0.8,
            backgroundColor: "rgba(255,255,255,0.1)",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          {radius < 1000 ? `${radius}m` : `${radius / 1000}km`}
        </span>
      </div>

      {/* Liste */}
      {nearbySites.map((site) => (
        <div
          key={site.id}
          onClick={() => onSelect(site)}
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(12px)",
            padding: "10px 12px", // İç boşluğu azalttık (Compact)
            borderRadius: "10px",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid rgba(255,255,255,0.6)",
            transition: "all 0.2s",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "white")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.9)")
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#1e293b",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "160px",
              }}
            >
              {site.name_tr}
            </span>
            <span
              style={{
                fontSize: "10px",
                fontWeight: "700",
                color: site.distance < 0.2 ? "#dc2626" : "#2563eb",
                backgroundColor: site.distance < 0.2 ? "#fef2f2" : "#eff6ff",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              {site.distance < 1
                ? `${Math.round(site.distance * 1000)}m`
                : `${site.distance.toFixed(1)}km`}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              color: "#64748b",
            }}
          >
            <MapPin size={10} />
            <span style={{ fontSize: "10px", fontWeight: "500" }}>
              {site.category}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
