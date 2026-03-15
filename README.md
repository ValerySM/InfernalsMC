# Infernals MC Website + Admin (PostgreSQL)

This project is a React (Vite) website with a built-in **admin panel**.

✅ Admin features (stored in PostgreSQL):
- Login (/admin/login)
- Create/edit/delete events (cover + media uploads)
- Create/edit/delete homepage gallery items
- Create additional admin users (and manage active/roles)

Uploads are stored on disk in `./uploads`.

---

## 1) Requirements

- Node.js (LTS recommended)
- PostgreSQL
 - npm (comes with Node.js) or pnpm (optional)

---

## 2) Environment

Copy `.env.example` to `.env` and edit values:

```bash
cp .env.example .env
```

Important:
- `DATABASE_URL` should point to your PostgreSQL
- `ADMIN_BOOTSTRAP_EMAIL` / `ADMIN_BOOTSTRAP_PASSWORD` are used **only if** the `admin_users` table is empty
- Change `ADMIN_JWT_SECRET` in production

---

## 2.1) Create the database (example)

```sql
CREATE DATABASE infernals_cms;
```

The server will create tables automatically on startup.

## 3) Development

Run both frontend + API together:

```bash
npm install
npm run dev
```

- Web: Vite on `http://localhost:5173`
- API: Express on `http://localhost:3001`

Vite proxies `/api/*` and `/uploads/*` to the API server.

---

## 4) Production build

```bash
npm install
npm run build
npm run start
```

In production, the Express server serves:
- the built frontend from `dist/public`
- the API under `/api/*`
- uploads under `/uploads/*`

---

## 5) Admin Panel

Open:
- `https://yourdomain.com/admin`

First login:
- On the first server start, if there are no users in `admin_users`, the server bootstraps a **superadmin**.
- The credentials come from `.env` (`ADMIN_BOOTSTRAP_*`).

From inside the admin panel:
- You can create more admin users
- Superadmin can delete users and promote others to superadmin

---

## Notes

- Uploaded files are stored in `./uploads`. Keep that folder persistent between deployments.
- If you run behind Nginx, proxy `/` to your Node server and allow large uploads (`client_max_body_size`).
