# Pet Haven

A responsive React pet store app built with React Router and custom CSS.

## Features

- Home page with hero section, feature cards, and customer reviews
- Shop page with category-based filtering
- About page with brand story and FAQ
- Contact page with contact info and message form
- Admin dashboard for managing products, prices, stock, and product details
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

The backend seeds the starter catalog once if the products collection is empty. After signing in with an admin account, open `/admin` to create, edit, and delete products. Price fields in the dashboard are entered and displayed in NGN; the app converts them to its internal price unit for storefront calculations.

## Production build

```bash
npm run build
```

## Deploy

The repository includes a `render.yaml` blueprint for the Express API and `vercel.json` for React Router fallback routes.

1. Create a MongoDB Atlas database and copy its connection URI.
2. In Render, create a Blueprint from this GitHub repository. Set `MONGODB_URI`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` when prompted; use an admin password of at least 12 characters. Render generates `JWT_SECRET` from the blueprint. The configured admin account is created or updated whenever the backend starts.
3. After Render gives the backend a URL, deploy the repository on Vercel with the project root as the root directory, `npm run build` as the build command, and `dist` as the output directory.
4. In Vercel project settings, set `VITE_API_URL` to the Render URL plus `/api`, for example `https://pet-haven-api.onrender.com/api`, then redeploy.
5. In Render, set `CORS_ORIGIN` to the Vercel site URL, then redeploy the backend. For Vercel preview deployments, add their origins as comma-separated values if they need API access.

After deployment, open `https://<your-render-service>.onrender.com/api/health` and confirm the database is `connected`. Sign in through the site's normal Account login using the configured `ADMIN_EMAIL` and `ADMIN_PASSWORD`; admin accounts are redirected to `/admin`. The dashboard endpoints require an admin token, so changing the frontend role alone cannot grant access.

Keep database URIs and any private environment values in the hosting provider's environment settings, never in GitHub.
