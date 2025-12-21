import os
import uuid
import sys
import pandas as pd
from datetime import datetime
from sqlalchemy import create_engine, text

# -----------------------------
# Config
# -----------------------------
DB_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://heritage_user:password@heritage_db:5432/postgres")

REQUIRED_COLS = [
    "name_tr", # ID zorunlu değil artık, biz üreteceğiz
    "category",
    "lon",
    "lat",
]

# -----------------------------
# Helpers
# -----------------------------
def to_bool(v, default=False):
    if isinstance(v, bool): return v
    if v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == "": return default
    s = str(v).strip().lower()
    return True if s in ("1", "true", "t", "yes", "y") else False

def to_date(v):
    if v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == "": return None
    s = str(v).strip()
    for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d/%m/%Y", "%Y/%m/%d", "%d-%m-%Y"):
        try: return datetime.strptime(s, fmt).date()
        except ValueError: pass
    try: return datetime.fromisoformat(s).date()
    except Exception: return None

def norm_str(v, maxlen=None):
    if v is None or (isinstance(v, float) and pd.isna(v)): return None
    s = str(v).strip()
    if s == "" or s.lower() == "nan": return None
    if maxlen: return s[:maxlen]
    return s

def to_float(v):
    if v is None or (isinstance(v, float) and pd.isna(v)) or str(v).strip() == "": return None
    try: return float(v)
    except Exception: return None

def main(csv_path: str):
    print(f"🔄 Genişletme Modu: {csv_path}")
    print("ℹ️  NOT: CSV'deki ID'ler yok sayılacak ve yeni kayıtlar oluşturulacak.")
    
    try:
        df = pd.read_csv(csv_path)
    except Exception as e:
        print(f"HATA: CSV okunamadı. {e}")
        return

    df.columns = df.columns.str.strip()
    
    # Veritabanı bağlantısı
    try:
        engine = create_engine(DB_URL, future=True)
        with engine.connect() as conn: pass
    except Exception as e:
        print(f"HATA: DB Bağlantısı yok. {e}")
        return

    # SQL: Sadece INSERT (Çakışma olursa atla)
    insert_sql = text("""
        INSERT INTO cultural_sites (
            id, external_code, name_tr, name_en, category, sub_category,
            city, district, neighbourhood, address, region_id,
            summary_tr, summary_en, opening_hours, ticket_required,
            website, main_image_url, is_unesco, protection_status,
            source_name, source_url, last_update, geom
        )
        VALUES (
            :id, :external_code, :name_tr, :name_en, :category, :sub_category,
            :city, :district, :neighbourhood, :address, :region_id,
            :summary_tr, :summary_en, :opening_hours, :ticket_required,
            :website, :main_image_url, :is_unesco, :protection_status,
            :source_name, :source_url, :last_update,
            ST_SetSRID(ST_Point(:lon, :lat), 4326)
        )
        ON CONFLICT (id) DO NOTHING
    """)

    ok = 0
    skipped = 0
    errors = 0

    with engine.connect() as conn:
        for i, row in df.iterrows():
            lat = to_float(row.get("lat"))
            lon = to_float(row.get("lon"))

            if lat is None or lon is None:
                skipped += 1
                continue

            # -------------------------------------------------------
            # KRİTİK DEĞİŞİKLİK: Her satır için YENİ KİMLİK ÜRETİYORUZ
            # -------------------------------------------------------
            
            # 1. Yeni UUID
            new_id = str(uuid.uuid4())
            
            # 2. Şehir bilgisini al
            city_val = norm_str(row.get("city"), 64)
            city_slug = city_val.replace(" ", "") if city_val else "TR"
            
            # 3. Benzersiz External Code Üret: TR-City-UUIDninIlk8Hanesi
            # Bu sayede "UniqueViolation" hatası asla almazsın.
            unique_suffix = new_id.split("-")[0] 
            new_external_code = f"TR-{city_slug}-{unique_suffix}"

            params = {
                "id": new_id,
                "external_code": new_external_code, 
                "name_tr": norm_str(row.get("name_tr"), 255) or "Bilinmiyor",
                "name_en": norm_str(row.get("name_en"), 255),
                "category": norm_str(row.get("category"), 64) or "Genel",
                "sub_category": norm_str(row.get("sub_category"), 64),
                "city": city_val,
                "district": norm_str(row.get("district"), 64),
                "neighbourhood": norm_str(row.get("neighbourhood"), 128),
                "address": norm_str(row.get("address")),
                "region_id": norm_str(row.get("region_id"), 32),
                "summary_tr": norm_str(row.get("summary_tr")),
                "summary_en": norm_str(row.get("summary_en")),
                "opening_hours": norm_str(row.get("opening_hours"), 64),
                "ticket_required": to_bool(row.get("ticket_required"), False),
                "is_unesco": to_bool(row.get("is_unesco"), False),
                "website": norm_str(row.get("website")),
                "main_image_url": norm_str(row.get("main_image_url")),
                "protection_status": norm_str(row.get("protection_status"), 64),
                "source_name": norm_str(row.get("source_name"), 128),
                "source_url": norm_str(row.get("source_url")),
                "last_update": to_date(row.get("last_update")) or datetime.now().date(),
                "lat": lat,
                "lon": lon,
            }
            
            try:
                conn.execute(insert_sql, params)
                conn.commit()
                ok += 1
            except Exception as e:
                conn.rollback()
                errors += 1
                print(f"--- HATA SATIR {i+2} ---")
                print(f"Kayıt: {params['name_tr']}")
                print(f"Hata: {e}")
                print("-------------------------")

    print(f"\nSONUÇ RAPORU:")
    print(f"✅ Yeni Eklenen: {ok}")
    print(f"⏭️ Atlanan (Coords Yok): {skipped}")
    print(f"❌ Hatalı: {errors}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Kullanım: python import_script.py /app/data.csv")
    else:
        main(sys.argv[1])