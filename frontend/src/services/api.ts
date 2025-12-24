import axios from "axios";
import type { CulturalSite } from "../types/site";

// ... (siteService kodları AYNI KALSIN) ...

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const API_URL = `${BASE_URL}/api/sites`;

interface SiteParams {
  search?: string;
  min_lon?: number;
  min_lat?: number;
  max_lon?: number;
  max_lat?: number;
  limit?: number;
  city?: string;
  district?: string;
}

interface GeoJSONFeature {
  type: "Feature";
  geometry: { type: "Point"; coordinates: [number, number] } | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any;
}
interface GeoJSONResponse {
  type: "FeatureCollection";
  features: GeoJSONFeature[];
}

export const siteService = {
  getAllSites: async (params: SiteParams = {}): Promise<CulturalSite[]> => {
    const response = await axios.get<GeoJSONResponse>(API_URL, { params });

    return response.data.features.map((feature) => {
      const p = feature.properties; // Kısaltma
      const coords = feature.geometry?.coordinates;

      // BURADA EŞLEŞTİRME YAPIYORUZ
      return {
        id: p.id,
        name_tr: p.name_tr,
        category: p.category,
        sub_category: p.sub_category,

        // Adres Bilgileri
        city: p.city,
        district: p.district,
        neighbourhood: p.neighbourhood,

        // Detay Bilgileri
        summary_tr: p.summary_tr,
        main_image_url: p.main_image_url,
        opening_hours: p.opening_hours,
        source_name: p.source_name,
        source_url: p.source_url,
        is_unesco: p.is_unesco,

        // Koordinat
        longitude: coords ? coords[0] : 0,
        latitude: coords ? coords[1] : 0,
      } as CulturalSite;
    });
  },
};

// ... (Mevcut kodlar kalsın)

// --- ROTA SERVİSİ (OSRM - Ücretsiz) ---

// --- ROTA SERVİSİ (GÜNCELLENDİ: Mod Destekli) ---
export const routeService = {
  getRoute: async (
    startLat: number,
    startLon: number,
    endLat: number,
    endLon: number,
    mode: "car" | "bike" | "walk" = "car" // Varsayılan: Araç
  ) => {
    // OSRM için doğru sunucuyu seç
    // Not: router.project-osrm.org genelde sadece 'car' destekler.
    // routing.openstreetmap.de ise car/bike/foot destekler.

    let baseUrl =
      "https://routing.openstreetmap.de/routed-car/route/v1/driving";

    if (mode === "bike") {
      baseUrl = "https://routing.openstreetmap.de/routed-bike/route/v1/driving";
    } else if (mode === "walk") {
      baseUrl = "https://routing.openstreetmap.de/routed-foot/route/v1/driving";
    }

    const url = `${baseUrl}/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson`;

    try {
      const response = await axios.get(url);
      if (response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        return {
          coordinates: route.geometry.coordinates.map((c: [number, number]) => [
            c[1],
            c[0],
          ]),
          distance: route.distance, // Metre
          duration: route.duration, // Saniye
        };
      }
      return null;
    } catch (error) {
      console.error("Rota hatası:", error);
      return null;
    }
  },
};
