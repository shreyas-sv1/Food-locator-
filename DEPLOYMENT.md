# StreetBite - Deployment & Setup Guide

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL database (Supabase recommended)
- Cloudinary account (free tier works)
- Google Maps API key (with Maps JavaScript API enabled)

---

## 1. Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Settings > Database** and copy the **Connection string (URI)**
3. The database tables are auto-created when the backend starts for the first time

---

## 2. Cloudinary Setup

1. Go to [cloudinary.com](https://cloudinary.com) and create a free account
2. From the dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

---

## 3. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable **Maps JavaScript API**
4. Create an API key under **Credentials**
5. Restrict the key to your frontend domain in production

---

## 4. Backend Setup

```bash
cd streetbite/backend

# Copy environment file
cp .env.example .env
```

Edit `.env` with your actual values:

```
PORT=5000
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
JWT_SECRET=your_strong_random_secret_at_least_32_chars
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
FRONTEND_URL=http://localhost:5173
```

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or production
npm start
```

The server will auto-create all database tables on first start.

---

## 5. Frontend Setup

```bash
cd streetbite/frontend

# Copy environment file
cp .env.example .env
```

Edit `.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 6. Production Deployment

### Backend → Render

1. Push code to a GitHub repository
2. Go to [render.com](https://render.com) and create a **Web Service**
3. Connect your GitHub repo, set root directory to `streetbite/backend`
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add all environment variables from `.env` in the Render dashboard
7. Set `FRONTEND_URL` to your Vercel frontend URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set root directory to `streetbite/frontend`
3. Framework preset: Vite
4. Add environment variables:
   - `VITE_API_URL` = your Render backend URL + `/api` (e.g., `https://streetbite-api.onrender.com/api`)
   - `VITE_GOOGLE_MAPS_API_KEY` = your Google Maps API key
5. Deploy

### Database → Supabase

Already set up in step 1. Just make sure your Render backend's `DATABASE_URL` points to your Supabase connection string.

---

## 7. API Endpoints Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/profile` | Yes | Get current user profile |

### Vendors
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/vendors` | No | List vendors (with geo filters) |
| GET | `/api/vendors/trending` | No | Top rated vendors |
| GET | `/api/vendors/mine` | Yes | User's own vendors |
| GET | `/api/vendors/:id` | No | Vendor details with menu/reviews/photos |
| POST | `/api/vendors` | Yes | Create vendor |

### Menu
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/menu/:vendorId` | No | Get vendor menu |
| POST | `/api/menu` | Yes | Add menu item |
| DELETE | `/api/menu/:id` | Yes | Delete menu item |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/:vendorId` | No | Get vendor reviews |
| GET | `/api/reviews/mine` | Yes | User's own reviews |
| POST | `/api/reviews` | Yes | Add/update review |

### Upload
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/upload` | Yes | Upload vendor photo |
| POST | `/api/upload/menu-image` | Yes | Upload menu item image |

### Health
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Health check |

---

## 8. Query Parameters for GET /api/vendors

| Parameter | Type | Description |
|-----------|------|-------------|
| `lat` | float | User latitude |
| `lng` | float | User longitude |
| `radius` | float | Search radius in km (default 10) |
| `category` | string | Filter by category |
| `is_veg` | string | "true" for veg only |
| `search` | string | Search vendors/dishes by name |
| `sort` | string | "distance" or "rating" |
| `min_price` | float | Minimum menu item price |
| `max_price` | float | Maximum menu item price |
