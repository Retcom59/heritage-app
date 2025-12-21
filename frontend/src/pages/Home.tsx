import { useEffect, useState, useCallback } from "react";
import HeritageMap, { MapBounds } from "../components/Map/HeritageMap";
import SiteList from "../components/UI/SiteList";
import SiteDetail from "../components/UI/SiteDetail";
import FilterModal from "../components/UI/FilterModal";
import Legend from "../components/Map/Legend";
import RoamingControls from "../components/UI/RoamingControls";
import ProximityList from "../components/UI/ProximityList";
import { siteService, routeService } from "../services/api";
import type { CulturalSite } from "../types/site";
import { Search, Map, SlidersHorizontal, Navigation2 } from "lucide-react";

export default function Home() {
  const [sites, setSites] = useState<CulturalSite[]>([]);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [selectedSite, setSelectedSite] = useState<CulturalSite | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ city: "", district: "" });

  const [locateTrigger, setLocateTrigger] = useState(0);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(
    null
  );

  // 👇 YENİ: Rota İstatistiklerine "mode" bilgisini de ekledim
  const [routeStats, setRouteStats] = useState<{
    distance: number;
    duration: number;
    mode: "car" | "bike" | "walk";
  } | null>(null);

  const [isRoaming, setIsRoaming] = useState(false);
  const [roamingRadius, setRoamingRadius] = useState(500);
  // 👇 YENİ: Ulaşım Modu State'i (Varsayılan: Yürüme)
  const [transportMode, setTransportMode] = useState<"car" | "bike" | "walk">(
    "walk"
  );

  const isFilterActive = !!(filters.city || filters.district);

  const fetchSites = useCallback(
    async (bounds?: MapBounds) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const params: any = {
          search,
          city: filters.city || undefined,
          district: filters.district || undefined,
        };

        if (isRoaming && userLocation) {
          params.user_lat = userLocation.lat;
          params.user_lon = userLocation.lon;
          params.radius = roamingRadius;
        } else if (!showAll && bounds && !isFilterActive) {
          params.min_lat = bounds.min_lat;
          params.min_lon = bounds.min_lon;
          params.max_lat = bounds.max_lat;
          params.max_lon = bounds.max_lon;
        }

        const data = await siteService.getAllSites(params);
        setSites(data);
      } catch (error) {
        console.error("Hata:", error);
      }
    },
    [
      search,
      showAll,
      filters,
      isFilterActive,
      isRoaming,
      userLocation,
      roamingRadius,
    ]
  );

  useEffect(() => {
    if (isRoaming && userLocation) fetchSites();
  }, [userLocation, roamingRadius, isRoaming, fetchSites]);
  useEffect(() => {
    if (!isRoaming) fetchSites();
  }, [fetchSites, isRoaming]);

  const handleUserLocationUpdate = (lat: number, lon: number) => {
    setUserLocation({ lat, lon });
  };

  const handleToggleRoaming = (active: boolean) => {
    setIsRoaming(active);
    if (active) {
      setLocateTrigger((prev) => prev + 1);
      setShowAll(false);
      setSearch("");
      setFilters({ city: "", district: "" });
      setRouteCoords(null);
      setRouteStats(null);
      // Modu varsayılan olarak yürümeye al (veya son seçileni koru)
      setTransportMode("walk");
      setRoamingRadius(500);
    } else {
      // Gezici mod kapanınca varsayılan olarak araç moduna dön
      setTransportMode("car");
    }
  };

  // 👇 YENİ: Mod Değişimini Yakala
  const handleChangeMode = (radius: number, mode: "walk" | "bike" | "car") => {
    setRoamingRadius(radius);
    setTransportMode(mode);
    // Eğer rota varsa, yeni moda göre tekrar hesapla (Opsiyonel ama şık olur)
    if (routeCoords && selectedSite) {
      // State güncellenmesi asenkron olduğu için handleGetDirections'ı hemen çağırmak yerine
      // useEffect kullanabiliriz veya direkt çağırırken parametre geçeriz.
      // Şimdilik kullanıcı tekrar butona basmalı veya otomatik yapabiliriz.
      setRouteCoords(null); // Eski rotayı sil ki kullanıcı yenilesin
      setRouteStats(null);
    }
  };

  const handleSiteSelect = (site: CulturalSite) => {
    setSelectedSite(site);
    setSearch("");
    setRouteCoords(null);
    setRouteStats(null);
  };

  const handleMapClick = (lat: number, lon: number) => {
    const customSite: CulturalSite = {
      id: "custom-pin",
      name_tr: "Seçilen Konum",
      name_en: "Selected Location",
      category: "Custom",
      sub_category: "User Pin",
      city: "",
      district: "",
      latitude: lat,
      longitude: lon,
      summary_tr: "Haritada işaretlediğiniz nokta.",
      external_code: "",
      neighbourhood: null,
      address: null,
      region_id: null,
      summary_en: null,
      opening_hours: null,
      ticket_required: false,
      website: null,
      main_image_url: null,
      is_unesco: false,
      protection_status: null,
      source_name: null,
      source_url: null,
      last_update: null,
    };
    setSelectedSite(customSite);
    setRouteCoords(null);
    setRouteStats(null);
    setSearch("");
  };

  // 👇 GÜNCELLENDİ: Moda göre rota hesapla
  const handleGetDirections = async () => {
    if (!userLocation || !selectedSite) {
      alert(
        "Konumunuz alınamadı. Lütfen GPS butonuna basarak konum izni verin."
      );
      setLocateTrigger((prev) => prev + 1);
      return;
    }

    // Aktif modu kullan (Roaming kapalıysa 'car' default yapmıştık)
    const route = await routeService.getRoute(
      userLocation.lat,
      userLocation.lon,
      selectedSite.latitude,
      selectedSite.longitude,
      transportMode // 👈 MODU GÖNDERİYORUZ
    );

    if (route) {
      setRouteCoords(route.coordinates);
      // İstatistiklere modu da ekle
      setRouteStats({
        distance: route.distance,
        duration: route.duration,
        mode: transportMode,
      });
    } else {
      alert("Bu modda rota bulunamadı.");
    }
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#f1f5f9",
      }}
    >
      {!isRoaming && (
        <div
          className="fade-in"
          style={{
            position: "absolute",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 32px)",
            maxWidth: "440px",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.95)",
              borderRadius: "16px",
              padding: "10px 10px 10px 20px",
              boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.8)",
            }}
          >
            <Search color="#64748b" size={20} />
            <input
              type="text"
              placeholder="Kültürel miras ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSelectedSite(null)}
              style={{
                border: "none",
                outline: "none",
                marginLeft: "12px",
                flex: 1,
                fontSize: "15px",
                color: "#1e293b",
                backgroundColor: "transparent",
                fontWeight: "500",
              }}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                backgroundColor: isFilterActive ? "#eff6ff" : "#f8fafc",
                border: "none",
                borderRadius: "12px",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                marginLeft: "8px",
                color: isFilterActive ? "#2563eb" : "#64748b",
                transition: "all 0.2s",
              }}
            >
              {" "}
              <SlidersHorizontal size={18} />{" "}
            </button>
          </div>
          {!search && !showFilters && !isFilterActive && (
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => setShowAll(!showAll)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "30px",
                  border: "none",
                  backgroundColor: showAll ? "#0f172a" : "white",
                  color: showAll ? "white" : "#0f172a",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                  fontWeight: "600",
                  fontSize: "13px",
                  backdropFilter: "blur(4px)",
                }}
              >
                <Map size={14} />{" "}
                {showAll ? "Sadece Ekranı Tara" : "Tüm Türkiye'yi Göster"}
              </button>
            </div>
          )}
          {search.length > 0 && (
            <SiteList sites={sites} onSelect={handleSiteSelect} />
          )}
        </div>
      )}

      {isRoaming && (
        <ProximityList
          sites={sites}
          userLocation={userLocation}
          radius={roamingRadius}
          onSelect={handleSiteSelect}
        />
      )}

      {showFilters && !isRoaming && (
        <FilterModal
          currentFilters={filters}
          onApply={setFilters}
          onClose={() => setShowFilters(false)}
          availableSites={sites}
        />
      )}

      {/* 👇 GÜNCELLENDİ: onChangeMode */}
      <RoamingControls
        isActive={isRoaming}
        currentRadius={roamingRadius}
        onToggle={handleToggleRoaming}
        onChangeMode={handleChangeMode}
      />

      {selectedSite && (
        <SiteDetail
          site={selectedSite}
          onClose={() => setSelectedSite(null)}
          onGetDirections={handleGetDirections}
          routeStats={routeStats}
        />
      )}

      <div
        style={{
          position: "absolute",
          bottom: "30px",
          right: "16px",
          zIndex: 900,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "12px",
        }}
      >
        {!isRoaming && (
          <button
            onClick={() => setLocateTrigger((prev) => prev + 1)}
            style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "50%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#2563eb",
              width: "44px",
              height: "44px",
              transition: "transform 0.2s",
            }}
            onMouseDown={(e) =>
              (e.currentTarget.style.transform = "scale(0.9)")
            }
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
            title="Konumuma Git"
          >
            {" "}
            <Navigation2 size={20} fill="currentColor" />{" "}
          </button>
        )}
      </div>

      <Legend />

      <HeritageMap
        sites={sites}
        selectedSite={selectedSite}
        onMarkerClick={handleSiteSelect}
        onBoundsChange={(bounds) =>
          !showAll && !isFilterActive && !isRoaming && fetchSites(bounds)
        }
        fitBoundsToSites={isFilterActive}
        locateTrigger={locateTrigger}
        onUserLocationUpdate={handleUserLocationUpdate}
        routeCoordinates={routeCoords}
        roamingRadius={null}
        userLocation={userLocation}
        onMapClick={handleMapClick}
      />
    </div>
  );
}
