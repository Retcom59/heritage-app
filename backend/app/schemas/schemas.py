from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import date

# API'den dönecek tekil site objesi
class CulturalSiteRead(BaseModel):
    id: UUID4
    name_tr: str
    category: str
    sub_category: Optional[str] = None
    city: Optional[str] = None
    district: Optional[str] = None
    main_image_url: Optional[str] = None
    summary_tr: Optional[str] = None
    
    # Harita için en kritik veriler:
    latitude: float 
    longitude: float

    class Config:
        from_attributes = True # ORM modunu aktif eder