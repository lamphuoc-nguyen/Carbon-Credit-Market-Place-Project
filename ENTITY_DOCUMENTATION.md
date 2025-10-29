# Carbon Credit Marketplace - Entity Documentation

**Generated:** October 23, 2025  
**Total Entities:** 12

---

## 📋 Entity Overview

| Entity | Primary Key | Main Purpose |
|--------|-------------|--------------|
| User | UUID | Core user management and authentication |
| Vehicle | UUID | Electric vehicle registration |
| JourneyData | UUID | EV journey tracking and CO2 calculation |
| CarbonCredit | UUID | Generated carbon credits from journeys |
| CreditListing | UUID | Marketplace listings for carbon credits |
| Transaction | UUID | Credit purchase/sale transactions |
| Payment | UUID | Payment processing for transactions |
| Certificate | UUID | Ownership certificates for purchased credits |
| Wallet | UUID | User financial balances |
| Dispute | UUID | Transaction dispute management |
| AuditLog | UUID | Credit verification audit trail |
| Notification | UUID | User notification system |

---

## 🏗️ Detailed Entity Specifications

### 1. User Entity
**Table:** `users`  
**Purpose:** Core user management and authentication

**Fields:**
- `user_id` (UUID) - Primary key
- `username` (String, unique, 50 chars) - User login name
- `email` (String, unique, 100 chars) - Email address
- `password_hash` (String) - Encrypted password
- `password` (Transient) - Plain text password (not stored)
- `role` (UserRole Enum) - User role type
- `created_at` (LocalDateTime) - Account creation timestamp
- `updated_at` (LocalDateTime) - Last update timestamp
- `phone` (String, unique, 20 chars) - Phone number
- `full_name` (String, 100 chars) - Full display name

**Roles:**
- `EV_OWNER` - Electric vehicle owners who generate credits
- `BUYER` - Users who purchase carbon credits
- `CVA` - Carbon Verification Agents
- `ADMIN` - System administrators

**Relationships:**
- One-to-Many: `vehicles`, `carbonCredits`
- One-to-One: `wallet`

---

### 2. Vehicle Entity
**Table:** `vehicles`  
**Purpose:** Electric vehicle registration and management

**Fields:**
- `vehicle_id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to User
- `vin` (String, unique, 17 chars) - Vehicle Identification Number
- `model` (String, 50 chars) - Vehicle model
- `registration_date` (LocalDate) - Vehicle registration date
- `created_at` (LocalDateTime) - Record creation timestamp

**Relationships:**
- Many-to-One: `user`
- One-to-Many: `journeys`

---

### 3. JourneyData Entity
**Table:** `journey_data`  
**Purpose:** Track EV journeys and calculate CO2 reduction

**Fields:**
- `journey_id` (UUID) - Primary key
- `vehicle_id` (UUID) - Foreign key to Vehicle
- `user_id` (UUID) - Foreign key to User
- `distance_km` (BigDecimal, 10,2) - Journey distance
- `energy_consumed_kwh` (BigDecimal, 10,2) - Energy consumption
- `start_time` (LocalDateTime) - Journey start time
- `end_time` (LocalDateTime) - Journey end time
- `co2_reduced_kg` (BigDecimal, 10,2) - CO2 reduction achieved
- `created_at` (LocalDateTime) - Record creation timestamp
- `verification_status` (VerificationStatus) - CVA verification status
- `verified_by_id` (UUID) - CVA who verified the journey
- `verification_date` (LocalDateTime) - Verification timestamp
- `verification_notes` (String, 1000 chars) - CVA notes
- `rejection_reason` (String, 500 chars) - Rejection explanation

**Verification Status:**
- `PENDING_VERIFICATION` - Awaiting CVA review
- `UNDER_REVIEW` - Being reviewed by CVA
- `VERIFIED` - Approved by CVA
- `REJECTED` - Rejected by CVA
- `REQUIRES_MORE_INFO` - Needs additional information

**Relationships:**
- Many-to-One: `vehicle`, `user`, `verifiedBy`
- One-to-One: `carbonCredit`

---

### 4. CarbonCredit Entity
**Table:** `carbon_credits`  
**Purpose:** Generated carbon credits from verified journeys

**Fields:**
- `credit_id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to User (owner)
- `journey_id` (UUID) - Foreign key to JourneyData
- `co2_reduced_kg` (BigDecimal, 10,2) - CO2 reduction amount
- `credit_amount` (BigDecimal, 10,2) - Credit value generated
- `status` (CreditStatus) - Current credit status
- `created_at` (LocalDateTime) - Credit creation timestamp
- `verified_at` (LocalDateTime) - CVA verification timestamp
- `listed_at` (LocalDateTime) - Marketplace listing timestamp
- `verified_by_id` (UUID) - CVA who verified the credit

**Credit Status:**
- `PENDING` - Initial state, awaiting verification
- `VERIFIED` - CVA approved
- `LISTED` - Available for sale in marketplace
- `SOLD` - Purchased by a buyer
- `REJECTED` - CVA rejected

**Relationships:**
- Many-to-One: `user`, `verifiedBy`
- One-to-One: `journey`
- One-to-Many: `listings`, `auditLogs`

---

### 5. CreditListing Entity
**Table:** `credit_listings`  
**Purpose:** Marketplace listings for carbon credit sales

**Fields:**
- `listing_id` (UUID) - Primary key
- `credit_id` (UUID) - Foreign key to CarbonCredit
- `listing_type` (ListingType) - Fixed price or auction
- `price` (BigDecimal, 10,2) - Fixed price or starting bid
- `min_bid` (BigDecimal, 10,2) - Minimum bid for auctions
- `auction_end_time` (LocalDateTime) - Auction end time
- `status` (ListingStatus) - Current listing status
- `created_at` (LocalDateTime) - Listing creation timestamp
- `updated_at` (LocalDateTime) - Last update timestamp

**Listing Types:**
- `FIXED` - Fixed price sale
- `AUCTION` - Auction-based sale

**Listing Status:**
- `ACTIVE` - Available for purchase/bidding
- `CLOSED` - Sale completed
- `CANCELLED` - Cancelled by seller
- `PENDING_TRANSACTION` - Transaction in progress

**Relationships:**
- Many-to-One: `credit`
- One-to-Many: `transactions`

---

### 6. Transaction Entity
**Table:** `transactions`  
**Purpose:** Record carbon credit purchase/sale transactions

**Fields:**
- `transaction_id` (UUID) - Primary key
- `credit_id` (UUID) - Foreign key to CarbonCredit
- `listing_id` (UUID) - Foreign key to CreditListing
- `buyer_id` (UUID) - Foreign key to User (buyer)
- `seller_id` (UUID) - Foreign key to User (seller)
- `amount` (BigDecimal, 10,2) - Transaction amount
- `status` (TransactionStatus) - Current transaction status
- `created_at` (LocalDateTime) - Transaction creation timestamp
- `completed_at` (LocalDateTime) - Transaction completion timestamp

**Transaction Status:**
- `PENDING` - Transaction initiated
- `COMPLETED` - Successfully completed
- `CANCELLED` - Cancelled by user
- `DISPUTED` - Under dispute resolution

**Relationships:**
- Many-to-One: `credit`, `listing`, `buyer`, `seller`
- One-to-Many: `certificates`, `disputes`

---

### 7. Payment Entity
**Table:** `payments`  
**Purpose:** Handle payment processing for transactions

**Fields:**
- `payment_id` (UUID) - Primary key
- `transaction_id` (UUID) - Foreign key to Transaction
- `payer_id` (UUID) - Foreign key to User (payer)
- `payee_id` (UUID) - Foreign key to User (payee)
- `amount` (BigDecimal, 10,2) - Payment amount
- `payment_method` (PaymentMethod) - Payment method used
- `payment_status` (PaymentStatus) - Current payment status
- `payment_reference` (String, 50 chars) - External payment reference
- `created_at` (LocalDateTime) - Payment creation timestamp

**Payment Methods:**
- `CREDIT_CARD`, `DEBIT_CARD`, `BANK_TRANSFER`
- `PAYPAL`, `STRIPE`, `WALLET`
- `CRYPTOCURRENCY`, `OTHER`

**Payment Status:**
- `PENDING`, `PROCESSING`, `COMPLETED`
- `FAILED`, `CANCELLED`, `REFUNDED`, `DISPUTED`

**Relationships:**
- Many-to-One: `transaction`, `payer`, `payee`

---

### 8. Certificate Entity
**Table:** `certificates`  
**Purpose:** Issue ownership certificates for purchased credits

**Fields:**
- `certificate_id` (UUID) - Primary key
- `transaction_id` (UUID) - Foreign key to Transaction
- `buyer_id` (UUID) - Foreign key to User (certificate owner)
- `credit_id` (UUID) - Foreign key to CarbonCredit
- `issue_date` (LocalDateTime) - Certificate issue timestamp
- `co2_reduced_kg` (BigDecimal, 10,2) - CO2 reduction covered
- `certificate_code` (String, unique, 50 chars) - Unique certificate identifier

**Relationships:**
- Many-to-One: `transaction`, `buyer`, `credit`

---

### 9. Wallet Entity
**Table:** `wallets`  
**Purpose:** Manage user financial balances

**Fields:**
- `wallet_id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to User
- `credit_balance` (BigDecimal, 10,2) - Carbon credit balance
- `cash_balance` (BigDecimal, 10,2) - Cash/fiat currency balance
- `updated_at` (LocalDateTime) - Last update timestamp

**Relationships:**
- One-to-One: `user`

---

### 10. Dispute Entity
**Table:** `disputes`  
**Purpose:** Handle transaction disputes and resolutions

**Fields:**
- `dispute_id` (UUID) - Primary key
- `transaction_id` (UUID) - Foreign key to Transaction
- `raised_by_id` (UUID) - Foreign key to User who raised dispute
- `resolved_by_id` (UUID) - Foreign key to User who resolved dispute
- `reason` (TEXT) - Dispute reason description
- `status` (DisputeStatus) - Current dispute status
- `resolution` (TEXT) - Resolution description
- `created_at` (LocalDateTime) - Dispute creation timestamp
- `resolved_at` (LocalDateTime) - Resolution timestamp

**Dispute Status:**
- `OPEN` - Dispute raised, awaiting resolution
- `RESOLVED` - Resolved by admin/mediator
- `CLOSED` - Dispute closed

**Relationships:**
- Many-to-One: `transaction`, `raisedBy`, `resolvedBy`

---

### 11. AuditLog Entity
**Table:** `audit_logs`  
**Purpose:** Maintain audit trail for credit verification process

**Fields:**
- `audit_id` (UUID) - Primary key
- `credit_id` (UUID) - Foreign key to CarbonCredit
- `verifier_id` (UUID) - Foreign key to User (CVA)
- `action` (AuditAction) - Action performed
- `comments` (TEXT) - Verification comments
- `created_at` (LocalDateTime) - Action timestamp

**Audit Actions:**
- `SUBMITTED` - Credit submitted for verification
- `VERIFIED` - Credit verified by CVA
- `REJECTED` - Credit rejected by CVA

**Relationships:**
- Many-to-One: `credit`, `verifier`

---

### 12. Notification Entity
**Table:** `notifications`  
**Purpose:** System-wide user notification management

**Fields:**
- `notification_id` (UUID) - Primary key
- `user_id` (UUID) - Foreign key to User
- `notification_type` (NotificationType) - Type of notification
- `title` (String, 255 chars) - Notification title
- `message` (TEXT) - Notification message content
- `is_read` (Boolean) - Read status flag
- `created_at` (LocalDateTime) - Notification creation timestamp
- `related_entity_id` (UUID) - Related entity reference
- `related_entity_type` (EntityType) - Type of related entity

**Notification Types:**
- Transaction: `TRANSACTION_INITIATED`, `TRANSACTION_COMPLETED`, `TRANSACTION_FAILED`
- Payment: `PAYMENT_RECEIVED`, `PAYMENT_FAILED`
- Credit: `CREDIT_VERIFIED`, `CREDIT_REJECTED`, `CREDIT_LISTED`, `CREDIT_SOLD`
- Dispute: `DISPUTE_CREATED`, `DISPUTE_RESOLVED`
- Auction: `BID_RECEIVED`, `AUCTION_WON`, `AUCTION_LOST`
- System: `WALLET_UPDATED`, `CERTIFICATE_ISSUED`, `SECURITY_ALERT`

**Entity Types:**
- `TRANSACTION`, `PAYMENT`, `CREDIT`, `LISTING`, `DISPUTE`, `CERTIFICATE`

**Relationships:**
- Many-to-One: `user`

---

## 🔗 Entity Relationship Summary

### Core User Flow:
1. **User** registers and gets a **Wallet**
2. **User** registers their **Vehicle**
3. **Vehicle** generates **JourneyData** during trips
4. **JourneyData** is verified by CVA and becomes **CarbonCredit**
5. **CarbonCredit** is listed in **CreditListing**
6. **Buyer** creates **Transaction** to purchase credits
7. **Payment** is processed for the transaction
8. **Certificate** is issued to the buyer
9. **Notifications** keep users informed throughout

### Verification & Compliance:
- **AuditLog** tracks all verification activities
- **Dispute** handles transaction conflicts
- CVA role users verify journeys and credits

### Financial Management:
- **Wallet** manages user balances
- **Payment** handles transaction processing
- **Transaction** records all credit trades

---

## 📊 Database Statistics

- **Total Tables:** 12
- **Total Relationships:** 25+ foreign keys
- **Primary Keys:** All UUID-based
- **Audit Fields:** Created/Updated timestamps on most entities
- **Enums:** 8+ different enum types for status management
- **Text Fields:** Support for long descriptions and comments

---

**Last Updated:** October 23, 2025  
**Framework:** Spring Boot 3.5.6 + JPA/Hibernate  
**Database:** Microsoft SQL Server
