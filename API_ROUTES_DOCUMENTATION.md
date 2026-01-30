# API Routes Documentation

Complete documentation of all API routes with request and response bodies.

---

## Table of Contents

1. [Authentication Routes](#authentication-routes)
2. [Onboarding Routes](#onboarding-routes)
3. [Sorting Hat Routes](#sorting-hat-routes)
4. [Merch Routes](#merch-routes)
5. [Order Routes](#order-routes)
6. [Payment Routes](#payment-routes)
7. [Points Routes](#points-routes)
8. [Accommodation Routes](#accommodation-routes)
9. [Admin Routes](#admin-routes)
   - [Admin Authentication](#admin-authentication)
   - [Payment Management](#payment-management)
   - [Points Management](#points-management)
   - [Merch Management](#merch-management)
   - [Order Management](#order-management)
   - [Pass Distribution](#pass-distribution)
   - [Accommodation Management](#accommodation-management)
   - [QR Code Verification](#qr-code-verification)

---

## Authentication Routes

Base Path: `/api/parsec/v1/auth`

### 1. Initiate Google OAuth

**Endpoint:** `GET /auth/google`  
**Description:** Initiates Google OAuth authentication flow  
**Access:** Public  

**Request:**
```
No request body required
```

**Response:**
```
Redirects to Google OAuth consent screen
```

---

### 2. Handle Google OAuth Callback

**Endpoint:** `GET /auth/google/callback`  
**Description:** Handles Google OAuth callback and creates/updates user  
**Access:** Public  

**Request:**
```
Query Parameters:
- code: string (provided by Google)
```

**Response:**
```
Redirects to frontend with JWT token:
{frontendUrl}/signup/auth?token={jwt_token}

Sets HTTP-only cookie: jwt={token}
```

---

### 3. Logout

**Endpoint:** `POST /auth/logout`  
**Description:** Logs out the current user  
**Access:** Private (requires JWT)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 4. Get Current User

**Endpoint:** `GET /auth/me`  
**Description:** Get information about the currently logged-in user  
**Access:** Private (requires JWT)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "email": "user@example.com",
      "name": "John Doe",
      "avatar": "https://lh3.googleusercontent.com/...",
      "house": "Gryffindor",
      "points": 150,
      "isOnboardingComplete": true
    }
  }
}
```

---

## Onboarding Routes

Base Path: `/api/parsec/v1/onboarding`

### 1. Submit Onboarding

**Endpoint:** `POST /onboarding/submit`  
**Description:** Submit initial onboarding information  
**Access:** Private (requires JWT)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
{
  "college": "IIT Delhi",
  "batch": "2024",
  "gender": "male",
  "contactNumber": "9876543210",
  "aadharOrCollegeId": "123456789012",
  "merchSize": "L"
}
```

**Field Validations:**
- `gender`: Must be one of ["male", "female", "other"]
- `merchSize`: Must be one of ["XS", "S", "M", "L", "XL", "XXL", "XXXL"] (case-insensitive)
- All fields are required

**Response:**
```json
{
  "success": true,
  "message": "Onboarding information submitted successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "college": "IIT Delhi",
      "batch": "2024",
      "gender": "male",
      "contactNumber": "9876543210",
      "aadharOrCollegeId": "123456789012",
      "merchSize": "L"
    }
  }
}
```

---

### 2. Get Onboarding Status

**Endpoint:** `GET /onboarding/status`  
**Description:** Check if onboarding is complete  
**Access:** Private (requires JWT)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isOnboardingComplete": true,
    "onboardingData": {
      "college": "IIT Delhi",
      "batch": "2024",
      "gender": "male",
      "contactNumber": "9876543210",
      "aadharOrCollegeId": "123456789012",
      "merchSize": "L"
    }
  }
}
```

---

### 3. Update Onboarding

**Endpoint:** `PATCH /onboarding/update`  
**Description:** Update onboarding information (partial update allowed)  
**Access:** Private (requires JWT)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
{
  "college": "IIT Bombay",
  "contactNumber": "9876543211"
}
```

**Note:** Only provide fields you want to update. At least one field is required.

**Response:**
```json
{
  "success": true,
  "message": "Onboarding information updated successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "college": "IIT Bombay",
      "batch": "2024",
      "gender": "male",
      "contactNumber": "9876543211",
      "aadharOrCollegeId": "123456789012",
      "merchSize": "L"
    }
  }
}
```

---

## Sorting Hat Routes

Base Path: `/api/parsec/v1/sorting-hat`

### 1. Get House Statistics (Public)

**Endpoint:** `GET /sorting-hat/stats`  
**Description:** Get house leaderboard with counts and points  
**Access:** Public  

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 400,
    "totalPoints": 5000,
    "houses": [
      {
        "rank": 1,
        "name": "Gryffindor",
        "count": 105,
        "points": 1500,
        "percentage": "26.25"
      },
      {
        "rank": 2,
        "name": "Ravenclaw",
        "count": 100,
        "points": 1400,
        "percentage": "25.00"
      },
      {
        "rank": 3,
        "name": "Hufflepuff",
        "count": 98,
        "points": 1100,
        "percentage": "24.50"
      },
      {
        "rank": 4,
        "name": "Slytherin",
        "count": 97,
        "points": 1000,
        "percentage": "24.25"
      }
    ]
  }
}
```

---

### 2. Get My House

**Endpoint:** `GET /sorting-hat/my-house`  
**Description:** Get current user's house information  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response (User has house):**
```json
{
  "success": true,
  "data": {
    "house": {
      "name": "Gryffindor",
      "count": 105,
      "points": 1500
    }
  }
}
```

**Response (User not sorted yet):**
```json
{
  "success": false,
  "message": "You have not been sorted yet. Complete onboarding first."
}
```

---

### 3. Sort User into House

**Endpoint:** `POST /sorting-hat/sort`  
**Description:** Assign user to a house (can only be done once)  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Congratulations! You have been sorted into Gryffindor!",
  "data": {
    "house": "Gryffindor",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com",
      "house": "Gryffindor"
    }
  }
}
```

**Response (Already sorted):**
```json
{
  "success": false,
  "message": "User has already been sorted",
  "data": {
    "house": "Gryffindor"
  }
}
```

---

## Merch Routes

Base Path: `/api/parsec/v1/merch`

### 1. Get All Merch

**Endpoint:** `GET /merch`  
**Description:** Get all merchandise items  
**Access:** Public  

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "success": true,
  "results": 5,
  "data": {
    "merch": [
      {
        "_id": "6960e073d4b548636f622990",
        "type": "event-pass1",
        "name": "Event Pass - Day 1",
        "description": "Access to all Day 1 events",
        "price": 1500,
        "stockQuantity": 50
      },
      {
        "_id": "6960e073d4b548636f622991",
        "type": "event-pass2",
        "name": "Cultural Night Pass",
        "description": "Access to Cultural Night",
        "price": 500,
        "stockQuantity": 100
      },
      {
        "_id": "6960e073d4b548636f622992",
        "type": "wearable",
        "name": "Parsec T-Shirt",
        "description": "Official Parsec merchandise",
        "sizesAvailable": ["S", "M", "L", "XL"],
        "price": 400,
        "stockQuantity": 200
      },
      {
        "_id": "6960e073d4b548636f622993",
        "type": "non-wearable",
        "name": "Parsec Mug",
        "description": "Ceramic mug with Parsec logo",
        "price": 250,
        "stockQuantity": 150
      }
    ]
  }
}
```

---

### 2. Get Merch by ID

**Endpoint:** `GET /merch/:id`  
**Description:** Get specific merchandise item by ID  
**Access:** Public  

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "success": true,
  "data": {
    "merch": {
      "_id": "6960e073d4b548636f622992",
      "type": "wearable",
      "name": "Parsec T-Shirt",
      "description": "Official Parsec merchandise",
      "sizesAvailable": ["S", "M", "L", "XL"],
      "price": 400,
      "stockQuantity": 200
    }
  }
}
```

---

## Order Routes

Base Path: `/api/parsec/v1/orders`

### 1. Create Order

**Endpoint:** `POST /orders`  
**Description:** Create a new merchandise order  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
{
  "items": [
    {
      "merchId": "6960e073d4b548636f622992",
      "quantity": 2,
      "size": "L"
    },
    {
      "merchId": "6960e073d4b548636f622993",
      "quantity": 1
    }
  ],
  "shippingAddress": "123 Main St, City, State 12345"
}
```

**Note:** 
- `size` is required only for wearable items
- Maximum 3 `event-pass1` items per user
- Maximum 2 `event-pass2` items per user

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439012",
      "userId": "507f1f77bcf86cd799439011",
      "userName": "John Doe",
      "items": [
        {
          "merchId": "6960e073d4b548636f622992",
          "name": "Parsec T-Shirt",
          "size": "L",
          "quantity": 2,
          "pricePerItem": 400
        },
        {
          "merchId": "6960e073d4b548636f622993",
          "name": "Parsec Mug",
          "size": "N/A",
          "quantity": 1,
          "pricePerItem": 250
        }
      ],
      "totalAmount": 1050,
      "shippingAddress": "123 Main St, City, State 12345",
      "paymentMade": "unpaid",
      "orderStatus": "pending",
      "paymentVerificationStatus": "pending",
      "gender": "male",
      "createdAt": "2026-01-31T10:30:00.000Z"
    }
  }
}
```

---

### 2. Get My Orders

**Endpoint:** `GET /orders/me`  
**Description:** Get order history for logged-in user  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "orders": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439011",
        "userName": "John Doe",
        "items": [
          {
            "merchId": "6960e073d4b548636f622992",
            "name": "Parsec T-Shirt",
            "size": "L",
            "quantity": 2,
            "pricePerItem": 400
          }
        ],
        "totalAmount": 800,
        "shippingAddress": "123 Main St, City, State 12345",
        "paymentMade": "paid",
        "orderStatus": "confirmed",
        "paymentVerificationStatus": "Verified",
        "gender": "male",
        "createdAt": "2026-01-30T10:30:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439013",
        "userId": "507f1f77bcf86cd799439011",
        "userName": "John Doe",
        "items": [
          {
            "merchId": "6960e073d4b548636f622993",
            "name": "Parsec Mug",
            "size": "N/A",
            "quantity": 1,
            "pricePerItem": 250
          }
        ],
        "totalAmount": 250,
        "shippingAddress": null,
        "paymentMade": "unpaid",
        "orderStatus": "pending",
        "paymentVerificationStatus": "pending",
        "gender": "male",
        "createdAt": "2026-01-31T10:30:00.000Z"
      }
    ]
  }
}
```

---

## Payment Routes

Base Path: `/api/parsec/v1/payments`

### 1. Record Payment

**Endpoint:** `POST /payments`  
**Description:** Submit payment proof for an order or accommodation booking  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}",
  "Content-Type": "multipart/form-data"
}
```

**Request (Form Data):**
```
amount: 1050
paymentUTR: "UTR123456789012"
orderId: "507f1f77bcf86cd799439012"
screenshot: <file>
```

**OR (for accommodation booking):**
```
amount: 2100
paymentUTR: "UTR123456789013"
bookingId: "507f1f77bcf86cd799439014"
screenshot: <file>
```

**Note:** 
- Provide either `orderId` OR `bookingId`, not both
- `screenshot` is a required file upload (image)

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439011",
      "referenceType": "event-pass1",
      "referenceId": "507f1f77bcf86cd799439012",
      "amount": 1050,
      "paymentUTR": "UTR123456789012",
      "paymentScreenshot": "https://res.cloudinary.com/.../screenshot.jpg",
      "status": "pending",
      "createdAt": "2026-01-31T10:35:00.000Z"
    }
  }
}
```

---

### 2. Get My Payment History

**Endpoint:** `GET /payments/me`  
**Description:** Get payment history for logged-in user  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "paymentHistory": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "userId": "507f1f77bcf86cd799439011",
        "referenceType": "event-pass1",
        "referenceId": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "user@example.com",
        "contactNumber": "9876543210",
        "amount": 1050,
        "paymentUTR": "UTR123456789012",
        "paymentScreenshot": "https://res.cloudinary.com/.../screenshot.jpg",
        "status": "verified",
        "verifiedAt": "2026-01-31T11:00:00.000Z",
        "createdAt": "2026-01-31T10:35:00.000Z"
      }
    ]
  }
}
```

---

## Points Routes

Base Path: `/api/parsec/v1/points`

### 1. Get My Points

**Endpoint:** `GET /points`  
**Description:** Get current user's points  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "points": 150
  }
}
```

---

## Accommodation Routes

Base Path: `/api/parsec/v1/accommodation`

### 1. Create Accommodation Booking

**Endpoint:** `POST /accommodation`  
**Description:** Book accommodation for specified dates  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
{
  "checkInDate": "2026-02-15",
  "checkOutDate": "2026-02-18"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "_id": "507f1f77bcf86cd799439014",
      "userId": "507f1f77bcf86cd799439011",
      "userName": "John Doe",
      "checkInDate": "2026-02-15T00:00:00.000Z",
      "checkOutDate": "2026-02-18T00:00:00.000Z",
      "gender": "male",
      "numberOfNights": 3,
      "totalPrice": 2100,
      "status": "pending",
      "paymentStatus": "unpaid",
      "paymentVerificationStatus": "pending",
      "createdAt": "2026-01-31T10:40:00.000Z"
    }
  }
}
```

**Note:** Price is ₹700 per night

---

### 2. Get My Accommodation Bookings

**Endpoint:** `GET /accommodation`  
**Description:** Get all accommodation bookings for current user  
**Access:** Private (requires JWT + onboarding)  

**Headers:**
```json
{
  "Authorization": "Bearer {jwt_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "results": 1,
  "data": {
    "bookings": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "userId": "507f1f77bcf86cd799439011",
        "userName": "John Doe",
        "checkInDate": "2026-02-15T00:00:00.000Z",
        "checkOutDate": "2026-02-18T00:00:00.000Z",
        "gender": "male",
        "numberOfNights": 3,
        "totalPrice": 2100,
        "status": "confirmed",
        "paymentStatus": "paid",
        "paymentVerificationStatus": "Verified",
        "createdAt": "2026-01-31T10:40:00.000Z"
      }
    ]
  }
}
```

---

## Admin Routes

Base Path: `/api/parsec/v1/paneermoms`

All admin routes (except login) require admin token in headers:
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

---

## Admin Authentication

### 1. Admin Login

**Endpoint:** `POST /paneermoms/login`  
**Description:** Authenticate admin and receive token  
**Access:** Public  

**Request:**
```json
{
  "adminKey": "your-secret-admin-key"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "Admin authenticated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Response (Invalid Key):**
```json
{
  "status": "error",
  "message": "Invalid Admin Key"
}
```

**Note:** Token expires in 1 hour

---

## Payment Management

### 1. Get All Payment Histories

**Endpoint:** `GET /paneermoms/payments`  
**Description:** Get all payment records (admin only)  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "paymentHistories": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "userId": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "John Doe",
          "email": "user@example.com",
          "contactNumber": "9876543210"
        },
        "referenceType": "event-pass1",
        "referenceId": "507f1f77bcf86cd799439012",
        "amount": 1050,
        "paymentUTR": "UTR123456789012",
        "paymentScreenshot": "https://res.cloudinary.com/.../screenshot.jpg",
        "status": "pending",
        "createdAt": "2026-01-31T10:35:00.000Z"
      }
    ]
  }
}
```

---

### 2. Verify Payment

**Endpoint:** `PATCH /paneermoms/payments/:id/verify`  
**Description:** Verify a payment and process order/booking  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439011",
      "referenceType": "event-pass1",
      "referenceId": "507f1f77bcf86cd799439012",
      "amount": 1050,
      "paymentUTR": "UTR123456789012",
      "status": "verified",
      "verifiedAt": "2026-01-31T11:00:00.000Z"
    }
  }
}
```

**Note:** 
- Sends confirmation email to user
- For event passes, generates QR codes and sends them via email
- Updates order/booking status to "confirmed"

---

### 3. Reject Payment

**Endpoint:** `PATCH /paneermoms/payments/:id/reject`  
**Description:** Reject a payment and restore inventory/availability  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439011",
      "referenceType": "event-pass1",
      "referenceId": "507f1f77bcf86cd799439012",
      "amount": 1050,
      "paymentUTR": "UTR123456789012",
      "status": "rejected"
    }
  }
}
```

**Note:** 
- Sends rejection email to user
- Restores merchandise stock or accommodation availability
- Updates order/booking status to "Rejected"

---

### 4. Get Payment Statistics

**Endpoint:** `GET /paneermoms/payments/stats`  
**Description:** Get payment statistics summary  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalPayments": 250,
    "verifiedPayments": 180,
    "rejectedPayments": 20,
    "pendingPayments": 50
  }
}
```

---

## Points Management

### 1. Add Points

**Endpoint:** `POST /paneermoms/points/add`  
**Description:** Add points to a user and their house  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "email": "user@example.com",
  "pointsToAdd": 50
}
```

**Response:**
```json
{
  "status": "success",
  "message": "50 points added successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "points": 200,
      "house": "Gryffindor"
    },
    "house": {
      "name": "Gryffindor",
      "totalPoints": 1550
    }
  }
}
```

---

### 2. Subtract Points

**Endpoint:** `POST /paneermoms/points/subtract`  
**Description:** Subtract points from a user and their house  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "email": "user@example.com",
  "pointsToSubtract": 30
}
```

**Response:**
```json
{
  "status": "success",
  "message": "30 points subtracted successfully",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "points": 170,
      "house": "Gryffindor"
    },
    "house": {
      "name": "Gryffindor",
      "totalPoints": 1520
    }
  }
}
```

**Note:** Cannot subtract more points than user currently has

---

## Merch Management

### 1. Add Merch Item

**Endpoint:** `POST /paneermoms/merch`  
**Description:** Add a new merchandise item  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request (Wearable):**
```json
{
  "type": "wearable",
  "name": "Parsec Hoodie",
  "description": "Premium quality hoodie",
  "sizesAvailable": ["S", "M", "L", "XL", "XXL"],
  "price": 800,
  "stock": 100
}
```

**Request (Non-Wearable):**
```json
{
  "type": "non-wearable",
  "name": "Parsec Notebook",
  "description": "200-page notebook",
  "price": 150,
  "stock": 200
}
```

**Note:** 
- `type` values: ["wearable", "non-wearable", "event-pass1", "event-pass2"]
- `sizesAvailable` is required only for "wearable" type

**Response:**
```json
{
  "success": true,
  "message": "Merch item added successfully",
  "data": {
    "merch": {
      "_id": "507f1f77bcf86cd799439020",
      "type": "wearable",
      "name": "Parsec Hoodie",
      "description": "Premium quality hoodie",
      "sizesAvailable": ["S", "M", "L", "XL", "XXL"],
      "price": 800,
      "stockQuantity": 100
    }
  }
}
```

---

### 2. Update Merch Stock

**Endpoint:** `PATCH /paneermoms/merch/:id/stock`  
**Description:** Update merchandise item details  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "stock": 150,
  "price": 750
}
```

**Note:** Can update any combination of: type, name, description, sizesAvailable, price, stock

**Response:**
```json
{
  "success": true,
  "message": "Merch item updated successfully",
  "data": {
    "merch": {
      "_id": "507f1f77bcf86cd799439020",
      "type": "wearable",
      "name": "Parsec Hoodie",
      "description": "Premium quality hoodie",
      "sizesAvailable": ["S", "M", "L", "XL", "XXL"],
      "price": 750,
      "stockQuantity": 150
    }
  }
}
```

---

### 3. Delete Merch Item

**Endpoint:** `DELETE /paneermoms/merch/:id`  
**Description:** Delete a merchandise item  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "success": true,
  "message": "Merch item deleted successfully"
}
```

---

## Order Management

### 1. Bulk Update Orders with Gender

**Endpoint:** `PATCH /paneermoms/orders/bulk/update-gender`  
**Description:** Bulk update all orders with gender from user data  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
No request body required
```

**Response:**
```json
{
  "status": "success",
  "message": "Successfully updated gender for orders",
  "data": {
    "updatedCount": 150
  }
}
```

---

## Pass Distribution

### 1. Give Free Opening Ceremony Pass

**Endpoint:** `POST /paneermoms/give-pass`  
**Description:** Issue free opening ceremony pass to a user  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Free pass issued successfully",
  "data": {
    "orderId": "507f1f77bcf86cd799439025",
    "orderIdShort": "439025 -FreePass",
    "userName": "John Doe",
    "email": "user@example.com",
    "passType": "event-pass2"
  }
}
```

**Note:** 
- Creates a verified order with opening ceremony pass
- Generates QR code
- Sends confirmation email with QR code

---

### 2. Give Accommodation Cultural Event Pass

**Endpoint:** `POST /paneermoms/give-accommodation-pass`  
**Description:** Issue complementary cultural event pass to accommodation users  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Accommodation cultural event pass issued successfully",
  "data": {
    "orderId": "507f1f77bcf86cd799439026",
    "orderIdShort": "439026 -AccommodationPass",
    "userName": "John Doe",
    "email": "user@example.com",
    "passType": "event-pass2"
  }
}
```

**Note:** 
- Requires user to have confirmed accommodation booking
- Creates a verified order with cultural event pass (₹0)
- Generates QR code
- Sends confirmation email with QR code

---

### 3. Get Accommodation Booking Emails

**Endpoint:** `GET /paneermoms/accommodation-booking-emails`  
**Description:** Get emails of users with accommodation bookings in date range  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```
Query Parameters:
- startDate: "2026-02-15" or "15"
- endDate: "2026-02-18" or "18"
```

**Response:**
```json
{
  "status": "success",
  "message": "Found 25 users with accommodation bookings in the specified date range",
  "count": 25,
  "data": [
    {
      "email": "user1@example.com",
      "userName": "John Doe",
      "checkInDate": "2026-02-15T00:00:00.000Z",
      "checkOutDate": "2026-02-18T00:00:00.000Z"
    },
    {
      "email": "user2@example.com",
      "userName": "Jane Smith",
      "checkInDate": "2026-02-16T00:00:00.000Z",
      "checkOutDate": "2026-02-19T00:00:00.000Z"
    }
  ]
}
```

**Note:** Accepts either day numbers (15) or full dates (2026-02-15)

---

## Accommodation Management

### 1. Create Accommodation Availability

**Endpoint:** `POST /paneermoms/accommodation`  
**Description:** Create availability for a specific date  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "date": "2026-02-15",
  "mensAvailability": 50,
  "womensAvailability": 30
}
```

**Response:**
```json
{
  "success": true,
  "message": "Accommodation availability created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "date": "2026-02-15T00:00:00.000Z",
    "mensAvailability": 50,
    "womensAvailability": 30
  }
}
```

---

### 2. Modify Accommodation Availability

**Endpoint:** `PATCH /paneermoms/accommodation`  
**Description:** Update availability for an existing date  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "date": "2026-02-15",
  "mensAvailability": 45,
  "womensAvailability": 35
}
```

**Response:**
```json
{
  "success": true,
  "message": "Accommodation availability modified successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439030",
    "date": "2026-02-15T00:00:00.000Z",
    "mensAvailability": 45,
    "womensAvailability": 35
  }
}
```

---

## QR Code Verification

### 1. Verify Event Pass QR

**Endpoint:** `POST /paneermoms/qr/verify`  
**Description:** Verify QR code at event venue and mark as used  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "qrData": "{\"orderId\":\"507f1f77bcf86cd799439012\",\"attendeeName\":\"John Doe\",\"attendeeEmail\":\"user@example.com\",\"passType\":\"event-pass1\",\"passPrice\":1500,\"collegeName\":\"IIT Delhi\",\"gender\":\"male\"}"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "message": "QR code verified successfully",
  "data": {
    "attendeeName": "John Doe",
    "attendeeEmail": "user@example.com",
    "passType": "event-pass1",
    "collegeName": "IIT Delhi",
    "verifiedAt": "2026-02-15T18:30:00.000Z"
  }
}
```

**Response (Already Used):**
```json
{
  "status": "fail",
  "message": "QR code has already been used",
  "usedAt": "2026-02-15T18:25:00.000Z"
}
```

---

### 2. Get QR Status

**Endpoint:** `POST /paneermoms/qr/get`  
**Description:** Get QR record and check if it's been used  
**Access:** Private (requires admin token)  

**Headers:**
```json
{
  "Authorization": "Bearer {admin_token}"
}
```

**Request:**
```json
{
  "qrData": "{\"orderId\":\"507f1f77bcf86cd799439012\",\"attendeeName\":\"John Doe\",\"attendeeEmail\":\"user@example.com\",\"passType\":\"event-pass1\",\"passPrice\":1500,\"collegeName\":\"IIT Delhi\",\"gender\":\"male\"}"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "attendeeName": "John Doe",
    "attendeeEmail": "user@example.com",
    "passType": "event-pass1",
    "collegeName": "IIT Delhi",
    "isUsed": true,
    "usedAt": "2026-02-15T18:25:00.000Z",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "user@example.com"
    }
  }
}
```

---

## Error Responses

All endpoints return error responses in the following format:

**Validation Error (400):**
```json
{
  "status": "error",
  "message": "All onboarding fields are required."
}
```

**Authentication Error (401):**
```json
{
  "status": "error",
  "message": "You are not logged in. Please log in to get access."
}
```

**Authorization Error (403):**
```json
{
  "status": "error",
  "message": "You do not have permission to perform this action."
}
```

**Not Found Error (404):**
```json
{
  "status": "error",
  "message": "User not found"
}
```

**Server Error (500):**
```json
{
  "status": "error",
  "message": "Something went wrong. Please try again later."
}
```

---

## Notes

### Authentication
- JWT tokens are provided via Google OAuth
- Tokens are stored in HTTP-only cookies and can also be sent via Authorization header
- Token format: `Bearer {token}`
- Admin tokens expire after 1 hour
- User tokens expiry is configured via JWT_EXPIRES_IN environment variable

### Middleware Requirements
- `protect`: Requires valid JWT token
- `requireOnboarding`: Requires completed onboarding (college, batch, gender, contactNumber, aadharOrCollegeId, merchSize)
- `verifyAdminToken`: Requires valid admin JWT token

### Payment Flow
1. User creates order/booking
2. User submits payment with screenshot
3. Admin verifies or rejects payment
4. If verified: order/booking confirmed, QR codes generated (for event passes), email sent
5. If rejected: inventory/availability restored, email sent

### Event Pass Limits
- Maximum 3 `event-pass1` per user (cumulative across all orders)
- Maximum 2 `event-pass2` per user (cumulative across all orders)

### Accommodation Pricing
- ₹700 per night
- Separate availability tracking for men and women
- Atomic transactions to prevent double-booking

### House Sorting Algorithm
- Deterministic score (1-10) generated per house per user
- Weighted probability based on scores and current house counts
- Each user can only be sorted once
- Sorting requires completed onboarding

---
