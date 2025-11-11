# Carbon Credit Market Place - Postman Testing Guide

## 🚨 Common Issues & Troubleshooting

### Registration Errors

#### **Duplicate Key Constraint Violations**
If you see errors like:
```
Cannot insert duplicate key row in object 'dbo.users' with unique index 'UKdu5v5sr43g5bfnji4vb8hg5s3'. The duplicate key value is (0246813579).
```

**Problem:** Trying to register with a phone number that already exists in the database.

**Solutions:**
1. **Use unique phone numbers** for each test user
2. **Check existing data** before registration
3. **Clear test data** if needed

**Quick Fix - Use Different Phone Numbers:**
```json
// User 1
{"phone": "0111111111", "username": "test1", "email": "test1@example.com"}
// User 2  
{"phone": "0222222222", "username": "test2", "email": "test2@example.com"}
// User 3
{"phone": "0333333333", "username": "test3", "email": "test3@example.com"}
```

#### **Common Duplicate Errors:**
- **Username exists:** Change the `username` field
- **Email exists:** Change the `email` field  
- **Phone exists:** Change the `phone` field

### Authentication Issues

#### **Token Expired/Invalid**
```json
{"success": false, "message": "JWT token is expired"}
```
**Solution:** Login again to get a new token

#### **Forbidden Access**
```json
{"success": false, "message": "Access denied"}
```
**Solution:** Check if your user role has permission for the endpoint

### Database Connection Issues
- Ensure SQL Server is running
- Check connection string in `application.properties`
- Verify database exists and is accessible

---

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
| POST | `/carbon-credits/convert-co2-to-credits` | Convert CO2 to credits | Yes | Any |

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
| GET | `/api/wallets/my-wallet` | Get my wallet (includes CO2 balance) | Yes | Any |
| GET | `/api/wallets/balance-check` | Check balance | Yes | Any |
| POST | `/api/wallets/deposit` | Deposit funds | Yes | Any |
| POST | `/api/wallets/withdraw` | Withdraw funds | Yes | Any |
| GET | `/api/wallets/transactions` | Get wallet transactions | Yes | Any |
| PUT | `/api/wallets/admin/user/{userId}/balance` | Update user balance (Admin) | Yes | Admin |
| GET | `/api/wallets/admin/user/{userId}` | Get user wallet | Yes | Admin/CVA |
| PUT | `/api/wallets/admin/user/{userId}/balance` | Update user balance | Yes | Admin |

### 📄 Certificate & Retirement APIs
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/api/retirement/initiate` | Initiate carbon credit retirement | Yes | BUYER |
| GET | `/api/retirement/{id}` | Get retirement transaction by ID | Yes | BUYER/CVA/ADMIN |
| GET | `/api/retirement/user/{userId}` | Get user's retirement history | Yes | BUYER/CVA/ADMIN |
| GET | `/api/retirement/{retirementId}/certificate` | Get certificate by retirement ID | Yes | BUYER/CVA/ADMIN |
| GET | `/api/retirement/certificates/user/{userId}` | Get all certificates for a user | Yes | BUYER/CVA/ADMIN |

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

**Expected Response (Success):** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-uuid-123",
    "username": "evowner1",
    "email": "evowner1@example.com",
    "fullName": "John Doe",
    "phone": "0123456789",
    "role": "EV_OWNER"
  }
}
```

#### **1.1.1 Error Scenarios - Duplicate Data**

**Duplicate Username:**
```json
{
  "success": false,
  "message": "Username already exists: evowner1"
}
```

**Duplicate Email:**
```json
{
  "success": false,
  "message": "Email already exists: evowner1@example.com"
}
```

**Duplicate Phone Number:**
```json
{
  "success": false,
  "message": "Phone number already exists: 0123456789"
}
```

**💡 Tip:** If you encounter duplicate phone number errors, change the phone number in your test data. Each phone number must be unique across all users.

**Example Test Data Set:**
```json
// First user
{"phone": "0123456789", "username": "user1", "email": "user1@test.com"}
// Second user (different phone)
{"phone": "0987654321", "username": "user2", "email": "user2@test.com"}
// Third user (different phone)
{"phone": "0246813579", "username": "user3", "email": "user3@test.com"}
```

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

### 6.7 Convert CO2 to Credits
**POST** `{{BASE_URL}}/carbon-credits/convert-co2-to-credits`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `co2Amount`: Amount of CO2 to convert (minimum 1000kg)

**Example:** `{{BASE_URL}}/carbon-credits/convert-co2-to-credits?co2Amount=1000`

**Expected Response (Success):**
```json
{
  "success": true,
  "message": "Successfully converted 1000kg CO2 to 1 credits",
  "data": {
    "convertedCo2Kg": 1000,
    "creditsReceived": 1,
    "remainingCo2Kg": 500.5,
    "totalCreditBalance": 1.0
  }
}
```

**Error Responses:**
```json
// Insufficient CO2 balance
{
  "success": false,
  "message": "Insufficient CO2 reduction balance. Current balance: 500.0kg"
}

// Below minimum requirement
{
  "success": false,
  "message": "Minimum 1000kg CO2 required for conversion to credits"
}
```

**Testing Notes:**
- User must have accumulated CO2 reduction from verified journeys
- Conversion rate: 1000kg CO2 = 1 carbon credit
- Remaining CO2 balance is preserved if less than 1000kg
- Check wallet before and after conversion to verify balance changes

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

## 10. CERTIFICATE & RETIREMENT CONTROLLER (`/api/retirement`) 🏆

### 10.1 Initiate Carbon Credit Retirement (BUYER Only)
**POST** `{{BASE_URL}}/api/retirement/initiate`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}` (BUYER role required)

**Body (JSON):**
```json
{
  "userId": "{{USER_ID}}",
  "amountToRetireKg": 25.50,
  "projectInfo": "Solar Panel Installation Project - Q4 2025",
  "retirementPurpose": "Corporate Carbon Neutrality Initiative"
}
```

**Expected Response:**
```json
{
  "retirementId": "123e4567-e89b-12d3-a456-426614174001",
  "userId": "{{USER_ID}}",
  "userUsername": "buyer1",
  "amountRetiredKg": 25.50,
  "retirementDate": "2025-10-29",
  "status": "PENDING",
  "retiredCarbonCreditIds": [
    "credit-uuid-1",
    "credit-uuid-2"
  ],
  "createdAt": "2025-10-29T10:30:00Z",
  "certificate": null,
  "message": "Retirement initiated successfully. Certificate generation in progress."
}
```

**Test Scripts (Postman):**
```javascript
// Save retirement ID for subsequent tests
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("RETIREMENT_ID", response.retirementId);
    console.log("Retirement ID saved:", response.retirementId);
}
```

### 10.2 Get Retirement Transaction by ID
**GET** `{{BASE_URL}}/api/retirement/{{RETIREMENT_ID}}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Expected Response:**
```json
{
  "retirementId": "{{RETIREMENT_ID}}",
  "userId": "{{USER_ID}}",
  "userUsername": "buyer1",
  "amountRetiredKg": 25.50,
  "retirementDate": "2025-10-29",
  "status": "COMPLETED",
  "retiredCarbonCreditIds": [
    "credit-uuid-1",
    "credit-uuid-2"
  ],
  "createdAt": "2025-10-29T10:30:00Z",
  "certificate": {
    "id": "cert-uuid-123",
    "certificateCode": "CERT-1730203800000-ABC12",
    "buyerId": "{{USER_ID}}",
    "buyerUsername": "John Doe",
    "buyerEmail": "buyer1@example.com",
    "retirementTransactionId": "{{RETIREMENT_ID}}",
    "amountRetiredKg": 25.50,
    "projectSourceInfo": "Tesla Model 3 (VIN123), Solar Installation Project",
    "retirementDate": "2025-10-29",
    "status": "COMPLETED",
    "pdfUrl": "https://storage.googleapis.com/carbon-credit-marketplace-certs-2025/certificates/CERT-1730203800000-ABC12.pdf",
    "createdAt": "2025-10-29T10:30:15Z"
  }
}
```

### 10.3 Get User's Retirement History (Paginated)
**GET** `{{BASE_URL}}/api/retirement/user/{{USER_ID}}`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

**Expected Response:**
```json
{
  "content": [
    {
      "retirementId": "{{RETIREMENT_ID}}",
      "userId": "{{USER_ID}}",
      "userUsername": "buyer1",
      "amountRetiredKg": 25.50,
      "retirementDate": "2025-10-29",
      "status": "COMPLETED",
      "retiredCarbonCreditIds": ["credit-uuid-1", "credit-uuid-2"],
      "createdAt": "2025-10-29T10:30:00Z",
      "certificate": { /* Certificate details */ }
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

### 10.4 Get Certificate by Retirement ID
**GET** `{{BASE_URL}}/api/retirement/{{RETIREMENT_ID}}/certificate`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Expected Response:**
```json
{
  "id": "cert-uuid-123",
  "certificateCode": "CERT-1730203800000-ABC12",
  "buyerId": "{{USER_ID}}",
  "buyerUsername": "John Doe",
  "buyerEmail": "buyer1@example.com",
  "retirementTransactionId": "{{RETIREMENT_ID}}",
  "amountRetiredKg": 25.50,
  "projectSourceInfo": "Tesla Model 3 (VIN123), Solar Installation Project",
  "retirementDate": "2025-10-29",
  "status": "COMPLETED",
  "pdfUrl": "https://storage.googleapis.com/carbon-credit-marketplace-certs-2025/certificates/CERT-1730203800000-ABC12.pdf",
  "createdAt": "2025-10-29T10:30:15Z"
}
```

**Test Scripts (Postman):**
```javascript
// Save certificate ID and PDF URL for verification
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("CERTIFICATE_ID", response.id);
    pm.environment.set("PDF_URL", response.pdfUrl);
    console.log("Certificate Code:", response.certificateCode);
    console.log("PDF URL:", response.pdfUrl);
}
```

### 10.5 Get All Certificates for a User (Paginated)
**GET** `{{BASE_URL}}/api/retirement/certificates/user/{{USER_ID}}?page=0&size=10`

**Headers:**
- `Authorization`: `Bearer {{JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

**Expected Response:**
```json
{
  "content": [
    {
      "id": "cert-uuid-123",
      "certificateCode": "CERT-1730203800000-ABC12",
      "buyerId": "{{USER_ID}}",
      "buyerUsername": "John Doe",
      "buyerEmail": "buyer1@example.com",
      "retirementTransactionId": "{{RETIREMENT_ID}}",
      "amountRetiredKg": 25.50,
      "projectSourceInfo": "Tesla Model 3 (VIN123), Solar Installation Project",
      "retirementDate": "2025-10-29",
      "status": "COMPLETED",
      "pdfUrl": "https://storage.googleapis.com/...",
      "createdAt": "2025-10-29T10:30:15Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

## 🔧 Common Troubleshooting Issues

### **Issue 1: SQL Server UUID Data Type Error**
```
Error: Cannot find data type UUID
```
**Solution:** SQL Server uses `UNIQUEIDENTIFIER` instead of `UUID`. This has been fixed in the RetirementTransaction entity.

### **Issue 2: Google Cloud Storage Credentials Error**
```
Error: C:UsersacerDocumentsSWP302... (The system cannot find the file specified)
```
**Solution:** 
1. Use forward slashes in file paths: `C:/Users/acer/Documents/...`
2. Set `GCP_STORAGE_ENABLED=false` for local development
3. Ensure credentials file exists at the specified path

### **Issue 3: Certificate Generation Fails**
```
Error: StorageService dependency injection fails
```
**Solution:** The application now supports mock storage for development:
- Set `spring.cloud.gcp.storage.enabled=false` in application.properties
- Set `app.certificate.use-cloud-storage=false` for development mode

### **Issue 4: Database Table Creation Issues**
```
Error: Cannot find table 'retired_credit_details'
```
**Solution:** This happens when Hibernate tries to create foreign keys before tables. 
- Ensure `spring.jpa.hibernate.ddl-auto=update` is set
- Run the application multiple times if needed for table creation order

### **Issue 5: Wallet Balance Not Updated After Purchase**
```
Error: Cash balance unchanged, credit balance not increased after purchase
```
**Solution:** The CreditListingController now uses TransactionService instead of directly calling creditListingService:
- Purchase endpoint: `POST /credit-listings/{listingId}/purchase` 
- Now returns Transaction details instead of Listing details
- Properly handles wallet operations (cash/credit balance updates)
- Transfers credit ownership to buyer

### **Issue 6: Purchase Bypasses Transaction System**
```
Error: Credits purchased but no transaction record, no wallet updates
```
**Solution:** 
- Use the updated purchase endpoint that creates proper Transaction records
- Verify response contains `transactionId` field
- Check that wallet balances are updated immediately after purchase

---

## 🚀 Quick Start for Testing

### **Development Mode Setup:**
1. Set these environment variables:
   ```
   GCP_STORAGE_ENABLED=false
   USE_CLOUD_STORAGE=false
   ```

2. Start the application - it will use mock storage

3. Test certificate generation:
   ```bash
   POST /api/retirement/initiate
   # Certificate will be generated with mock PDF URL
   ```

### **Production Mode Setup:**
1. Ensure GCP credentials file exists
2. Set these environment variables:
   ```
   GCP_STORAGE_ENABLED=true
   USE_CLOUD_STORAGE=true
   ```

3. Test with actual cloud storage

---

## 📋 Enhanced Testing Workflow Recommendations

### 1. 🚗 **EV Owner Basic Flow:**
1. Register as EV_OWNER
2. Login and get JWT token
3. Create vehicle
4. Create journey
5. Check journey status

### 2. ✅ **CVA Verification Flow:**
1. Register as CVA
2. Login and get JWT token
3. Get pending journeys
4. Approve/reject journeys
5. Check verification statistics

### 3. 🏪 **Marketplace Trading Flow:**
1. Register as BUYER
2. Login and get JWT token
3. Deposit funds to wallet
4. Browse active listings
5. Purchase carbon credits
6. Check transaction history

### 4. 💼 **Admin Management Flow:**
1. Register as ADMIN
2. Login and get JWT token
3. View all users, journeys, transactions
4. Manage user wallets
5. View system statistics

### 5. 🏆 **Certificate & Retirement Flow (NEW):**
1. Register as BUYER
2. Login and get JWT token
3. Ensure you have purchased carbon credits (or use test credits)
4. Initiate retirement with `POST /api/retirement/initiate`
5. Monitor retirement status with `GET /api/retirement/{id}`
6. Verify certificate generation with `GET /api/retirement/{id}/certificate`
7. Check PDF generation (if cloud storage enabled)
8. View retirement history with `GET /api/retirement/user/{userId}`
9. Test error scenarios (insufficient credits, wrong role, etc.)

### 6. 🔄 **Complete End-to-End Integration Flow:
```
Step 1: EV_OWNER Journey Creation
├── Register EV_OWNER account
├── Create vehicle registration
├── Log EV journeys with CO2 savings
└── Submit for CVA verification

Step 2: CVA Verification Process  
├── Register CVA account
├── Review pending journeys
├── Approve valid journeys
└── Generate carbon credits

Step 3: Marketplace Trading
├── Register BUYER account
├── Deposit funds to wallet
├── Browse available credits
├── Purchase carbon credits
└── Complete transactions

Step 4: Credit Retirement & Certification
├── Initiate credit retirement
├── Generate retirement certificate
├── Create PDF documentation
├── Store in cloud storage
└── Provide certificate access

Step 5: System Administration
├── Monitor all transactions
├── Manage user accounts
├── Oversee system statistics
└── Handle disputes/issues
```

### 7. 🧪 **Comprehensive Testing Scenarios:**

#### **A. Happy Path Testing:**
1. Complete user registration for all roles
2. Full journey lifecycle (creation → verification → credit generation)
3. Successful marketplace transactions
4. End-to-end retirement and certification process

#### **B. Error Handling Testing:**
1. Authentication failures (invalid tokens, expired sessions)
2. Authorization failures (wrong roles, insufficient permissions)
3. Business logic violations (insufficient credits, invalid data)
4. System errors (service unavailable, timeout scenarios)

#### **C. Edge Case Testing:**
1. Large data volumes (pagination testing)
2. Concurrent operations (multiple users, simultaneous requests)
3. Data integrity (transaction rollbacks, consistency checks)
4. Performance boundaries (maximum file sizes, request limits)

### 8. 📊 **Testing Best Practices:**

#### **Environment Setup:**
- Use separate Postman environments for dev/staging/prod
- Maintain consistent test data across environments
- Use environment variables for dynamic data (IDs, tokens)

#### **Test Organization:**
- Group related tests in Postman collections
- Use meaningful test names and descriptions
- Implement proper test sequences and dependencies

#### **Data Management:**
- Clean up test data after test runs
- Use unique identifiers to avoid conflicts
- Maintain test data isolation between test runs

#### **Monitoring & Validation:**
- Verify response status codes and structures
- Validate business logic in response data
- Check for proper error messages and codes
- Monitor performance metrics during testing

---

## 🛒 **BUYER WORKFLOW: Complete Testing Guide**

### **Overview: Complete Buyer Journey**
This section provides step-by-step instructions for testing the complete buyer workflow:
1. **Setup Buyer Account** → 2. **Fund Wallet** → 3. **Purchase Credits** → 4. **Check Wallet** → 5. **Retire Credits** → 6. **Get Certificate**

---

### **STEP 1: Setup BUYER Account** 🔐

#### **1.1 Register as BUYER**
**POST** `{{BASE_URL}}/api/auth/register`

**Body (JSON):**
```json
{
  "username": "buyer_test_user",
  "email": "buyer.test@example.com",
  "password": "password123",
  "fullName": "John Buyer",
  "phone": "0987654321",
  "role": "BUYER"
}
```

**Expected Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "userId": "buyer-uuid-123"
}
```

#### **1.2 Login as BUYER**
**POST** `{{BASE_URL}}/api/auth/login`

**Body (JSON):**
```json
{
  "usernameOrEmail": "buyer_test_user",
  "password": "password123"
}
```

**Test Scripts (Postman):**
```javascript
// Save buyer credentials for workflow
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("BUYER_JWT_TOKEN", response.accessToken);
    pm.environment.set("BUYER_USER_ID", response.userId);
    pm.environment.set("BUYER_USERNAME", response.username);
    console.log("Buyer logged in:", response.username);
}
```

---

### **STEP 2: Fund Wallet** 💰

#### **2.1 Check Initial Wallet Balance**
**GET** `{{BASE_URL}}/api/wallets/my-wallet`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "userId": "{{BUYER_USER_ID}}",
  "cashBalance": 0.00,
  "creditBalance": 0.00,
  "lastUpdated": "2025-10-29T16:30:00Z"
}
```

#### **2.2 Deposit Funds to Wallet**
**POST** `{{BASE_URL}}/api/wallets/deposit`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "amount": 1000.00,
  "paymentMethodId": "payment-method-visa-1234"
}
```

**Expected Response:**
```json
{
  "transactionId": "deposit-txn-123",
  "amount": 1000.00,
  "newBalance": 1000.00,
  "message": "Deposit completed successfully"
}
```

#### **2.3 Verify Wallet Balance After Deposit**
**GET** `{{BASE_URL}}/api/wallets/my-wallet`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "userId": "{{BUYER_USER_ID}}",
  "cashBalance": 1000.00,
  "creditBalance": 0.00,
  "lastUpdated": "2025-10-29T16:35:00Z"
}
```

---

### **STEP 3: Purchase Carbon Credits** 🌱

#### **3.1 Browse Available Credits**
**GET** `{{BASE_URL}}/credit-listings?page=0&size=10&sortBy=newest`

**Expected Response:**
```json
{
  "content": [
    {
      "listingId": "listing-uuid-456",
      "creditId": "credit-uuid-789",
      "sellerId": "evowner-uuid-001",
      "price": 25.50,
      "co2ReducedKg": 50.0,
      "projectInfo": "Tesla Model 3 EV Journey",
      "status": "ACTIVE",
      "listedAt": "2025-10-29T10:00:00Z"
    }
  ],
  "totalElements": 5,
  "totalPages": 1
}
```

**Test Scripts (Postman):**
```javascript
// Save first available listing for purchase
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.content && response.content.length > 0) {
        pm.environment.set("TARGET_LISTING_ID", response.content[0].listingId);
        pm.environment.set("TARGET_CREDIT_ID", response.content[0].creditId);
        pm.environment.set("LISTING_PRICE", response.content[0].price);
        console.log("Target listing selected:", response.content[0].listingId);
    }
}
```

#### **3.2 Check Balance Sufficiency**
**GET** `{{BASE_URL}}/api/wallets/balance-check?amount={{LISTING_PRICE}}&balanceType=CASH`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "sufficient": true,
  "requestedAmount": 25.50,
  "availableBalance": 1000.00,
  "balanceType": "CASH"
}
```

#### **3.3 Purchase Carbon Credit Listing**
**POST** `{{BASE_URL}}/credit-listings/{{TARGET_LISTING_ID}}/purchase`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "transactionId": "purchase-txn-789",
  "creditId": "{{TARGET_CREDIT_ID}}",
  "buyerId": "{{BUYER_USER_ID}}",
  "sellerId": "evowner-uuid-001",
  "amount": 25.50,
  "status": "COMPLETED",
  "createdAt": "2025-10-29T16:40:00Z",
  "completedAt": "2025-10-29T16:40:05Z"
}
```

**Test Scripts (Postman):**
```javascript
// Save transaction details for verification
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("PURCHASE_TRANSACTION_ID", response.transactionId);
    pm.environment.set("PURCHASED_CREDIT_ID", response.creditId);
    console.log("Transaction completed:", response.transactionId);
    console.log("Credit purchased:", response.creditId);
    console.log("Amount paid:", response.amount);
}
```

---

### **STEP 4: Verify Purchase & Check Wallet** ✅

#### **4.1 Check Updated Wallet Balance**
**GET** `{{BASE_URL}}/api/wallets/my-wallet`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "userId": "{{BUYER_USER_ID}}",
  "cashBalance": 974.50,
  "creditBalance": 50.0,
  "lastUpdated": "2025-10-29T16:45:00Z"
}
```

**Verification Points:**
- ✅ Cash balance decreased by purchase amount
- ✅ Credit balance increased by CO2 amount purchased

#### **4.2 View Purchase Transaction Details**
**GET** `{{BASE_URL}}/transactions/{{PURCHASE_TRANSACTION_ID}}`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "transactionId": "{{PURCHASE_TRANSACTION_ID}}",
  "type": "PURCHASE",
  "buyerId": "{{BUYER_USER_ID}}",
  "sellerId": "evowner-uuid-001",
  "listingId": "{{TARGET_LISTING_ID}}",
  "amount": 25.50,
  "status": "COMPLETED",
  "completedAt": "2025-10-29T16:40:00Z"
}
```

#### **4.3 Check My Purchased Credits**
**GET** `{{BASE_URL}}/carbon-credits/user/{{BUYER_USER_ID}}`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
[
  {
    "creditId": "{{PURCHASED_CREDIT_ID}}",
    "ownerId": "{{BUYER_USER_ID}}",
    "co2ReducedKg": 50.0,
    "status": "VERIFIED",
    "projectInfo": "Tesla Model 3 EV Journey",
    "retiredAt": "2025-10-29T16:50:00Z",
    "retirementTransactionId": "{{RETIREMENT_ID}}"
  }
]
```

---

### **STEP 5: Initiate Credit Retirement** 🏆

#### **5.1 Prepare Retirement Request**
**POST** `{{BASE_URL}}/api/retirement/initiate`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Body (JSON):**
```json
{
  "userId": "{{BUYER_USER_ID}}",
  "amountToRetireKg": 25.0,
  "projectInfo": "Corporate Carbon Neutrality Project - Q4 2025",
  "retirementPurpose": "Offsetting business operations for sustainability goals"
}
```

**Expected Response:**
```json
{
  "retirementId": "retirement-uuid-456",
  "userId": "{{BUYER_USER_ID}}",
  "userUsername": "buyer_test_user",
  "amountRetiredKg": 25.0,
  "retirementDate": "2025-10-29",
  "status": "PENDING",
  "retiredCarbonCreditIds": [
    "{{PURCHASED_CREDIT_ID}}"
  ],
  "createdAt": "2025-10-29T16:50:00Z",
  "certificate": null,
  "message": "Retirement initiated successfully. Certificate generation in progress."
}
```

**Test Scripts (Postman):**
```javascript
// Save retirement details for certificate tracking
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("RETIREMENT_ID", response.retirementId);
    pm.environment.set("RETIREMENT_DATE", response.retirementDate);
    console.log("Retirement initiated:", response.retirementId);
}
```

#### **5.2 Monitor Retirement Status**
**GET** `{{BASE_URL}}/api/retirement/{{RETIREMENT_ID}}`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response (Initially):**
```json
{
  "retirementId": "{{RETIREMENT_ID}}",
  "userId": "{{BUYER_USER_ID}}",
  "userUsername": "buyer_test_user",
  "amountRetiredKg": 25.0,
  "retirementDate": "2025-10-29",
  "status": "PENDING",
  "retiredCarbonCreditIds": ["{{PURCHASED_CREDIT_ID}}"],
  "createdAt": "2025-10-29T16:50:00Z",
  "certificate": {
    "id": "cert-uuid-789",
    "status": "PENDING_GENERATION",
    "certificateCode": "CERT-1730203800000-ABC12"
  }
}
```

**Wait 30-60 seconds, then check again for COMPLETED status**

---

### **STEP 6: Retrieve & Verify Certificate** 📄

#### **6.1 Check Completed Retirement**
**GET** `{{BASE_URL}}/api/retirement/{{RETIREMENT_ID}}`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response (After Processing):**
```json
{
  "retirementId": "{{RETIREMENT_ID}}",
  "userId": "{{BUYER_USER_ID}}",
  "userUsername": "buyer_test_user",
  "amountRetiredKg": 25.0,
  "retirementDate": "2025-10-29",
  "status": "COMPLETED",
  "retiredCarbonCreditIds": ["{{PURCHASED_CREDIT_ID}}"],
  "createdAt": "2025-10-29T16:50:00Z",
  "certificate": {
    "id": "cert-uuid-789",
    "certificateCode": "CERT-1730203800000-ABC12",
    "buyerId": "{{USER_ID}}",
    "buyerUsername": "John Doe",
    "buyerEmail": "buyer1@example.com",
    "retirementTransactionId": "{{RETIREMENT_ID}}",
    "amountRetiredKg": 25.0,
    "projectSourceInfo": "Tesla Model 3 (VIN123), Corporate Neutrality Project",
    "retirementDate": "2025-10-29",
    "status": "COMPLETED",
    "pdfUrl": "https://storage.googleapis.com/carbon-credit-marketplace-certs-2025/certificates/CERT-1730203800000-ABC12.pdf",
    "createdAt": "2025-10-29T16:50:15Z"
  }
}
```

**Test Scripts (Postman):**
```javascript
// Save certificate details for final verification
if (pm.response.code === 200) {
    const response = pm.response.json();
    if (response.certificate) {
        pm.environment.set("CERTIFICATE_ID", response.certificate.id);
        pm.environment.set("CERTIFICATE_CODE", response.certificate.certificateCode);
        pm.environment.set("PDF_URL", response.certificate.pdfUrl);
        console.log("Certificate generated:", response.certificate.certificateCode);
        console.log("PDF URL:", response.certificate.pdfUrl);
    }
}
```

#### **6.2 Get Certificate Directly**
**GET** `{{BASE_URL}}/api/retirement/{{RETIREMENT_ID}}/certificate`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "id": "{{CERTIFICATE_ID}}",
  "certificateCode": "{{CERTIFICATE_CODE}}",
  "buyerId": "{{BUYER_USER_ID}}",
  "buyerUsername": "John Doe",
  "buyerEmail": "buyer1@example.com",
  "retirementTransactionId": "{{RETIREMENT_ID}}",
  "amountRetiredKg": 25.0,
  "projectSourceInfo": "Tesla Model 3 (VIN123), Corporate Neutrality Project",
  "retirementDate": "2025-10-29",
  "status": "COMPLETED",
  "pdfUrl": "{{PDF_URL}}",
  "createdAt": "2025-10-29T16:50:15Z"
}
```

#### **6.3 View All My Certificates**
**GET** `{{BASE_URL}}/api/retirement/certificates/user/{{BUYER_USER_ID}}?page=0&size=10`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Query Parameters:**
- `page` (optional): 0
- `size` (optional): 10

**Expected Response:**
```json
{
  "content": [
    {
      "id": "{{CERTIFICATE_ID}}",
      "certificateCode": "{{CERTIFICATE_CODE}}",
      "buyerId": "{{BUYER_USER_ID}}",
      "buyerUsername": "John Doe",
      "buyerEmail": "buyer1@example.com",
      "retirementTransactionId": "{{RETIREMENT_ID}}",
      "amountRetiredKg": 25.50,
      "projectSourceInfo": "Tesla Model 3 (VIN123), Solar Installation Project",
      "retirementDate": "2025-10-29",
      "status": "COMPLETED",
      "pdfUrl": "{{PDF_URL}}",
      "createdAt": "2025-10-29T10:30:15Z"
    }
  ],
  "page": 0,
  "size": 10,
  "totalElements": 1,
  "totalPages": 1,
  "last": true
}
```

---

### **STEP 7: Final Verification** ✅

#### **7.1 Check Final Wallet State**
**GET** `{{BASE_URL}}/api/wallets/my-wallet`

**Headers:**
- `Authorization`: `Bearer {{BUYER_JWT_TOKEN}}`

**Expected Response:**
```json
{
  "userId": "{{BUYER_USER_ID}}",
  "cashBalance": 974.50,
  "creditBalance": 25.0,
  "lastUpdated": "2025-10-29T16:50:00Z"
}
```

**Verification Points:**
- ✅ Credit balance reduced by retirement amount (50.0 → 25.0)
- ✅ Cash balance unchanged from purchase
- ✅ Retirement amount matches certificate amount

#### **7.2 Check Credit Status After Retirement**
**GET** `{{BASE_URL}}/carbon-credits/{{PURCHASED_CREDIT_ID}}`

**Expected Response:**
```json
{
  "creditId": "{{PURCHASED_CREDIT_ID}}",
  "ownerId": "{{BUYER_USER_ID}}",
  "co2ReducedKg": 50.0,
  "status": "RETIRED",
  "projectInfo": "Tesla Model 3 EV Journey",
  "retiredAt": "2025-10-29T16:50:00Z",
  "retirementTransactionId": "{{RETIREMENT_ID}}"
}
```

---

## 🎯 **BUYER WORKFLOW CHECKLIST**

### **✅ Complete Success Criteria:**

#### **Account & Wallet:**
- [ ] BUYER account created and logged in
- [ ] Wallet funded with sufficient balance
- [ ] Balance verification working

#### **Credit Purchase:**
- [ ] Available credits browsed successfully
- [ ] Credit purchased and transaction completed
- [ ] Wallet balance updated correctly (cash decreased, credits increased)
- [ ] Credit ownership transferred to buyer

#### **Credit Retirement:**
- [ ] Retirement initiated successfully
- [ ] Retirement status progresses from PENDING → COMPLETED
- [ ] Credit status changes from VERIFIED → RETIRED
- [ ] Credit balance reduced by retirement amount

#### **Certificate Generation:**
- [ ] Certificate created with PENDING_GENERATION status
- [ ] Certificate status progresses to COMPLETED
- [ ] Certificate contains correct buyer information
- [ ] Certificate includes proper project information
- [ ] PDF URL generated (mock or real)
- [ ] Certificate retrievable via retirement ID
- [ ] Certificate appears in user's certificate list

### **📊 Expected Balance Changes:**
```
Initial State:
- Cash Balance: $0.00
- Credit Balance: 0.0 kg CO2

After Deposit ($1000):
- Cash Balance: $1000.00
- Credit Balance: 0.0 kg CO2

After Purchase (50kg @ $25.50):
- Cash Balance: $974.50
- Credit Balance: 50.0 kg CO2

After Retirement (25kg):
- Cash Balance: $974.50
- Credit Balance: 25.0 kg CO2
```

### **🕐 Timeline Expectations:**
- **Registration & Login:** Immediate
- **Wallet Deposit:** Immediate
- **Credit Purchase:** Immediate
- **Retirement Initiation:** Immediate
- **Certificate Generation:** 30-60 seconds (async)
- **PDF Generation:** 30-60 seconds (async)
