# Parsec Backend API Documentation

**Base URL:** `http://localhost:3000/api/parsec/v1`  
**Production URL:** `https://parsec-6-0.vercel.app/api/parsec/v1`

---

## Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Onboarding Routes](#onboarding-routes)
3. [Sorting Hat Routes](#sorting-hat-routes)
4. [Merch Routes](#merch-routes)
5. [Order Routes](#order-routes)
6. [Payment Routes](#payment-routes)
7. [Accommodation Routes](#accommodation-routes)
8. [Points Routes](#points-routes)
9. [Admin Routes](#admin-routes)
10. [Complete Workflows](#complete-workflows)

---

## Authentication Routes
**Base:** `/auth`

### 1. Register User
**POST** `/auth/register`  
**Access:** Public

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "contactNumber": "9876543210"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "67a1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "contactNumber": "9876543210",
      "onboardingComplete": false,
      "createdAt": "2026-01-04T..."
    }
  }
}
```

### 2. Login User
**POST** `/auth/login`  
**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "user": {
      "_id": "67a1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "onboardingComplete": true,
      "house": "Gryffindor"
    }
  }
}
```

## Onboarding Routes
**Base:** `/onboarding`  
**Auth Required:** JWT Token

### Complete User Onboarding
**POST** `/onboarding`  
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "collegeName": "IIT Dharwad",
  "year": "2",
  "branch": "Computer Science",
  "gender": "male",
  "dateOfBirth": "2004-05-15"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "_id": "67a1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "collegeName": "IIT Dharwad",
      "year": 2,
      "branch": "Computer Science",
      "gender": "male",
      "dateOfBirth": "2004-05-15",
      "onboardingComplete": true
    }
  }
}
```

---

## Sorting Hat Routes
**Base:** `/sorting-hat`

### 1. Get House Stats
**GET** `/sorting-hat/stats`  
**Access:** Public

**Response:**
```json
{
  "status": "success",
  "data": {
    "houses": [
      {
        "name": "Gryffindor",
        "memberCount": 45,
        "totalPoints": 1250
      },
      {
        "name": "Slytherin",
        "memberCount": 42,
        "totalPoints": 1180
      }
    ]
  }
}
```

### 2. Sort User into House
**POST** `/sorting-hat/sort`  
**Auth Required:** JWT + Onboarding Complete

**Request Body:**
```json
{
  "answers": [1, 3, 2, 4, 1]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "house": "Gryffindor",
    "message": "You have been sorted into Gryffindor!"
  }
}
```

---

## Merch Routes
**Base:** `/merch`

### 1. Get All Merch Items
**GET** `/merch`  
**Access:** Public

**Response:**
```json
{
  "status": "success",
  "results": 4,
  "data": {
    "merch": [
      {
        "_id": "67a1111111111111111111",
        "type": "wearable",
        "name": "Parsec T-Shirt",
        "description": "Official Parsec event t-shirt",
        "price": 499,
        "stockQuantity": 100,
        "sizesAvailable": ["S", "M", "L", "XL"]
      },
      {
        "_id": "67a2222222222222222222",
        "type": "event-pass1",
        "name": "Event Pass - Day 1",
        "description": "Access to Day 1 events",
        "price": 299,
        "stockQuantity": 500
      }
    ]
  }
}
```

### 2. Get Merch by ID
**GET** `/merch/:id`  
**Access:** Public

**Response:**
```json
{
  "status": "success",
  "data": {
    "merch": {
      "_id": "67a1111111111111111111",
      "type": "wearable",
      "name": "Parsec T-Shirt",
      "description": "Official Parsec event t-shirt",
      "price": 499,
      "stockQuantity": 100,
      "sizesAvailable": ["S", "M", "L", "XL"]
    }
  }
}
```

---

## Order Routes
**Base:** `/orders`  
**Auth Required:** JWT + Onboarding Complete

### 1. Create Order
**POST** `/orders`

**Request Body:**
```json
{
  "items": [
    {
      "merchId": "67a1111111111111111111",
      "quantity": 2,
      "size": "M"
    },
    {
      "merchId": "67a2222222222222222222",
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "_id": "67a3333333333333333333",
      "userId": "67a1234567890abcdef12345",
      "items": [
        {
          "merchId": "67a1111111111111111111",
          "name": "Parsec T-Shirt",
          "quantity": 2,
          "size": "M",
          "pricePerItem": 499
        },
        {
          "merchId": "67a2222222222222222222",
          "name": "Event Pass - Day 1",
          "quantity": 1,
          "pricePerItem": 299
        }
      ],
      "totalAmount": 1297,
      "orderStatus": "pending",
      "paymentStatus": "unpaid",
      "createdAt": "2026-01-04T..."
    }
  }
}
```

### 2. Get User's Orders
**GET** `/orders/me`

**Response:**
```json
{
  "status": "success",
  "results": 2,
  "data": {
    "orders": [
      {
        "_id": "67a3333333333333333333",
        "totalAmount": 1297,
        "orderStatus": "pending",
        "paymentStatus": "unpaid",
        "createdAt": "2026-01-04T..."
      }
    ]
  }
}
```

### 3. Get Order by ID
**GET** `/orders/:id`

**Response:**
```json
{
  "status": "success",
  "data": {
    "order": {
      "_id": "67a3333333333333333333",
      "userId": "67a1234567890abcdef12345",
      "items": [...],
      "totalAmount": 1297,
      "orderStatus": "pending",
      "paymentStatus": "unpaid"
    }
  }
}
```

---

## Payment Routes
**Base:** `/payments`  
**Auth Required:** JWT + Onboarding Complete

### 1. Record Payment (Merch or Accommodation)
**POST** `/payments`  
**Content-Type:** `multipart/form-data`

**Form Data Fields:**

**For Merch Order:**
```
orderId: "67a3333333333333333333"
amount: 1297
paymentUTR: "UTR202601041234567890"
paymentScreenshot: <file> (optional - JPG/PNG, max 5MB)
```

**For Accommodation Booking:**
```
bookingId: "67a4444444444444444444"
amount: 1400
paymentUTR: "UTR202601041234567891"
paymentScreenshot: <file> (optional - JPG/PNG, max 5MB)
```

**Example using JavaScript/Fetch:**
```javascript
const formData = new FormData();
formData.append('orderId', '67a3333333333333333333');
formData.append('amount', '1297');
formData.append('paymentUTR', 'UTR202601041234567890');
formData.append('paymentScreenshot', fileInput.files[0]); // optional

fetch('/api/parsec/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Payment Screenshot Requirements:**
- **Formats:** JPG, PNG only
- **Max Size:** 5MB
- **Optional:** Payment can be recorded without screenshot
- **Storage:** Images automatically uploaded to Cloudinary and optimized (max 1000x1000px)
- **Cleanup:** Files automatically deleted if validation fails

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "_id": "67a5555555555555555555",
      "userId": "67a1234567890abcdef12345",
      "referenceType": "event-pass1",
      "referenceId": "67a3333333333333333333",
      "amount": 1297,
      "paymentUTR": "UTR202601041234567890",
      "paymentScreenshot": "https://res.cloudinary.com/.../payment-screenshots/...",
      "status": "pending",
      "createdAt": "2026-01-04T..."
    }
  }
}
```

**Error Responses:**

Invalid Order/Booking ID:
```json
{
  "status": "fail",
  "message": "Invalid Order ID provided. Please check and try again."
}
```

Duplicate Payment:
```json
{
  "status": "fail",
  "message": "Payment for this order has already been recorded."
}
```

Duplicate UTR:
```json
{
  "status": "fail",
  "message": "This payment UTR has already been used. Please check if payment was already recorded."
}
```

Invalid File Type:
```json
{
  "status": "fail",
  "message": "Invalid file type. Only JPEG and PNG files are allowed."
}
```

File Too Large:
```json
{
  "status": "fail",
  "message": "File size exceeds 5MB limit."
}
```

### 2. Get User's Payment History
**GET** `/payments/me`

**Response:**
```json
{
  "status": "success",
  "data": {
    "paymentHistory": [
      {
        "_id": "67a5555555555555555555",
        "referenceType": "event-pass1",
        "amount": 1297,
        "paymentUTR": "UTR202601041234567890",
        "paymentScreenshot": "https://res.cloudinary.com/.../payment-screenshots/...",
        "status": "pending",
        "createdAt": "2026-01-04T..."
      }
    ]
  }
}
```

---

## Accommodation Routes
**Base:** `/accommodation`  
**Auth Required:** JWT + Onboarding Complete

### Create Accommodation Booking
**POST** `/accommodation`

**Note:** Gender is automatically fetched from the user's onboarding profile. Users can create multiple bookings even if they have active bookings.

**Request Body:**
```json
{
  "checkInDate": "2026-01-25",
  "checkOutDate": "2026-01-27"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "booking": {
      "_id": "67a4444444444444444444",
      "userId": "67a1234567890abcdef12345",
      "checkInDate": "2026-01-25T00:00:00.000Z",
      "checkOutDate": "2026-01-27T00:00:00.000Z",
      "gender": "male",
      "numberOfNights": 2,
      "totalPrice": 1400,
      "status": "pending",
      "paymentStatus": "unpaid",
      "createdAt": "2026-01-04T..."
    }
  }
}
```

---

## Points Routes
**Base:** `/points`  
**Auth Required:** JWT + Onboarding Complete

### 1. Get User Points
**GET** `/points/me`

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "name": "John Doe",
      "house": "Gryffindor",
      "points": 150
    }
  }
}
```

### 2. Get House Leaderboard
**GET** `/points/leaderboard`

**Response:**
```json
{
  "status": "success",
  "data": {
    "houses": [
      {
        "name": "Gryffindor",
        "totalPoints": 1250,
        "memberCount": 45
      },
      {
        "name": "Slytherin",
        "totalPoints": 1180,
        "memberCount": 42
      }
    ]
  }
}
```

---

## Admin Routes
**Base:** `/paneermoms`  
**Auth Required:** Admin Token (`x-admin-token` header)

### 1. Admin Login
**POST** `/paneermoms/login`  
**Access:** Public

**Request Body:**
```json
{
  "adminKey": "your-secret-admin-key"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Admin login successful"
}
```

---

### Payment Management

#### 1. Get All Payments
**GET** `/paneermoms/payments`

**Response:**
```json
{
  "status": "success",
  "data": {
    "paymentHistories": [
      {
        "_id": "67a5555555555555555555",
        "userId": {
          "name": "John Doe",
          "email": "john@example.com",
          "contactNumber": "9876543210"
        },
        "referenceType": "event-pass1",
        "referenceId": "67a3333333333333333333",
        "amount": 1297,
        "paymentUTR": "UTR202601041234567890",
        "paymentScreenshot": "https://res.cloudinary.com/.../payment-screenshots/...",
        "status": "pending",
        "createdAt": "2026-01-04T..."
      }
    ]
  }
}
```

**Note:** Admin can view payment screenshots by opening the `paymentScreenshot` URL

#### 2. Verify Payment
**PATCH** `/paneermoms/payments/:id/verify`

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "_id": "67a5555555555555555555",
      "status": "verified",
      "verifiedAt": "2026-01-04T..."
    }
  }
}
```

**Side Effects:**
- For event passes: QR code generated and emailed
- For accommodation: Booking status updated to "confirmed"
- User receives confirmation email

#### 3. Reject Payment
**PATCH** `/paneermoms/payments/:id/reject`

**Response:**
```json
{
  "status": "success",
  "data": {
    "payment": {
      "_id": "67a5555555555555555555",
      "status": "rejected"
    }
  }
}
```

#### 4. Get Payment Statistics
**GET** `/paneermoms/payments/stats`

**Response:**
```json
{
  "status": "success",
  "data": {
    "totalPayments": 150,
    "verifiedPayments": 120,
    "rejectedPayments": 5,
    "pendingPayments": 25
  }
}
```

---

### Points Management

#### 1. Add Points
**POST** `/paneermoms/points/add`

**Request Body:**
```json
{
  "userId": "67a1234567890abcdef12345",
  "points": 50,
  "reason": "Won quiz competition"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "name": "John Doe",
      "house": "Gryffindor",
      "points": 200
    }
  }
}
```

#### 2. Subtract Points
**POST** `/paneermoms/points/subtract`

**Request Body:**
```json
{
  "userId": "67a1234567890abcdef12345",
  "points": 20,
  "reason": "Rule violation"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "user": {
      "name": "John Doe",
      "house": "Gryffindor",
      "points": 180
    }
  }
}
```

---

### Merch Management

#### 1. Add Merch Item
**POST** `/paneermoms/merch`

**Request Body:**
```json
{
  "type": "wearable",
  "name": "Parsec Hoodie",
  "description": "Premium quality hoodie",
  "price": 899,
  "stockQuantity": 50,
  "sizesAvailable": ["M", "L", "XL"]
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "merch": {
      "_id": "67a6666666666666666666",
      "type": "wearable",
      "name": "Parsec Hoodie",
      "description": "Premium quality hoodie",
      "price": 899,
      "stockQuantity": 50,
      "sizesAvailable": ["M", "L", "XL"]
    }
  }
}
```

#### 2. Update Merch Stock
**PATCH** `/paneermoms/merch/:id/stock`

**Request Body:**
```json
{
  "stockQuantity": 75
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "merch": {
      "_id": "67a6666666666666666666",
      "stockQuantity": 75
    }
  }
}
```

#### 3. Delete Merch Item
**DELETE** `/paneermoms/merch/:id`

**Response:**
```json
{
  "status": "success",
  "message": "Merch item deleted successfully"
}
```

---

### Accommodation Management

#### 1. Create Availability
**POST** `/paneermoms/accommodation`

**Request Body:**
```json
{
  "date": "2026-01-25",
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
    "_id": "67a7777777777777777777",
    "date": "2026-01-25T00:00:00.000Z",
    "mensAvailability": 50,
    "womensAvailability": 30
  }
}
```

#### 2. Modify Availability
**PATCH** `/paneermoms/accommodation`

**Request Body:**
```json
{
  "date": "2026-01-25",
  "mensAvailability": 45,
  "womensAvailability": 28
}
```

**Response:**
```json
{
  "success": true,
  "message": "Accommodation availability modified successfully",
  "data": {
    "_id": "67a7777777777777777777",
    "date": "2026-01-25T00:00:00.000Z",
    "mensAvailability": 45,
    "womensAvailability": 28
  }
}
```

---

### QR Code Verification

#### 1. Verify Event Pass QR
**POST** `/paneermoms/qr/verify`

**Request Body:**
```json
{
  "qrData": "encrypted-qr-string-here"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "qr": {
      "userId": "67a1234567890abcdef12345",
      "attendeeName": "John Doe",
      "passType": "event-pass1",
      "isUsed": true
    }
  }
}
```

---

## Complete Workflows

### Workflow 1: Merch Order to Payment Verification

**Step 1: User Creates Order**
```http
POST /api/parsec/v1/orders
Authorization: Bearer <user-jwt>

{
  "items": [
    {
      "merchId": "67a1111111111111111111",
      "quantity": 1,
      "size": "M"
    }
  ]
}
```

**Response:** Order created with `orderId`

---

**Step 2: User Records Payment**
Content-Type: multipart/form-data

Form Data:
- orderId: "67a3333333333333333333"
- amount: 499
- paymentUTR: "UTR202601041234567890"
- paymentScreenshot: <file> (optional) "orderId": "67a3333333333333333333",
  "amount": 499,
  "paymentUTR": "UTR202601041234567890"
}
```

**Response:** Payment recorded with `status: "pending"`  
**Email:** User receives "Payment Under Review" email

---

**Step 3: Admin Verifies Payment**
```http
PATCH /api/parsec/v1/paneermoms/payments/67a5555555555555555555/verify
x-admin-token: <admin-token>
```

**Response:** Payment `status: "verified"`  
**Side Effects:**
- If event-pass: QR code generated and emailed to user
- If regular merch: Confirmation email sent
- Order status updated

---

### Workflow 2: Accommodation Booking to Payment Verification

**Step 0: Admin Creates Availability (One-time)**
```http
POST /api/parsec/v1/paneermoms/accommodation
x-admin-token: <admin-token>

{
  "date": "2026-01-25",
  "mensAvailability": 50,
  "womensAvailability": 30
}
```

**Repeat for each date:** Jan 25, 26, 27, etc.

---

**Step 1: User Creates Booking**
```http
POST /api/parsec/v1/accommodation
Authorization: Bearer <user-jwt>

{
  "checkInDate": "2026-01-25",
  "checkOutDate": "2026-01-27",
  "gender": "male"
}
```

**Response:** Booking created with `bookingId`, `status: "pending"`, `paymentStatus: "unpaid"`  
**Side Effects:**
- Availability decreased by 1 for each night
- Uses atomic transaction to prevent overbooking

---

**Step 2: User Records Payment**
```http
POST /api/parsec/v1/payments
Content-Type: multipart/form-data

Form Data:
- bookingId: "67a4444444444444444444"
- amount: 1400
- paymentUTR: "UTR202601041234567891"
- paymentScreenshot: <file> (optional) "paymentUTR": "UTR202601041234567891"
}
```

**Response:** Payment recorded with `status: "pending"`, `referenceType: "AccommodationBooking"`  
**Email:** User receives "Accommodation Payment Under Review" email with booking details

---

**Step 3: Admin Verifies Payment**
```http
PATCH /api/parsec/v1/paneermoms/payments/67a5555555555555555556/verify
x-admin-token: <admin-token>
```

**Response:** Payment `status: "verified"`  
**Side Effects:**
- Booking `status: "confirmed"`
- Booking `paymentStatus: "paid"`
- User receives "Accommodation Confirmed" email with:
  - Check-in/out dates
  - Number of nights
  - Total amount
  - Instruction: "Room number will be provided upon reaching IIT Dharwad"

---

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description here"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (admin access required)
- `404` - Not Found (resource doesn't exist)
- `409` - Conflict (duplicate resource, availability conflict)
- `500` - Internal Server Error

---

## Authentication Headers

### For User Routes:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For Admin Routes:
```
x-admin-token: your-admin-jwt-token-here
```

---

## Notes

1. **Onboarding Requirement:** Most user routes require completed onboarding
2. **Atomic Transactions:** Accommodation booking uses MongoDB transactions to prevent race conditions
3. **Email Notifications:** Users receive emails at key stages (payment review, verification, booking confirmation)
4. **QR Code Generation:** Event passes automatically generate QR codes upon payment verification
7. **Payment Screenshots:** Optional upload feature using Cloudinary for secure storage and automatic optimization
8. **File Upload Validation:** Automatic validation and cleanup of uploaded files on errors
9. **Error Handling:** Enhanced error messages for duplicate payments, invalid IDs, and file upload issues

---

## Environment Variables Required

```env
# Cloudinary Configuration (for payment screenshots)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Contact & Support

For API issues or questions, contact the Parsec development team.

**Last Updated:** January 7, contact the Parsec development team.

**Last Updated:** January 4, 2026
