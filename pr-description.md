## Summary

This PR wires up full member authentication, dashboard integration, and a new admin panel, including a dedicated `/admin/login` route so the admin login page loads correctly.

## Technical Details

- Add a Node/Express backend (`Backend/`) with:
  - JWT-based auth middleware that validates tokens using `JWT_SECRET` and loads users from `Backend/data/users.json`.
  - Auth routes under `/api/auth` for member registration and login.
  - Profile, KYC upload, and dashboard routes under `/api/profile`, `/api/kyc`, and `/api/dashboard`.
  - Admin routes mounted at `/admin` providing `POST /admin/login` and `GET /admin/users` for admin authentication and user management.
- Hook the frontend into the backend APIs:
  - In `src/App.jsx`, add register/login flows calling `http://localhost:5000/api/auth/register` and `http://localhost:5000/api/auth/login`.
  - Persist the returned JWT token in `localStorage` and use it to control when `MemberLayout` (the dashboard) is rendered.
  - Pass `onLoginClick` and `onRegisterClick` into the header and footer so the landing page can open the correct auth view.
- Enhance the member dashboard experience:
  - Build a `MemberLayout` with a left-hand `DashboardSidebar` and right content area for stats and profile flows.
  - Fetch live dashboard data from `http://localhost:5000/api/dashboard` and render user info plus stat cards.
  - Add right-panel components for Activate ID and team business support (Team Business, Rank Reward Business, Freedom Business) and wire them to the sidebar.
- Implement an admin UI that matches the backend routes and makes the `/admin/login` page work:
  - Add `AdminPage` with an admin login form posting to `http://localhost:5000/admin/login` and storing `adminToken` in `localStorage`.
  - On successful login, fetch and display users from `GET http://localhost:5000/admin/users` in a responsive table.
  - Add React Router entries for both `/admin` and `/admin/login` so navigating directly to `/admin/login` correctly renders the admin login page.

## Testing

- Backend
  - Start MongoDB locally and ensure `MONGO_URI` is reachable.
  - From the `Backend/` directory, install dependencies and run the server (e.g. `npm install` then `npm run dev` or `node server.js`).
  - Hit `POST http://localhost:5000/api/auth/register` and `POST http://localhost:5000/api/auth/login` with valid payloads and confirm a JWT token is returned.
  - Hit `GET http://localhost:5000/api/dashboard` with the `Authorization: Bearer <token>` header and confirm dashboard data is returned.
  - Hit `POST http://localhost:5000/admin/login` with the default admin credentials and verify a token is issued, then `GET http://localhost:5000/admin/users` with that token.
- Frontend
  - Run the Vite dev server (`npm install` then `npm run dev`).
  - Visit `/` and use the Register and Login buttons in the header/footer to complete the member auth flow and reach the dashboard.
  - Confirm logout clears the token and returns you to the public experience.
  - Navigate to `/admin/login` in the browser and confirm the admin login page renders and can log in with the default admin credentials, then shows the users table.

## Related Issues

- Fixes the bug where visiting `/admin/login` did not load the admin login page.
- If there is a tracking ticket (e.g. `PROJ-123`), link it here.
