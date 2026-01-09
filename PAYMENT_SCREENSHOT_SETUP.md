# Payment Screenshot Upload - Cloudinary Setup Guide

## Overview
This implementation allows users to upload payment screenshots when recording payments. The images are stored in Cloudinary and the URL is saved in the database.

## Setup Instructions

### 1. Get Cloudinary Credentials
1. Go to [Cloudinary](https://cloudinary.com/) and create a free account
2. After logging in, go to your Dashboard
3. Copy the following credentials:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configure Environment Variables
Update your `config.env` file with your Cloudinary credentials:
```
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

### 3. API Usage

#### Endpoint: POST /api/parsec/v1/payments

**Headers:**
- Authorization: Bearer <JWT_TOKEN>
- Content-Type: multipart/form-data

**Form Data:**
- `amount` (required): Payment amount
- `paymentUTR` (required): Payment UTR/transaction ID
- `orderId` OR `bookingId` (required): Either order ID or booking ID
- `paymentScreenshot` (optional): Image file (JPEG, PNG, or PDF, max 5MB)

**Example using Postman/Frontend:**
```javascript
const formData = new FormData();
formData.append('amount', '500');
formData.append('paymentUTR', 'UTR123456789');
formData.append('orderId', 'order_id_here');
formData.append('paymentScreenshot', fileInput.files[0]);

fetch('/api/parsec/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## File Upload Specifications

- **Allowed formats**: JPG, JPEG, PNG, PDF
- **Maximum file size**: 5MB
- **Storage folder**: payment-screenshots (in Cloudinary)
- **Automatic optimization**: Images are resized to max 1000x1000 pixels

## Response

Success response includes the payment screenshot URL:
```json
{
  "status": "success",
  "data": {
    "payment": {
      "_id": "...",
      "userId": "...",
      "amount": 500,
      "paymentUTR": "UTR123456789",
      "paymentScreenshot": "https://res.cloudinary.com/.../payment-screenshots/...",
      "status": "pending",
      "createdAt": "..."
    }
  }
}
```

## Database Schema Update

The `PaymentHistory` model now includes:
```javascript
paymentScreenshot: {
    type: String,
    required: false
}
```

## Notes

- Screenshot upload is **optional** - payments can still be recorded without a screenshot
- Screenshots are automatically uploaded to Cloudinary during payment recording
- The Cloudinary URL is stored in the database for easy retrieval
- Admin can view the screenshot when verifying payments
- Images are stored in the 'payment-screenshots' folder in your Cloudinary account
