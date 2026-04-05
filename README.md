# Food Locator

Food Locator is a full-stack project for discovering local food vendors, browsing menus, submitting reviews, and managing vendor information. The app is built as a React + Tailwind frontend paired with an Express backend and PostgreSQL database.

## Features

- User authentication with login and signup
- Browse food vendors and view vendor details
- Add and review vendors (authenticated users)
- Upload food or vendor images via Cloudinary
- Interactive vendor listings with search support
- Profile management for registered users

## Project Structure

- `backend/` - Express API server, PostgreSQL database integration, authentication, and uploads
- `frontend/` - React app using Vite, Tailwind CSS, and React Router

## Tech Stack

- Frontend: React, Vite, React Router, Tailwind CSS, Axios
- Backend: Node.js, Express, PostgreSQL, JWT auth, Cloudinary image uploads
- Database: PostgreSQL

## Setup

### Backend

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from the example if needed:

```bash
cp .env.example .env
```

4. Update `.env` with your configuration:

```env
DATABASE_URL=postgresql://user:password@host:5432/streetbite
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:

```bash
npm run dev
```

### Frontend

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the Vite development server:

```bash
npm run dev
```

4. Open the local frontend URL shown in the terminal (typically `http://localhost:5173`).

## API Endpoints

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in and receive a JWT token
- `GET /api/vendors` - Fetch vendors
- `GET /api/vendors/:id` - Fetch vendor details
- `POST /api/reviews` - Submit a review
- `POST /api/upload` - Upload vendor or food images

## Notes

- Make sure PostgreSQL is running and accessible from the `DATABASE_URL` configuration.
- Cloudinary credentials are required for image upload support.
- The backend uses `FRONTEND_URL` to allow CORS from the React app.

## License

This repository does not include a license file. Add one if you plan to share or publish the project.
