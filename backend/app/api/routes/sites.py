import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_db

router = APIRouter()

from typing import Optional
from fastapi import APIRouter, Depends, Query # Query eklendi
from sqlalchemy import text
from sqlalchemy.orm import Session
import json
from app.api.deps import get_db
from app import schemas

router = APIRouter()

@router.get("")
def list_sites(
    # --- Yeni Parametreler ---
    search: Optional[str] = None,
    min_lon: Optional[float] = None,
    min_lat: Optional[float] = None,
    max_lon: Optional[float] = None,
    max_lat: Optional[float] = None,
    # -------------------------
    city: Optional[str] = None,
    district: Optional[str] = None,
    category: Optional[str] = None,
    is_unesco: Optional[bool] = None,
    limit: int = 2000,
    db: Session = Depends(get_db),
):
    where = []
    params = {}

    # 1. Arama Filtresi (İsim veya Özet içinde)
    if search:
        where.append("(name_tr ILIKE :search OR name_en ILIKE :search)")
        params["search"] = f"%{search}%"

    # 2. BBOX Filtresi (Harita sınırları)
    # PostGIS: && operatörü bounding box kesişimini kontrol eder (çok hızlıdır)
    if min_lon is not None and min_lat is not None and max_lon is not None and max_lat is not None:
        where.append("geom && ST_MakeEnvelope(:min_lon, :min_lat, :max_lon, :max_lat, 4326)")
        params.update({
            "min_lon": min_lon, "min_lat": min_lat, 
            "max_lon": max_lon, "max_lat": max_lat
        })

    # Diğer Filtreler
    if city:
        where.append("city = :city")
        params["city"] = city
    if district: # YENİ
        where.append("district = :district")
        params["district"] = district
    if category:
        where.append("category = :category")
        params["category"] = category
    if is_unesco is not None:
        where.append("is_unesco = :is_unesco")
        params["is_unesco"] = is_unesco

    where_sql = ("WHERE " + " AND ".join(where)) if where else ""
    
    # SQL Sorgusu (Aynı yapı, sadece where_sql değişti)
    sql = text(f"""
        SELECT 
          id, 
          ST_AsGeoJSON(geom) AS geom_json,
          name_tr, name_en, category, sub_category,
          city, district, main_image_url, summary_tr
        FROM cultural_sites
        {where_sql}
        LIMIT :limit
    """)
    params["limit"] = limit

    rows = db.execute(sql, params).mappings().all()

    features = []
    for r in rows:
        geom = json.loads(r["geom_json"]) if r["geom_json"] else None
        props = {k: r[k] for k in r.keys() if k != "geom_json"}
        features.append({"type": "Feature", "geometry": geom, "properties": props})

    return {"type": "FeatureCollection", "features": features}


@router.get("/{site_id}")
def get_site(site_id: str, db: Session = Depends(get_db)):
    sql = text("""
        SELECT
          id,
          ST_AsGeoJSON(geom) AS geom_json,
          name_tr, name_en, category, sub_category,
          city, district, neighbourhood, address, region_id,
          summary_tr, summary_en,
          opening_hours, ticket_required, website, main_image_url,
          is_unesco, protection_status,
          source_name, source_url, last_update
        FROM cultural_sites
        WHERE id = :id
        LIMIT 1
    """)

    r = db.execute(sql, {"id": site_id}).mappings().first()
    if not r:
        raise HTTPException(404, detail="Site not found")

    geom = json.loads(r["geom_json"]) if r["geom_json"] else None
    props = {k: r[k] for k in r.keys() if k != "geom_json"}
    if props.get("last_update") is not None:
        props["last_update"] = str(props["last_update"])

    return {"type": "Feature", "geometry": geom, "properties": props}
