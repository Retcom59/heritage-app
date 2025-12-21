export interface CulturalSite {
  id: string;
  name_tr: string;
  category: string;
  sub_category?: string;
  city?: string; // İl
  district?: string; // İlçe
  neighbourhood?: string; // Mahalle
  summary_tr?: string; // Açıklama
  main_image_url?: string;

  // 👇 Yeni eklediğimiz detay alanları
  opening_hours?: string;
  source_name?: string; // Kaynak (Wikipedia vs.)
  source_url?: string;
  is_unesco?: boolean;

  latitude: number;
  longitude: number;
}
