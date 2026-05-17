# Subscription Management System

A comprehensive subscription management system built with Node.js, Express, and MongoDB. This system provides full CRUD operations for subscriptions, user subscription tracking, role-based access control, and an admin dashboard.

## Features

### Core Features

- 🔐 JWT-based authentication and authorization
- 💳 Subscription plan management (CRUD)
- 👥 User subscription assignment and tracking
- 🎯 Role-based access control (RBAC)
- 📊 Admin dashboard with statistics
- 👤 User management system
- 🔄 Subscription lifecycle management (active, expired, cancelled)
- 💰 Billing and payment tracking
- 🔔 Auto-renewal configuration

### Subscription Features

- Multiple subscription tiers/plans
- Flexible billing cycles (monthly, quarterly, yearly)
- Feature-based plans
- Discount and promotion support
- Usage limits (max users, bookings, rooms)
- Plan status tracking

### Role Management

- Admin role
- User role
- Manager role
- Agent role
- Guest role
- Role assignment with history

## Project Structure

```
Subscription Management System-Backend/
├── Subscription/
│   ├── model.js                    # Subscription plan model
│   ├── controllers.js              # Subscription plan controllers
│   ├── userSubscription.model.js   # User subscription mapping model
│   ├── userSubscription.controller.js  # User subscription controllers
│   ├── role.model.js               # Role model
│   ├── roleAssignment.model.js     # Role assignment model
│   ├── roleAssignment.controller.js    # Role assignment controllers
│   └── subscriptionRoutes.js       # All subscription routes
├── Admin/
│   ├── controllers.js              # Admin controllers
│   └── routes.js                   # Admin routes
├── User/
│   ├── model.js                    # User model
│   ├── controllers.js              # User controllers
│   └── routes.js                   # User routes
├── Room/
│   ├── model.js
│   ├── controllers.js
│   └── routes.js
├── Booking/
│   ├── model.js
│   ├── controllers.js
│   └── routes.js
├── Payment/
│   ├── model.js
│   ├── controllers.js
│   └── routes.js
├── middleware/
│   └── authenticate.js             # JWT authentication middleware
├── Frontend/
│   ├── index.html                  # Main HTML file
│   ├── styles.css                  # CSS styling
│   ├── api.js                      # API client
│   ├── auth.js                     # Authentication logic
│   └── app.js                      # Main application logic
├── app.js                          # Express app setup
├── service.js                      # Server entry point
├── package.json                    # Dependencies
└── .env                            # Environment variables
```

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB
- npm or yarn

### Backend Setup

1. **Clone the repository**

```bash
cd "Subscription Management System-Backend"
```

2. **Install dependencies**

```bash
npm install
```

3. **Create .env file**

```bash
# Create .env file with the following variables
PORT=5000
MONGO_URI=mongodb://localhost:27017/subscription_system
JWT_SECRET=your_jwt_secret_key_here
```

4. **Start MongoDB**

```bash
# On Windows
net start MongoDB

# On macOS
brew services start mongodb-community

# On Linux
sudo systemctl start mongod
```

5. **Start the server**

```bash
npm start
# or with nodemon
npx nodemon service.js
```

The server will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend folder**

```bash
cd Frontend
```

2. **Open in browser**

```bash
# Option 1: Use Live Server extension in VS Code
# Option 2: Use Python's simple HTTP server
python -m http.server 8000
# Then open http://localhost:8000
```

## API Endpoints

### Authentication

```
POST   /api/v1/user/login           - User login
POST   /api/v1/user/register        - User registration
```

### Subscription Plans (Admin only for create/update/delete)

```
GET    /api/v1/subscriptions/plans/active      - Get active subscription plans
GET    /api/v1/subscriptions/plans             - Get all subscription plans
GET    /api/v1/subscriptions/plans/:id         - Get subscription by ID
POST   /api/v1/subscriptions/plans             - Create subscription plan
PUT    /api/v1/subscriptions/plans/:id         - Update subscription plan
DELETE /api/v1/subscriptions/plans/:id         - Delete subscription plan
```

### User Subscriptions

```
POST   /api/v1/subscriptions/assign            - Assign subscription to user (admin)
GET    /api/v1/subscriptions/user/:userId      - Get user's subscriptions
GET    /api/v1/subscriptions/user/:userId/active  - Get user's active subscription
PUT    /api/v1/subscriptions/:id               - Update user subscription
POST   /api/v1/subscriptions/:id/cancel        - Cancel user subscription
GET    /api/v1/subscriptions                   - Get all user subscriptions (admin)
```

### Role Management

```
POST   /api/v1/subscriptions/role/assign           - Assign role to user (admin)
GET    /api/v1/subscriptions/role/:userId         - Get user's current role
GET    /api/v1/subscriptions/role                 - Get all role assignments (admin)
PUT    /api/v1/subscriptions/role/:id             - Update role assignment (admin)
DELETE /api/v1/subscriptions/role/:id             - Remove role assignment (admin)
GET    /api/v1/subscriptions/role/filter/by-role  - Get users by role (admin)
```

### Admin Dashboard

```
GET    /api/v1/admin/dashboard-stats      - Get dashboard statistics
GET    /api/v1/admin/users                - Get all users
GET    /api/v1/admin/subscriptions        - Get subscription details
POST   /api/v1/admin/manage-role          - Manage user roles
```

## Request/Response Examples

### Create Subscription Plan

**Request:**

```http
POST /api/v1/subscriptions/plans
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Premium Plan",
  "description": "Premium subscription with all features",
  "price": 99.99,
  "currency": "USD",
  "billingCycle": "monthly",
  "duration": 30,
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "maxUsers": 100,
  "maxBookings": 1000,
  "maxRooms": 50,
  "discountPercentage": 10
}
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription plan created successfully",
  "data": {
    "_id": "ObjectId",
    "name": "Premium Plan",
    "price": 99.99,
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Assign Subscription to User

**Request:**

```http
POST /api/v1/subscriptions/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_id",
  "subscriptionId": "subscription_id",
  "autoRenew": true,
  "billingInfo": {
    "paymentMethod": "credit_card",
    "transactionId": "txn_12345",
    "amount": 99.99,
    "tax": 10.00
  }
}
```

### Assign Role to User

**Request:**

```http
POST /api/v1/subscriptions/role/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_id",
  "role": "admin",
  "reason": "Promoted to admin"
}
```

## Authentication

### JWT Token

- Token is returned upon successful login
- Token includes user ID and role
- Must be included in `Authorization` header as `Bearer {token}`
- Token expires after a configurable time

### Protected Routes

- Most routes require authentication
- Admin-only routes check for `admin` role
- User can access their own data or admin can access any data

## Middleware

### Authentication Middleware

```javascript
// Check any valid token
router.get("/route", authenticate(), controller);

// Check specific role
router.get("/route", authenticate("admin"), controller);

// Check multiple roles
router.get("/route", authenticate("admin", "manager"), controller);
```

## Models

### Subscription

- name: String (required, unique)
- description: String
- price: Number (required, min: 0)
- currency: String (USD, EUR, GBP, INR)
- billingCycle: String (monthly, quarterly, yearly)
- duration: Number (in days, required)
- features: [String]
- maxUsers: Number (required)
- maxBookings: Number
- maxRooms: Number
- discountPercentage: Number
- isActive: Boolean
- status: String (active, inactive, archived)
- createdBy: ObjectId (User reference)
- updatedBy: ObjectId (User reference)

### UserSubscription

- userId: ObjectId (User reference, required)
- subscriptionId: ObjectId (Subscription reference, required)
- startDate: Date
- endDate: Date
- renewalDate: Date
- status: String (active, expired, cancelled, suspended, pending)
- paymentStatus: String (paid, pending, failed, refunded)
- autoRenew: Boolean
- billingInfo: Object
  - paymentMethod: String
  - transactionId: String
  - amount: Number
  - tax: Number
- cancelledBy: ObjectId (User reference)
- cancellationReason: String
- cancellationDate: Date

### RoleAssignment

- userId: ObjectId (User reference, required)
- role: String (admin, user, manager, agent, guest)
- assignedBy: ObjectId (User reference, required)
- reason: String
- startDate: Date
- endDate: Date
- isActive: Boolean

## Frontend Features

### Login Page

- Email and password authentication
- Register link
- Error handling

### Dashboard

- View current subscription
- Subscription status
- Personal information

### Subscription Plans

- Browse available plans
- View plan features
- Subscribe to plans
- Compare pricing

### Admin Panel

- Dashboard with statistics
- User management
- Subscription plan management
- Role assignment
- Revenue tracking

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

Common HTTP Status Codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict (e.g., duplicate entry)
- 500: Internal Server Error

## Testing

### Using cURL

**Login:**

```bash
curl -X POST http://localhost:5000/api/v1/user/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

**Get Subscription Plans:**

```bash
curl -X GET http://localhost:5000/api/v1/subscriptions/plans/active
```

**Create Subscription (Admin):**

```bash
curl -X POST http://localhost:5000/api/v1/subscriptions/plans \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Basic Plan",
    "price": 29.99,
    "duration": 30,
    "maxUsers": 5,
    "features": ["Feature 1", "Feature 2"]
  }'
```

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- Role-based access control
- Input validation
- SQL injection prevention (using Mongoose)
- CORS should be configured for production
- Rate limiting recommended

## Performance Optimization

- Indexed MongoDB queries (userId, subscriptionId, status)
- Pagination for list endpoints
- Populated references for related data
- Efficient filtering and sorting

## Deployment

### Environment Setup

1. Set up MongoDB Atlas or MongoDB server
2. Configure environment variables
3. Set JWT_SECRET to a strong random string
4. Configure MONGO_URI for production database

### Deployment Options

- Heroku
- AWS
- DigitalOcean
- Vercel (for frontend)
- Netlify (for frontend)

### Pre-deployment Checklist

- [ ] All environment variables set
- [ ] Database backups configured
- [ ] Error logging setup
- [ ] CORS configured
- [ ] Rate limiting configured
- [ ] SSL/TLS certificate configured
- [ ] Monitoring and alerts setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For issues or questions, please contact support@example.com

## Changelog

### Version 1.0.0

- Initial release
- Full subscription CRUD
- User subscription management
- Role-based access control
- Admin dashboard
- Frontend application
