# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Quick commands

### Frontend (Vite + React)
- Install deps: `npm install`
- Dev server (http://localhost:5173): `npm run dev`
- Lint: `npm run lint`
- Production build (outputs to `dist/`): `npm run build`
- Preview built app: `npm run preview`

### Backend (Express)
- Install deps: `cd Backend; npm install`
- Run in dev (nodemon, http://localhost:5000): `cd Backend; npm run dev`
- Run in prod: `cd Backend; npm start`

### Environment variables
- Copy `/.env.example` to `Backend/.env` and fill values (Mongo URI + CORS origin + optional Gemini key).
- Backend reads env via `dotenv` in `Backend/server.js`.

### Tests
- There is currently no automated test command configured (backend `npm test` is a placeholder; frontend has no test runner in `package.json`).

## High-level architecture

### Frontend: landing site + auth overlay + member dashboard
- Entry point is `src/App.jsx`.
  - Renders the marketing/landing sections.
  - Handles auth overlays (`Login`, `Register`, `WelcomePage`).
  - After login/register, stores JWT to `localStorage` under `token` and renders the member dashboard (`src/components/dashboard/MemberDashboard.jsx`).

- Member “menu / panels” pattern:
  - `src/components/dashboard/DashboardSidebar.jsx` is the slide-over menu that switches the right-side content via an `activePanel` state (not via `react-router`).
  - Panels are rendered from multiple feature components:
    - Profile: `EditProfile` (UPI fields live here) and `Editbankdetail`
    - KYC upload: `Imageuploader`
    - Activation: `ActivateID`
    - Withdraw: `Withdraw`
    - Team business: `src/components/dashboard/MyTeamBusiness/*`
    - ePin pages: `src/components/dashboard/e-pin/*` (wired from the sidebar)
  - Role gating: `DashboardSidebar.jsx` fetches `/api/profile` and only shows the `ePin` section when `user.role === "franchise"`.

- API base URL is currently hardcoded in multiple components as `http://localhost:5000` (search for `API_BASE`).

### Admin UI (frontend)
- `src/components/dashboard/AdminPage.jsx` is a single-file admin panel with its own internal navigation.
  - Admin auth token stored in `localStorage` under `adminToken`.
  - Default admin credentials are hardcoded on the backend (`admin / admin123`).
  - Admin pages fetch from backend routes under `/admin/*`:
    - `/admin/users` (members)
    - `/admin/kyc` (KYC records)
    - `/admin/withdrawals` + `/admin/withdrawals/:id/approve` (withdraw request approvals)
    - `/admin/epins` (central epin pool)

### Backend: Express API + JSON-file persistence
- Server entry is `Backend/server.js`.
  - Routes mounted:
    - `/api/auth` (`Backend/routes/auth.js`)
    - `/api/profile` (`Backend/routes/profile.js`)
    - `/api/kyc` (`Backend/routes/kyc.js`)
    - `/api/dashboard` (`Backend/routes/dashboard.js`)
    - `/api/withdrawals` (`Backend/routes/withdrawals.js`)
    - `/admin` (`Backend/routes/admin.js`)
  - Static uploads served from `Backend/uploads` at `/uploads/*`.

- Authentication:
  - Member JWT auth middleware: `Backend/middleware/auth.js`.
  - Admin auth middleware is implemented inside `Backend/routes/admin.js`.

- Persistence:
  - Most routes read/write JSON files in `Backend/data/` (e.g. `users.json`, `withdrawals.json`, `epins.json`, `kyc.json`).
  - Note: `Backend/server.js` also attempts a MongoDB connection via `mongoose.connect(process.env.MONGO_URI)`, but the current route implementations are file-backed rather than using Mongoose models.

### Withdrawals flow (member → admin → balance update)
- Member submits a request: `POST /api/withdrawals` with `{ amount, upiId, upiNo }`.
- Admin lists requests: `GET /admin/withdrawals`.
- Admin approves after payment completion: `POST /admin/withdrawals/:id/approve`.
  - Approval sets withdrawal status to `approved` and deducts `amount` from the user’s `balance` in `Backend/data/users.json`.

## Repo conventions / notes
- No project-specific instruction files were found (no `CLAUDE.md`, `.cursorrules`, `.cursor/rules/*`, or `.github/copilot-instructions.md`).
- Prefer making backend endpoint changes in tandem with the corresponding frontend components that call them (search `API_BASE`).
