# Subscription Management System Backend

Backend API for a subscription management system built with Node.js, Express, and MongoDB.

This API handles authentication, role-based access, user/customer management, subscription plans, and payments with monthly, quarterly, and annual billing.

## Features

- JWT authentication
- Role-based authorization for `admin`, `agent`, and `customer`
- Admin user management
- Agent customer/user creation and read access
- Customer profile management
- Subscription plan CRUD for admins
- Subscription plan read access for agents and customers
- Payment creation for admins, agents, and customers
- Payment update/delete access for admins
- Per-customer and per-plan payment tracking
- Monthly, quarterly, and annual billing cycles
- Quarterly discount: 20%
- Annual discount: 40%
- Access countdown dates stored on payment records
- Admin dashboard statistics

## Tech Stack

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- dotenv

## Project Structure

```text
Subsription Management System-Backend/
├── Admin/
│   ├── controllers.js
│   └── routes.js
├── Payment/
│   ├── controllers.js
│   ├── model.js
│   └── routes.js
├── User/
│   ├── controllers.js
│   ├── model.js
│   └── routes.js
├── middleware/
│   └── authenticate.js
├── subscription/
│   ├── controller.js
│   ├── model.js
│   └── routes.js
├── app.js
├── service.js
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB connection string

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file in the backend root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/subscription-management-system
JWT_SECRET=your_jwt_secret
```

`MONGODB_URI` is also supported as an alternative to `MONGO_URI`.

### Run The Server

```bash
node service.js
```

The API runs on:

```text
http://localhost:5000/api/v1
```

## API Routes

### Auth And Profile

Base path: `/api/v1/user`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/register` | Public | Register a user |
| POST | `/login` | Public | Login and receive a JWT |
| GET | `/profile` | Authenticated | Get current user profile |
| PATCH | `/profile` | Authenticated | Update current user profile |
| PATCH | `/change-password` | Authenticated | Change current user password |

### Admin And Agent

Base path: `/api/v1/admin`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/users` | Admin, Agent | List users |
| GET | `/customers` | Admin, Agent | List customers |
| POST | `/users` | Admin, Agent | Create user/customer |
| PATCH | `/users/:id` | Admin | Update a user |
| DELETE | `/users/:id` | Admin | Delete a user |
| PATCH | `/users/:id/password` | Admin | Change a user's password |
| GET | `/dashboard-stats` | Admin, Agent | Dashboard statistics |
| GET | `/subscriptions` | Admin | Subscription details |
| POST | `/manage-role` | Admin | Manage user roles |
| GET | `/activities` | Admin | Admin activity records |

### Subscriptions

Base path: `/api/v1/subscriptions`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Admin, Agent, Customer | List plans |
| POST | `/` | Admin | Create a plan |
| PUT | `/:id` | Admin | Update a plan |
| PATCH | `/:id` | Admin | Update a plan |
| DELETE | `/:id` | Admin | Delete a plan |

### Payments

Base path: `/api/v1/payments`

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/` | Admin, Agent, Customer | List payments |
| POST | `/` | Admin, Agent, Customer | Create or update a payment |
| PUT | `/:id` | Admin | Update a payment |
| PATCH | `/:id` | Admin | Update a payment |
| DELETE | `/:id` | Admin | Delete a payment |

## Payment Rules

- A customer can have multiple plans at the same time.
- A customer cannot have duplicate active records for the same plan.
- Paying for the same plan again updates the existing plan payment row.
- Paying for a different plan creates or keeps a separate payment row.
- Monthly billing has no discount.
- Quarterly billing applies 20% off.
- Annual billing applies 40% off.
- Access dates are stored as `billingPeriodStart` and `billingPeriodEnd`.

Example:

- If a customer has `Go Annual`, they can still buy `Pro Monthly`.
- If they pay for `Go Annual` again, the existing `Go` payment row is updated.

## Health Check

```text
GET /api/v1/health
```

Returns a simple service status response.

## Related Project

Use this backend with the Subscription Management System frontend.
