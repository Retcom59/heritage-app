import { useState, useMemo, useEffect, useRef } from "react";
import { X, Check, Trash2, ChevronDown, MapPin } from "lucide-react";
import type { CulturalSite } from "../../types/site";

interface FilterModalProps {
  onApply: (filters: { city: string; district: string }) => void;
  onClose: () => void;
  currentFilters: { city: string; district: string };
  availableSites: CulturalSite[]; // Listeyi buradan çekeceğiz
}

// --- İÇ BİLEŞEN: ARAMA YAPILABİLİR SELECT (AUTOCOMPLETE) ---
const SearchableSelect = ({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        // Eğer listede olmayan bir şey yazıldıysa ve tam eşleşmiyorsa,
        // kullanıcıya bırakıyoruz (serbest metin) veya seçimi sıfırlayabiliriz.
        // Burada serbest metne izin veriyoruz ama genelde seçim beklenir.
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Arama metni değişince dışarıya haber ver
  const handleSearchChange = (text: string) => {
    setSearch(text);
    onChange(text);
    setIsOpen(true);
  };

  const handleSelect = (option: string) => {
    setSearch(option);
    onChange(option);
    setIsOpen(false);
  };

  // Filtrelenmiş liste
  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", marginBottom: "16px" }}
    >
      <label
        style={{
          fontSize: "12px",
          fontWeight: "700",
          color: "#64748b",
          marginBottom: "6px",
          display: "block",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>

      <div style={{ position: "relative" }}>
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          style={{
            width: "100%",
            padding: "12px 12px 12px 36px",
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            outline: "none",
            fontSize: "14px",
            color: "#1e293b",
            fontWeight: "500",
            backgroundColor: isOpen ? "white" : "#f8fafc",
            transition: "all 0.2s",
          }}
        />
        <MapPin
          size={16}
          color="#94a3b8"
          style={{
            position: "absolute",
            left: "12px",
            top: "50%",
            transform: "translateY(-50%)",
          }}
        />
        <ChevronDown
          size={16}
          color="#94a3b8"
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            opacity: 0.5,
          }}
        />
      </div>

      {/* AÇILIR LİSTE */}
      {isOpen && filteredOptions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "105%",
            left: 0,
            width: "100%",
            maxHeight: "200px",
            overflowY: "auto",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            zIndex: 5000,
            border: "1px solid #e2e8f0",
          }}
        >
          {filteredOptions.map((opt, i) => (
            <div
              key={i}
              onClick={() => handleSelect(opt)}
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                fontSize: "14px",
                color: "#334155",
                borderBottom:
                  i === filteredOptions.length - 1
                    ? "none"
                    : "1px solid #f1f5f9",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#f1f5f9")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "white")
              }
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- ANA COMPONENT ---
export default function FilterModal({
  onApply,
  onClose,
  currentFilters,
  availableSites,
}: FilterModalProps) {
  const [city, setCity] = useState(currentFilters.city);
  const [district, setDistrict] = useState(currentFilters.district);

  // 1. Haritadaki verilerden BENZERSİZ ŞEHİRLERİ çıkar
  const uniqueCities = useMemo(() => {
    const cities = availableSites
      .map((s) => s.city)
      .filter(Boolean) as string[];
    return Array.from(new Set(cities)).sort();
  }, [availableSites]);

  // 2. Şehre göre BENZERSİZ İLÇELERİ çıkar
  const uniqueDistricts = useMemo(() => {
    let relevantSites = availableSites;
    // Eğer şehir seçiliyse sadece o şehrin ilçelerini göster
    if (city) {
      relevantSites = availableSites.filter(
        (s) => s.city?.toLowerCase() === city.toLowerCase()
      );
    }
    const districts = relevantSites
      .map((s) => s.district)
      .filter(Boolean) as string[];
    return Array.from(new Set(districts)).sort();
  }, [availableSites, city]);

  const handleApply = () => {
    onApply({ city, district });
    onClose();
  };

  const handleClear = () => {
    setCity("");
    setDistrict("");
    onApply({ city: "", district: "" });
    onClose();
  };

  return (
    <div
      className="animate-slide-up"
      style={{
        position: "absolute",
        top: "80px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "380px",
        backgroundColor: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        zIndex: 3000,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Başlık */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h3 style={{ margin: 0, color: "#0f172a", fontSize: "18px" }}>
          Konum Filtrele
        </h3>
        <button
          onClick={onClose}
          style={{
            background: "#f1f5f9",
            border: "none",
            cursor: "pointer",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <X size={18} color="#64748b" />
        </button>
      </div>

      {/* Inputlar */}
      <SearchableSelect
        label="Şehir (İl)"
        value={city}
        onChange={(val) => {
          setCity(val);
          setDistrict("");
        }} // Şehir değişirse ilçeyi sıfırla
        options={uniqueCities}
        placeholder="Şehir Ara..."
      />

      <SearchableSelect
        label="İlçe"
        value={district}
        onChange={setDistrict}
        options={uniqueDistricts}
        placeholder="İlçe Ara..."
      />

      {/* Butonlar */}
      <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
        <button
          onClick={handleClear}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            backgroundColor: "white",
            color: "#ef4444",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
          }}
        >
          <Trash2 size={18} /> Temizle
        </button>
        <button
          onClick={handleApply}
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "12px",
            border: "none",
            backgroundColor: "#0f172a",
            color: "white",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
          }}
        >
          <Check size={18} /> Uygula
        </button>
      </div>
    </div>
  );
}
