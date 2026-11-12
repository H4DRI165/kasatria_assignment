# Kasatria Assignment: 3D Periodic Table

Interactive 3D Periodic Table built with Three.js. People data is loaded from
Google Sheets after the user signs in with Google.

**Live demo:** https://kasatria-assignment-steel.vercel.app

## Features

- Google Sign-In (Google Identity Services)
- Reads data from a Google Sheet (Google Sheets API, read-only)
- 3D visualization using Three.js `CSS3DRenderer`
- Four layouts: Table (20 × 10), Sphere, Double Helix, Grid (5 × 4 × 10)
- Tiles are colored by Net Worth
- Orbit, zoom and pan with the mouse
- Reset view button that smoothly returns the camera to its initial position
- Empty state with a Connect button until Sheets data is loaded
- Sign-out confirmation dialog

## Net Worth colors

| Color  | Rule                     |
| ------ | ------------------------ |
| Red    | Net Worth below $100,000 |
| Orange | $100,000 up to $200,000  |
| Green  | Net Worth above $200,000 |

The assignment does not define what happens at exactly $100,000 and $200,000.
In this implementation both values are **orange** (red is strictly below
$100K and green is strictly above $200K).

## Tech stack

- HTML, CSS, JavaScript (ES Modules)
- [Three.js](https://threejs.org/) (`three` npm package)
- [Vite](https://vite.dev/)
- Google Identity Services and Google Sheets API

## Getting started

### Prerequisites

- Node.js (LTS)
- A Google Cloud project with:
  - **Google Sheets API** enabled
  - An **OAuth 2.0 Client ID** (type: Web application)
  - `http://localhost:5173` added to **Authorized JavaScript origins**
  - The production URL added to Authorized JavaScript origins after deploying
  - If the OAuth consent screen is in "Testing" mode, add every account that
    needs access (for example `lisa@kasatria.com`) as a **test user**
- A Google Sheet containing the assignment data (columns: Name, Photo, Age,
  Country, Interest, Net Worth), shared with the reviewer

### Setup

```bash
npm install
```

Create a `.env` file in the project root (see `.env.example`):

```env
VITE_GOOGLE_CLIENT_ID=your-oauth-client-id
VITE_GOOGLE_SHEET_ID=your-spreadsheet-id
```

Run the dev server:

```bash
npm run dev
```

### Scripts

| Command           | Description                   |
| ----------------- | ----------------------------- |
| `npm run dev`     | Start the dev server          |
| `npm run build`   | Production build into `dist/` |
| `npm run preview` | Preview the production build  |
| `npm run lint`    | Run ESLint                    |
| `npm run format`  | Format code with Prettier     |

## Deployment (Vercel)

1. Import the GitHub repository in Vercel (Vite is detected automatically).
2. Add these Environment Variables, then redeploy. Vite embeds them at build
   time, so a change only takes effect after a new build:
   - `VITE_GOOGLE_CLIENT_ID`
   - `VITE_GOOGLE_SHEET_ID`
3. Add the production URL to **Authorized JavaScript origins** of the OAuth
   client (origin only: no trailing slash, no path).

Google does not allow wildcard origins, so Vercel preview URLs cannot sign in.
Only the registered production URL works.

## How it works

1. The user signs in with Google (authentication: who the user is).
2. The user clicks **Connect Google Sheet**, which requests the read-only
   Sheets scope (authorization: what the app may access).
3. The app fetches the sheet range, validates and parses each row.
4. Each row becomes a `CSS3DObject` tile. Layout functions return a target
   position and rotation per tile, and the animation loop moves tiles smoothly
   to those targets.

Sign-in and Sheets access are separate steps on purpose: Sheets access is
requested only after a direct user click.

## Project structure

```text
js/
├── main.js                  App wiring: screens, buttons, state
├── config.js                Google config read from env variables
├── auth/auth.js             Google Sign-In and Sheets token request
├── sheets/
│   ├── sheets.js            Fetch from the Sheets API
│   └── data.js              Validate and parse rows
└── visualization/
    ├── visualization.js     Scene, camera, controls, animation loop
    ├── tile.js              Builds one tile
    └── layouts/             table.js, sphere.js, helix.js, grid.js
css/                         style.css, login.css, visualization.css
```

## Security notes

- The OAuth **Client ID** and Sheet ID are not secrets. Vite env variables are
  bundled into the frontend, so they are visible in the built app.
- No client secret or service account key is used or stored in this project.
  Never put those in frontend code.
- Access to the data is enforced by the Google Sheet's sharing settings, not by
  this app.
- The decoded ID token is used only to display user info. It is not verified
  client-side and must not be used for access decisions.

## Known limitations

- Vercel preview deployments cannot sign in (see Deployment).
- The Sheets access token is kept in memory only, so a page refresh requires
  signing in and connecting again.
- Tiles use HTML/CSS in 3D (`CSS3DRenderer`), so text can look soft at very
  close zoom. Tiles are rendered at 2x and scaled down to reduce this.
- Layouts are designed for 200 records. Other counts still render, but the
  Table, Sphere, Helix and Grid shapes will differ from the spec.

## Credits

Adapted from the official Three.js
[CSS3D Periodic Table example](https://threejs.org/examples/#css3d_periodictable)
(MIT License, © three.js authors).
