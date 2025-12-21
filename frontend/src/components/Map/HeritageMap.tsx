import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Polyline,
} from "react-leaflet";
import type { CulturalSite } from "../../types/site";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- KATEGORİ GRUPLAMA ---
const getCategoryGroup = (rawCategory: string) => {
  if (!rawCategory) return "civil";
  const cat = rawCategory.toLowerCase();
  if (
    cat.includes("cami") ||
    cat.includes("kilise") ||
    cat.includes("manastır") ||
    cat.includes("sinagog") ||
    cat.includes("dini") ||
    cat.includes("inanç") ||
    cat.includes("mezar") ||
    cat.includes("türbe") ||
    cat.includes("medrese")
  )
    return "religious";
  if (
    cat.includes("müze") ||
    cat.includes("antik") ||
    cat.includes("arkeo") ||
    cat.includes("sit") ||
    cat.includes("ören") ||
    cat.includes("miras") ||
    cat.includes("doğal")
  )
    return "museum";
  if (
    cat.includes("kale") ||
    cat.includes("sur") ||
    cat.includes("hisar") ||
    cat.includes("kule") ||
    cat.includes("tabya")
  )
    return "military";
  return "civil";
};

// --- NORMAL İKONLAR ---
const createCustomIcon = (rawCategory: string) => {
  const group = getCategoryGroup(rawCategory);
  let cssClass = "marker-pin ";
  let iconSVG = "";
  switch (group) {
    case "religious":
      cssClass += "marker-religious";
      iconSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
      break;
    case "museum":
      cssClass += "marker-museum";
      iconSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>`;
      break;
    case "military":
      cssClass += "marker-military";
      iconSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>`;
      break;
    default:
      cssClass += "marker-civil";
      iconSVG = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`;
      break;
  }
  return L.divIcon({
    className: "custom-marker",
    html: `<div class="${cssClass}" style="display:flex; justify-content:center; align-items:center; width:100%; height:100%;">${iconSVG}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// --- KIRMIZI PİN (Elle Seçilen Konum İçin) ---
const customPinIcon = L.divIcon({
  className: "custom-pin-marker",
  html: `<svg width="40" height="40" viewBox="0 0 24 24" fill="#ef4444" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3" fill="white"></circle></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// --- CANLI KONUM İKONU ---
const createUserIcon = (heading: number | null) => {
  const headingHTML =
    heading !== null
      ? `<div class="user-heading-cone"></div><div class="user-dot"></div>`
      : `<div class="user-pulse"></div><div class="user-dot"></div>`;
  return L.divIcon({
    className: "user-location-marker",
    html: `<div style="transform: rotate(${
      heading || 0
    }deg); transition: transform 0.1s linear; display:flex; justify-content:center; align-items:center;">${headingHTML}</div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

export interface MapBounds {
  min_lat: number;
  min_lon: number;
  max_lat: number;
  max_lon: number;
}

// --- MAP CONTROLLER ---
function MapController({
  selectedSite,
  sites,
  shouldFitBounds,
  routeCoordinates,
}: {
  selectedSite: CulturalSite | null;
  sites: CulturalSite[];
  shouldFitBounds: boolean;
  routeCoordinates: [number, number][] | null;
}) {
  const map = useMap();
  const prevSitesLength = useRef(0);

  useEffect(() => {
    // 1. Öncelik: Rota varsa rotaya sığdır
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      if (bounds.isValid()) map.fitBounds(bounds, { padding: [50, 50] });
    }
    // 2. Öncelik: Seçili site varsa oraya uç
    else if (selectedSite?.latitude && selectedSite?.longitude) {
      const zoomLevel = selectedSite.category === "Custom" ? 16 : 15;
      map.flyTo([selectedSite.latitude, selectedSite.longitude], zoomLevel, {
        duration: 1.0,
      });
    }
  }, [selectedSite, map, routeCoordinates]);

  // 3. Öncelik: Filtreleme sonucu (sadece rota yoksa ve site seçili değilse)
  useEffect(() => {
    if (
      !routeCoordinates &&
      !selectedSite &&
      shouldFitBounds &&
      sites.length > 0 &&
      sites.length !== prevSitesLength.current
    ) {
      const bounds = L.latLngBounds(
        sites.map((s) => [s.latitude, s.longitude])
      );
      if (bounds.isValid())
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
    prevSitesLength.current = sites.length;
  }, [sites, shouldFitBounds, map, routeCoordinates, selectedSite]);

  return null;
}

// --- LOCATION FINDER ---
function LocationFinder({
  triggerRequest,
  onLocationUpdate,
}: {
  triggerRequest: number;
  onLocationUpdate?: (lat: number, lon: number) => void;
}) {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [heading, setHeading] = useState<number | null>(null);

  useEffect(() => {
    if (triggerRequest > 0) {
      map.locate({
        setView: true,
        maxZoom: 16,
        watch: true,
        enableHighAccuracy: true,
      });
    }
  }, [triggerRequest, map]);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const compass =
        (event as any).webkitCompassHeading ||
        (event.alpha ? 360 - event.alpha : null);
      if (compass !== null) setHeading(compass);
    };
    if (window.DeviceOrientationEvent)
      window.addEventListener("deviceorientation", handleOrientation);
    return () =>
      window.removeEventListener("deviceorientation", handleOrientation);
  }, []);

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      if (e.heading && heading === null) setHeading(e.heading);
      if (onLocationUpdate) onLocationUpdate(e.latlng.lat, e.latlng.lng);
    },
    locationerror(e) {
      console.warn(e.message);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      icon={createUserIcon(heading)}
      zIndexOffset={1000}
    />
  );
}

// --- MAP EVENTS (Tıklama Burada) ---
function MapEvents({
  onBoundsChange,
  onMapClick,
}: {
  onBoundsChange?: (bounds: MapBounds) => void;
  onMapClick?: (lat: number, lon: number) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      if (onBoundsChange) {
        const b = map.getBounds();
        onBoundsChange({
          min_lat: b.getSouth(),
          min_lon: b.getWest(),
          max_lat: b.getNorth(),
          max_lon: b.getEast(),
        });
      }
    },
    click: (e) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// --- ANA BİLEŞEN ---
interface HeritageMapProps {
  sites: CulturalSite[];
  onBoundsChange?: (bounds: MapBounds) => void;
  selectedSite?: CulturalSite | null;
  onMarkerClick?: (site: CulturalSite) => void;
  fitBoundsToSites?: boolean;
  locateTrigger?: number;
  onUserLocationUpdate?: (lat: number, lon: number) => void;
  routeCoordinates?: [number, number][] | null;
  onMapClick?: (lat: number, lon: number) => void;
  roamingRadius?: number | null;
  userLocation?: { lat: number; lon: number } | null;
}

export default function HeritageMap({
  sites,
  onBoundsChange,
  selectedSite,
  onMarkerClick,
  fitBoundsToSites = false,
  locateTrigger = 0,
  onUserLocationUpdate,
  routeCoordinates,
  onMapClick,
}: HeritageMapProps) {
  return (
    <MapContainer
      center={[41.0082, 28.9784]}
      zoom={12}
      zoomControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; CARTO"
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <MapEvents onBoundsChange={onBoundsChange} onMapClick={onMapClick} />
      <MapController
        selectedSite={selectedSite || null}
        sites={sites}
        shouldFitBounds={fitBoundsToSites}
        routeCoordinates={routeCoordinates || null}
      />

      <LocationFinder
        triggerRequest={locateTrigger}
        onLocationUpdate={onUserLocationUpdate}
      />

      {routeCoordinates && (
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: "#3b82f6",
            weight: 6,
            opacity: 0.8,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      )}

      {sites.map((site) =>
        site.latitude && site.longitude ? (
          <Marker
            key={site.id}
            position={[site.latitude, site.longitude]}
            icon={createCustomIcon(site.category)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) onMarkerClick(site);
              },
            }}
          />
        ) : null
      )}

      {/* Seçilen Özel Konum İçin Kırmızı Pin */}
      {selectedSite && selectedSite.category === "Custom" && (
        <Marker
          position={[selectedSite.latitude, selectedSite.longitude]}
          icon={customPinIcon}
        />
      )}
    </MapContainer>
  );
}
