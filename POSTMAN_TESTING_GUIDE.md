# Carbon Credit Market Place - Postman Testing Guide

## Quick Reference - API Endpoints List

### 🔐 Authentication APIs
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | User registration | No |
| POST | `/api/auth/login` | User login | No |
| POST | `/api/auth/logout` | User logout | Yes |

### 👤 User Management APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/users/me` | Get current user profile | Yes | Any |
| GET | `/api/users/{userId}` | Get user by ID | Yes | Owner/Admin/CVA |
| GET | `/api/users/username/{username}` | Get user by username | Yes | Any |
| PUT | `/api/users/{userId}` | Update user profile | Yes | Owner/Admin |
| GET | `/api/users` | Get all users | Yes | Admin |
| GET | `/api/users/role/{role}` | Get users by role | Yes | Admin |
| DELETE | `/api/users/{userId}` | Delete user | Yes | Admin |

### 🚗 Vehicle Management APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/api/vehicles` | Create vehicle | Yes | EV_OWNER/Admin |
| GET | `/api/vehicles` | Get all vehicles | Yes | Admin/CVA |
| GET | `/api/vehicles/{vehicleId}` | Get vehicle by ID | Yes | Owner/Admin/CVA |
| GET | `/api/vehicles/my-vehicles` | Get my vehicles | Yes | Any |
| GET | `/api/vehicles/user/{userId}` | Get vehicles by user | Yes | Admin/CVA |
| GET | `/api/vehicles/vin/{vin}` | Get vehicle by VIN | Yes | Admin/CVA |
| PUT | `/api/vehicles/{vehicleId}` | Update vehicle | Yes | Owner/Admin |
| DELETE | `/api/vehicles/{vehicleId}` | Delete vehicle | Yes | Owner/Admin |

### 🛣️ Journey Management APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/api/journeys` | Create journey | Yes | EV_OWNER |
| GET | `/api/journeys/my-journeys` | Get my journeys | Yes | Any |
| GET | `/api/journeys/{journeyId}` | Get journey by ID | Yes | Owner/Admin/CVA |
| PUT | `/api/journeys/{journeyId}` | Update journey | Yes | Owner |
| DELETE | `/api/journeys/{journeyId}` | Delete journey | Yes | Owner |
| GET | `/api/journeys/statistics` | Get journey statistics | Yes | Any |
| GET | `/api/journeys/admin/all` | Get all journeys | Yes | Admin |
| GET | `/api/journeys/admin/by-status/{status}` | Get journeys by status | Yes | Admin/CVA |

### ✅ CVA (Verification) APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/cva/pending-journeys` | Get pending journeys | Yes | CVA |
| GET | `/api/cva/journey/{journeyId}` | Get journey for review | Yes | CVA |
| POST | `/api/cva/journey/{journeyId}/approve` | Approve journey | Yes | CVA |
| POST | `/api/cva/journey/{journeyId}/reject` | Reject journey | Yes | CVA |
| GET | `/api/cva/statistics` | Get CVA statistics | Yes | CVA |
| GET | `/api/cva/my-verifications` | Get my verifications | Yes | CVA |

### 🌱 Carbon Credit APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/carbon-credits` | Get available credits | No | Any |
| GET | `/carbon-credits/{creditId}` | Get credit by ID | No | Any |
| GET | `/carbon-credits/pending` | Get pending credits | No | Any |
| GET | `/carbon-credits/user/{userId}` | Get credits by user | No | Any |
| POST | `/carbon-credits/{creditId}/verify` | Verify credit | Yes | CVA |
| POST | `/carbon-credits/{creditId}/reject` | Reject credit | Yes | CVA |

### 🏪 Marketplace (Listings) APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/credit-listings/create` | Create listing | Yes | Any |
| GET | `/credit-listings` | Get active listings | No | Any |
| GET | `/credit-listings/search` | Search by price range | No | Any |
| GET | `/credit-listings/my-listings` | Get my listings | Yes | Any |
| GET | `/credit-listings/my-active-listings` | Get my active listings | Yes | Any |
| POST | `/credit-listings/{listingId}/purchase` | Purchase listing | Yes | Any |
| PUT | `/credit-listings/{listingId}/price` | Update listing price | Yes | Owner |
| DELETE | `/credit-listings/{listingId}` | Cancel listing | Yes | Owner |
| GET | `/credit-listings/stats` | Get marketplace stats | No | Any |

### 💳 Transaction APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/transactions/purchase` | Initiate purchase | Yes | Any |
| POST | `/transactions/{transactionId}/complete` | Complete transaction | Yes | Buyer/Seller |
| POST | `/transactions/{transactionId}/cancel` | Cancel transaction | Yes | Buyer/Seller |
| GET | `/transactions/{transactionId}` | Get transaction by ID | Yes | Buyer/Seller/Admin |
| GET | `/transactions/my-transactions` | Get my transactions | Yes | Any |
| GET | `/transactions/purchases` | Get purchase history | Yes | Any |
| GET | `/transactions/sales` | Get sales history | Yes | Any |
| POST | `/transactions/{transactionId}/dispute` | Create dispute | Yes | Buyer/Seller |
| GET | `/transactions/admin/disputed` | Get disputed transactions | Yes | Admin |
| GET | `/transactions/admin/statistics` | Get transaction statistics | Yes | Admin |

### 💰 Wallet APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/api/wallets/my-wallet` | Get my wallet | Yes | Any |
| GET | `/api/wallets/balance-check` | Check balance | Yes | Any |
| POST | `/api/wallets/deposit` | Deposit funds | Yes | Any |
| POST | `/api/wallets/withdraw` | Withdraw funds | Yes | Any |
| GET | `/api/wallets/transactions` | Get wallet transactions | Yes | Any |
| GET | `/api/wallets/admin/user/{userId}` | Get user wallet | Yes | Admin/CVA |
| PUT | `/api/wallets/admin/user/{userId}/balance` | Update user balance | Yes | Admin |

## Legend
- 🔐 **No Auth**: Public endpoints
- 👤 **Any**: Any authenticated user
- 🚗 **Owner**: Resource owner or Admin
- ✅ **CVA**: Carbon Verification Authority role
- 💼 **Admin**: Administrator role only

---

## Overview
This guide provides comprehensive testing instructions for all APIs in the Carbon Credit Market Place project using Postman.

## Base Configuration
- **Base URL**: `http://localhost:8080`
- **Authentication**: JWT Bearer Token (for most endpoints)
- **Content-Type**: `application/json`

## Environment Variables Setup
Create these environment variables in Postman:
- `BASE_URL`: `http://localhost:8080`
- `JWT_TOKEN`: (will be set after login)
- `USER_ID`: (will be set after login)

---

## 1. AUTH CONTROLLER (`/api/auth`)

### 1.1 User Registration
**POST** `{{BASE_URL}}/api/auth/register`

**Body (JSON):**
```json
{
  "username": "evowner1",
  "email": "evowner1@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "0123456789",
  "role": "EV_OWNER"
}
```

**Valid Roles:** `EV_OWNER`, `BUYER`, `CVA`, `ADMIN`

### 1.2 User Login
**POST** `{{BASE_URL}}/api/auth/login`

**Body (JSON):**
```json
{
  "usernameOrEmail": "evowner1",
  "password": "password123"
}
```

**Response:** Copy the `accessToken` and set as `JWT_TOKEN` environment variable

### 1.3 User Logout
**POST** `{{BASE_URL}}/api/auth/logout`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

---

## 2. USER CONTROLLER (`/api/users`)

### 2.1 Get Current User Profile
**GET** `{{BASE_URL}}/api/users/me`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 2.2 Get User by ID
**GET** `{{BASE_URL}}/api/users/{userId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 2.3 Get User by Username
**GET** `{{BASE_URL}}/api/users/username/{username}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 2.4 Update User Profile
**PUT** `{{BASE_URL}}/api/users/{userId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "fullName": "John Updated Doe",
  "phone": "0987654321",
  "email": "updated@example.com"
}
```

### 2.5 Get All Users (Admin Only)
**GET** `{{BASE_URL}}/api/users`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin role required)

### 2.6 Get Users by Role (Admin Only)
**GET** `{{BASE_URL}}/api/users/role/{role}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin role required)

**Valid roles:** `EV_OWNER`, `BUYER`, `CVA`, `ADMIN`

### 2.7 Delete User (Admin Only)
**DELETE** `{{BASE_URL}}/api/users/{userId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin role required)

---

## 3. VEHICLE CONTROLLER (`/api/vehicles`)

### 3.1 Create Vehicle (EV_OWNER or ADMIN)
**POST** `{{BASE_URL}}/api/vehicles`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "userId": "{{USER_ID}}",
  "vin": "1HGBH41JXMN109186",
  "model": "Tesla Model 3",
  "registrationDate": "2023-01-15"
}
```

### 3.2 Get All Vehicles (Admin/CVA Only)
**GET** `{{BASE_URL}}/api/vehicles`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 3.3 Get Vehicle by ID
**GET** `{{BASE_URL}}/api/vehicles/{vehicleId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 3.4 Get My Vehicles
**GET** `{{BASE_URL}}/api/vehicles/my-vehicles`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 3.5 Get Vehicles by User ID (Admin/CVA Only)
**GET** `{{BASE_URL}}/api/vehicles/user/{userId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 3.6 Get Vehicle by VIN (Admin/CVA Only)
**GET** `{{BASE_URL}}/api/vehicles/vin/{vin}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 3.7 Update Vehicle
**PUT** `{{BASE_URL}}/api/vehicles/{vehicleId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "vin": "1HGBH41JXMN109186",
  "model": "Tesla Model 3 Performance",
  "registrationDate": "2023-01-15"
}
```

### 3.8 Delete Vehicle
**DELETE** `{{BASE_URL}}/api/vehicles/{vehicleId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

---

## 4. JOURNEY CONTROLLER (`/api/journeys`)

### 4.1 Create Journey (EV_OWNER Only)
**POST** `{{BASE_URL}}/api/journeys`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "vehicleId": "vehicle-uuid-here",
  "distanceKm": 50.5,
  "energyConsumedKwh": 12.5,
  "co2ReducedKg": 25.2,
  "startLocation": "City A",
  "endLocation": "City B",
  "journeyDate": "2024-01-15T10:00:00"
}
```

### 4.2 Get My Journeys
**GET** `{{BASE_URL}}/api/journeys/my-journeys`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 4.3 Get Journey by ID
**GET** `{{BASE_URL}}/api/journeys/{journeyId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 4.4 Update Journey
**PUT** `{{BASE_URL}}/api/journeys/{journeyId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "distanceKm": 55.0,
  "energyConsumedKwh": 13.0,
  "co2ReducedKg": 27.5
}
```

### 4.5 Delete Journey
**DELETE** `{{BASE_URL}}/api/journeys/{journeyId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 4.6 Get Journey Statistics
**GET** `{{BASE_URL}}/api/journeys/statistics`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 4.7 Get All Journeys (Admin Only)
**GET** `{{BASE_URL}}/api/journeys/admin/all`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin role required)

### 4.8 Get Journeys by Status (Admin/CVA Only)
**GET** `{{BASE_URL}}/api/journeys/admin/by-status/{status}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Valid statuses:** `PENDING_VERIFICATION`, `VERIFIED`, `REJECTED`

---

## 5. CVA CONTROLLER (`/api/cva`) - CVA Role Required

### 5.1 Get Pending Journeys for Verification
**GET** `{{BASE_URL}}/api/cva/pending-journeys`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

### 5.2 Get Journey for Review
**GET** `{{BASE_URL}}/api/cva/journey/{journeyId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

### 5.3 Approve Journey
**POST** `{{BASE_URL}}/api/cva/journey/{journeyId}/approve`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

**Query Parameters:**
- `notes` (optional): "Approved by CVA"

### 5.4 Reject Journey
**POST** `{{BASE_URL}}/api/cva/journey/{journeyId}/reject`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

**Query Parameters:**
- `reason` (required): "Insufficient documentation"

### 5.5 Get CVA Statistics
**GET** `{{BASE_URL}}/api/cva/statistics`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

### 5.6 Get My Verifications
**GET** `{{BASE_URL}}/api/cva/my-verifications`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

---

## 6. CARBON CREDIT CONTROLLER (`/carbon-credits`)

### 6.1 Get All Available Carbon Credits
**GET** `{{BASE_URL}}/carbon-credits`

### 6.2 Get Carbon Credit by ID
**GET** `{{BASE_URL}}/carbon-credits/{creditId}`

### 6.3 Get Pending Credits
**GET** `{{BASE_URL}}/carbon-credits/pending`

### 6.4 Get Credits by User
**GET** `{{BASE_URL}}/carbon-credits/user/{userId}`

### 6.5 Verify Credit (CVA Only)
**POST** `{{BASE_URL}}/carbon-credits/{creditId}/verify`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

**Body (JSON):**
```json
{
  "comments": "Credit verified successfully"
}
```

### 6.6 Reject Credit (CVA Only)
**POST** `{{BASE_URL}}/carbon-credits/{creditId}/reject`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (CVA role required)

**Body (JSON):**
```json
{
  "comments": "Insufficient verification"
}
```

---

## 7. CREDIT LISTING CONTROLLER (`/credit-listings`)

### 7.1 Create Fixed-Price Listing
**POST** `{{BASE_URL}}/credit-listings/create`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `creditId`: UUID of the carbon credit
- `price`: Listing price (e.g., 25.50)

### 7.2 Get Active Listings (Marketplace)
**GET** `{{BASE_URL}}/credit-listings`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 20
- `sortBy` (optional): "newest"

### 7.3 Search by Price Range
**GET** `{{BASE_URL}}/credit-listings/search`

**Query Parameters:**
- `minPrice`: 10.00
- `maxPrice`: 100.00
- `page` (optional): 0
- `size` (optional): 20

### 7.4 Get My Listings
**GET** `{{BASE_URL}}/credit-listings/my-listings`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 20

### 7.5 Get My Active Listings
**GET** `{{BASE_URL}}/credit-listings/my-active-listings`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 20

### 7.6 Purchase Listing
**POST** `{{BASE_URL}}/credit-listings/{listingId}/purchase`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 7.7 Update Listing Price
**PUT** `{{BASE_URL}}/credit-listings/{listingId}/price`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `newPrice`: 30.00

### 7.8 Cancel Listing
**DELETE** `{{BASE_URL}}/credit-listings/{listingId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 7.9 Get Marketplace Statistics
**GET** `{{BASE_URL}}/credit-listings/stats`

---

## 8. TRANSACTION CONTROLLER (`/transactions`)

### 8.1 Initiate Purchase Transaction
**POST** `{{BASE_URL}}/transactions/purchase`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "listingId": "listing-uuid-here"
}
```

### 8.2 Complete Transaction
**POST** `{{BASE_URL}}/transactions/{transactionId}/complete`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 8.3 Cancel Transaction
**POST** `{{BASE_URL}}/transactions/{transactionId}/cancel`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 8.4 Get Transaction by ID
**GET** `{{BASE_URL}}/transactions/{transactionId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 8.5 Get My Transactions
**GET** `{{BASE_URL}}/transactions/my-transactions`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

### 8.6 Get Purchase History
**GET** `{{BASE_URL}}/transactions/purchases`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

### 8.7 Get Sales History
**GET** `{{BASE_URL}}/transactions/sales`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

### 8.8 Create Dispute
**POST** `{{BASE_URL}}/transactions/{transactionId}/dispute`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "reason": "Product not as described"
}
```

### 8.9 Get Disputed Transactions (Admin Only)
**GET** `{{BASE_URL}}/transactions/admin/disputed`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin role required)

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

### 8.10 Get Transaction Statistics (Admin Only)
**GET** `{{BASE_URL}}/transactions/admin/statistics`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin role required)

**Query Parameters:**
- `startDate` (optional): "2024-01-01T00:00:00"
- `endDate` (optional): "2024-12-31T23:59:59"

---

## 9. WALLET CONTROLLER (`/api/wallets`)

### 9.1 Get My Wallet
**GET** `{{BASE_URL}}/api/wallets/my-wallet`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

### 9.2 Check Sufficient Balance
**GET** `{{BASE_URL}}/api/wallets/balance-check`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `amount`: 100.00
- `balanceType` (optional): "CASH" or "CREDIT"

### 9.3 Deposit Funds
**POST** `{{BASE_URL}}/api/wallets/deposit`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "amount": 500.00,
  "paymentMethodId": "payment-method-id"
}
```

### 9.4 Withdraw Funds
**POST** `{{BASE_URL}}/api/wallets/withdraw`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "amount": 100.00,
  "bankAccountInfo": "Bank account details"
}
```

### 9.5 Get Wallet Transactions
**GET** `{{BASE_URL}}/api/wallets/transactions`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

### 9.6 Get User Wallet (Admin/CVA Only)
**GET** `{{BASE_URL}}/api/wallets/admin/user/{userId}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin/CVA role required)

### 9.7 Update User Balance (Admin Only)
**PUT** `{{BASE_URL}}/api/wallets/admin/user/{userId}/balance`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (Admin role required)

**Query Parameters:**
- `creditAmount`: 50.00
- `cashAmount`: 100.00
- `reason` (optional): "Admin adjustment"

---

## Testing Workflow Recommendations

### 1. Basic Flow (EV Owner):
1. Register as EV_OWNER
2. Login and get JWT token
3. Create vehicle
4. Create journey
5. Check journey status

### 2. CVA Flow:
1. Register as CVA
2. Login and get JWT token
3. Get pending journeys
4. Approve/reject journeys
5. Check verification statistics

### 3. Marketplace Flow:
1. Register as BUYER
2. Login and get JWT token
3. Deposit funds to wallet
4. Browse active listings
5. Purchase carbon credits
6. Check transaction history

### 4. Admin Flow:
1. Register as ADMIN
2. Login and get JWT token
3. View all users, journeys, transactions
4. Manage user wallets
5. View system statistics

## Common Response Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Notes
- Replace `{id}`, `{userId}`, etc. with actual UUIDs
- Set JWT token as environment variable after login
- Some endpoints require specific user roles
- Pagination parameters are optional for most list endpoints
