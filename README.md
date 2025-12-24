# 🏛️ Web GIS Based Cultural Heritage Information System (Heritage App)

![Project Status](https://img.shields.io/badge/status-development-orange)
![License](https://img.shields.io/badge/license-MIT-blue)

This project is a **Web GIS (Geographic Information System)** platform designed to manage, visualize, and analyze cultural heritage assets using geospatial data technologies.

Users can explore historical sites on an interactive map, access detailed information, and manage data based on their authorization levels.

## 🚀 Features

- **🗺️ Interactive Map:** Cluster-based visualization of cultural heritage sites on a digital map.
- **🔐 Secure Authentication:** JWT-based user login and role management (via `backend/core/auth.py`).
- **📂 Data Management:** Full CRUD (Create, Read, Update, Delete) operations for historical assets.
- **🔍 Advanced Filtering:** Query assets by period, type, or geolocation.
- **⚡ High Performance:** Optimized data flow using FastAPI and Vite.

## 🛠️ Tech Stack

This project follows a **Client-Server** architecture.

### Backend
| Technology | Description |
| :--- | :--- |
| **Python** | Primary programming language |
| **FastAPI** | Modern, high-performance web framework |
| **SQLAlchemy** | ORM (Database management) |
| **Alembic** | Database migrations |
| **Pydantic** | Data validation and schema management |

### Frontend
| Technology | Description |
| :--- | :--- |
| **React** | UI Library |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Next-generation frontend tooling |
| **Map Library** | Leaflet / MapLibre (Map integration) |

---

## 💻 Installation & Setup

Follow these steps to run the project locally.

### Prerequisites
- Python 3.9+
- Node.js & npm
- Git

## ⚖️ License & Citation

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

If you use this project in your research or work, please cite it as follows:

> **Kerem (2025). Web GIS Based Cultural Heritage Information System.** > GitHub Repository: https://github.com/Retcom59/heritage-app

### Kaynak Gösterme Kuralı (TR)
Bu proje açık kaynaklıdır ancak ticari veya akademik kullanımlarda **kaynak belirtilmesi ve orijinal repo linkinin verilmesi** zorunludur.

### 1. Clone the Repository
```bash
git clone [https://github.com/Retcom59/heritage-app.git](https://github.com/Retcom59/heritage-app.git)
cd heritage-app

