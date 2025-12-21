import uuid
from sqlalchemy import String, Text, Boolean, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape

from app.db.base import Base

class CulturalSite(Base):
    __tablename__ = "cultural_sites"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    # Opsiyonel: TR-IST-0001 gibi dış kod (istersen kullanma)
    external_code: Mapped[str | None] = mapped_column(String(64), unique=True)

    name_tr: Mapped[str] = mapped_column(String(255), nullable=False)
    name_en: Mapped[str | None] = mapped_column(String(255))

    category: Mapped[str] = mapped_column(String(64), nullable=False)
    sub_category: Mapped[str | None] = mapped_column(String(64))

    city: Mapped[str | None] = mapped_column(String(64))
    district: Mapped[str | None] = mapped_column(String(64))
    neighbourhood: Mapped[str | None] = mapped_column(String(128))
    address: Mapped[str | None] = mapped_column(Text)
    region_id: Mapped[str | None] = mapped_column(String(32))

    summary_tr: Mapped[str | None] = mapped_column(Text)
    summary_en: Mapped[str | None] = mapped_column(Text)

    opening_hours: Mapped[str | None] = mapped_column(String(64))
    ticket_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    website: Mapped[str | None] = mapped_column(Text)
    main_image_url: Mapped[str | None] = mapped_column(Text)

    is_unesco: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    protection_status: Mapped[str | None] = mapped_column(String(64))

    source_name: Mapped[str | None] = mapped_column(String(128))
    source_url: Mapped[str | None] = mapped_column(Text)
    last_update: Mapped[Date | None] = mapped_column(Date)

    # PostGIS Point(4326)
    geom: Mapped[str] = mapped_column(Geometry(geometry_type="POINT", srid=4326), nullable=False)

    created_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[DateTime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    @property
    def latitude(self):
        # Eğer veri varsa (ki nullable=False dedin ama yine de kontrol iyidir)
        if self.geom is not None:
             # GeoAlchemy elementi Shapely objesine çeviriyoruz
             point = to_shape(self.geom)
             return point.y # Enlem (Lat)
        return None

    @property
    def longitude(self):
        if self.geom is not None:
             point = to_shape(self.geom)
             return point.x # Boylam (Lon)
        return None
