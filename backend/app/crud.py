from sqlalchemy.orm import Session
from . import models
# Schemas klasörünün altındaki schemas dosyasından import ediyoruz
from .schemas import schemas 

def get_cultural_sites(db: Session, limit: int = 100):
    """
    Veritabanından kültürel alanları çeker.
    Limit default 100.
    """
    # Veritabanındaki "CulturalSite" modeline sorgu atıyoruz
    return db.query(models.CulturalSite).limit(limit).all()

def get_cultural_site_by_id(db: Session, site_id: str):
    """
    ID'ye göre tek bir yer çeker.
    """
    return db.query(models.CulturalSite).filter(models.CulturalSite.id == site_id).first()