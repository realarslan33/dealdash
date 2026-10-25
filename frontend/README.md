# DealDash Frontend

The DealDash frontend is a React application for marketplace customers, sellers, and administrators. It includes storefront browsing, checkout, account pages, shop management, and admin dashboards.

**Project builder:** Arslan Ahmed

## Requirements

- Node.js 18.16 or newer
- The DealDash backend running locally or at a configured API origin

## Install and start

From this directory, install the dependencies and start the development server:

```bash
npm ci
npm start
```

Open `http://localhost:3000`. The frontend expects the API at `http://localhost:8000/api/v2` by default. That URL is set in [`src/server.js`](src/server.js); update it when connecting the client to a deployed backend.

## Build

Create an optimized production bundle with:

```bash
npm run build
```

The generated static site is written to `build/`.

## Realtime messaging

The client connects to the backend Socket.IO server for live customer and seller messaging. For a non-local backend, set `REACT_APP_SOCKET_URL` to the backend origin before starting or building the app. If omitted, the socket connection uses the local backend URL in `src/server.js`.

## Main areas

- `src/pages/` contains routed customer, seller, and admin pages.
- `src/components/` contains reusable interface features and forms.
- `src/redux/` contains shared application state and actions.
- `src/routes/` contains route exports and access-control wrappers.
- `public/` contains static files served by the frontend.

See the [project README](../README.md) for the full DealDash overview and [backend setup](../backend/README.md) for API configuration.
