from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.auth import router as auth_router
from app.api.routes.sites import router as sites_router

app = FastAPI(title="Heritage API")

# --- 1. ADIM: CORS AYARLARI (EN ÜSTTE OLMALI) ---
# Frontend (localhost:5173) Backend'e (localhost:8000) istek atabilsin diye izin veriyoruz.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Güvenlik için production'da ["http://localhost:5173"] yapılır
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. ADIM: ROUTER TANIMLARI (CORS'TAN SONRA GELMELİ) ---
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(sites_router, prefix="/api/sites", tags=["sites"])

@app.get("/")
def read_root():
    return {"message": "Heritage API is running 🚀"}