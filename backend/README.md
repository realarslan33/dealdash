# DealDash Backend

The DealDash backend provides the Express API, MongoDB data layer, email notifications, local image uploads, and Socket.IO messaging service.

## Requirements

- Node.js 18.16 or newer
- A MongoDB database and connection URI
- Stripe API keys for the payment integration
- Resend credentials to send account activation, password reset, and withdrawal emails

## Install and run

From this directory:

```bash
npm ci
npm run dev
```

`npm run dev` starts the API with nodemon. Use `npm start` to run it with Node.js directly. The server listens on port `8000` unless `PORT` is set. The frontend uses `http://localhost:8000/api/v2` by default.

Before starting, create `config/.env` and make sure the `uploads/` directory exists. Both paths are ignored by Git. The server loads `config/.env` during local development.

```dotenv
PORT=8000
DB_URL=mongodb://127.0.0.1:27017/dealdash
JWT_SECRET_KEY=replace-with-a-long-random-secret
JWT_EXPIRES=7d
ACTIVATION_SECRET=replace-with-another-long-random-secret
FRONTEND_URL=http://localhost:3000

STRIPE_API_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL="DealDash <mail@your-verified-domain.example>"
```

Use credentials from your own MongoDB, Stripe, and Resend accounts. Configure the sender address with a domain authorized in Resend. Email credentials are needed for routes that send email; those operations return an error if Resend is not configured. Keep this file and all private keys out of source control.

For deployment, provide these values through the hosting provider's environment configuration. Set `FRONTEND_URL` to the public frontend origin; it is used for CORS, Socket.IO, account activation links, and password reset links.

## API and realtime service

All JSON API routes are mounted under `/api/v2`:

| Prefix | Purpose |
| --- | --- |
| `/user` | Customer registration, authentication, profiles, and password reset |
| `/shop` | Seller registration, shop management, and seller password reset |
| `/product`, `/event`, `/coupon` | Product, event, and discount code management |
| `/order`, `/payment` | Checkout, order management, and Stripe payment intents |
| `/withdraw` | Seller withdrawal requests and admin processing |
| `/message`, `/conversation` | Persisted customer and seller conversations |

The Socket.IO server shares the API's HTTP server and port. `GET /test` returns a simple response to check that the API is reachable.

Password reset links expire after one hour. Uploaded files are stored in `uploads/` and served by the backend. The Resend integration sends plain-text activation, password reset, and withdrawal emails.

## Code map

- `controller/` defines API routes and request handling.
- `model/` contains Mongoose schemas.
- `middleware/` contains authentication, async error handling, and error responses.
- `db/Database.js` connects to MongoDB.
- `socket/` configures Socket.IO events.
- `utils/` contains shared mail, token, validation, and error utilities.
- `server.js` configures Express, middleware, API routes, and the HTTP server.

See the [project README](../README.md) for the DealDash overview and [frontend README](../frontend/README.md) for client setup.
