# Pet Haven

A responsive React pet store app built with React Router and custom CSS.

## Features

- Home page with hero section, feature cards, and customer reviews
- Shop page with category-based filtering
- About page with brand story and FAQ
- Contact page with contact info and message form
- Reusable components and organized folder structure

## Tech stack

- React
- React Router
- Vite
- CSS

## Run locally

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 5173
```

Then open http://localhost:5173

## Backend and MongoDB

```bash
cd backend
npm install
npm run dev
```

The backend starts a temporary MongoDB instance automatically when `MONGODB_URI` is not set. Data in that development database is lost when the backend stops. To persist data, create `backend/.env` with a MongoDB connection string and a private JWT secret; see `backend/.env.example`. An admin account is only seeded when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are set; use a unique password of at least 12 characters.

## Production build

```bash
npm run build
```
