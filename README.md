# DealDash
**🌐 Live Website:** [Visit DealDash](https://dealdashh.netlify.app)
DealDash is a multi-vendor shopping platform where customers can discover products from independent shops, place orders, and stay in touch with sellers. Sellers manage their storefronts through a dashboard, while administrators oversee marketplace activity.

## What you can do

- **Shop:** Browse and search products, explore events, save favorites, use coupons, and add items to a cart.
- **Buy:** Check out with Stripe, PayPal, or cash on delivery; review orders, track delivery, and request eligible refunds.
- **Connect:** Message sellers in real time and leave product reviews after delivery.
- **Sell:** Create and manage a shop, products, events, orders, discount codes, payout details, and customer messages.
- **Administer:** Review marketplace activity and manage users, sellers, products, events, orders, and withdrawal requests.
- **Manage accounts:** Register and activate customer or seller accounts by email, reset passwords, and update profile information.

## Technology

| Area | Tools |
| --- | --- |
| Web client | React 18, React Router, Redux, Tailwind CSS |
| API | Node.js, Express |
| Data | MongoDB with Mongoose |
| Live messaging | Socket.IO |
| Payments | Stripe, PayPal, cash on delivery |
| Email | Resend |
| Uploads | Multer, local backend uploads directory |

## Project layout

```text
backend/    Express API, MongoDB models, email utilities, uploads, and Socket.IO
frontend/   React customer, seller, and admin interfaces
```

For app-specific setup, see the [backend guide](backend/README.md) and [frontend guide](frontend/README.md).

## Run locally

Use Node.js 18.16 or newer and have a MongoDB database available. Configure the backend environment first, then run each app in a separate terminal:

```bash
cd backend
npm ci
npm run dev
```

```bash
cd frontend
npm ci
npm start
```

The frontend runs at `http://localhost:3000` and the API and Socket.IO server run at `http://localhost:8000` by default. Backend environment variables and service setup are documented in [backend/README.md](backend/README.md).

## Project builder

DealDash was built by **Arslan Ahmed**.
