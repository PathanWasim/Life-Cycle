# LifeChain AI Service API Documentation

## Base URL
```
http://localhost:5001/api
```

## Endpoints

### 1. Health Check
Check if the AI service is running and models are loaded.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "service": "LifeChain AI Service",
  "version": "1.0.0",
  "models": {
    "demand_predictor": "available",
    "donor_ranker": "available"
  }
}
```

---

### 2. Predict Blood Demand
Get 7-day demand forecast for a specific blood group.

**Endpoint:** `POST /predict-demand`

**Request Body:**
```json
{
  "bloodGroup": "O+",
  "historicalData": [10, 12, 8, 9, 11, 10, 7, 9, 10, 11, 8, 9, 10, 12]
}
```

**Parameters:**
- `bloodGroup` (string, required): Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `historicalData` (array, required): Array of daily usage numbers (minimum 7 days)

**Response:**
```json
{
  "success": true,
  "message": "Demand prediction generated successfully",
  "data": {
    "blood_group": "O+",
    "predictions": [
      {
        "date": "2026-03-01",
        "day_of_week": "Sunday",
        "predicted_units": 8,
        "confidence": 0.75
      }
    ],
    "average_predicted_demand": 9.5,
    "total_predicted_demand": 67
  }
}
```

---

### 3. Recommend Donors
Rank eligible donors by suitability for emergency blood request.

**Endpoint:** `POST /recommend-donors`

**Request Body:**
```json
{
  "bloodGroup": "O+",
  "location": {
    "city": "Mumbai",
    "pincode": "400001"
  },
  "eligibleDonors": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "bloodGroup": "O+",
      "city": "Mumbai",
      "pincode": "400001",
      "donationsPerYear": 3,
      "daysSinceLastDonation": 75
    }
  ]
}
```

**Parameters:**
- `bloodGroup` (string, required): Required blood group
- `location` (object, required): Request location with city and pincode
- `eligibleDonors` (array, required): Array of eligible donor objects

**Response:**
```json
{
  "success": true,
  "message": "Donors ranked successfully",
  "data": {
    "bloodGroup": "O+",
    "location": {
      "city": "Mumbai",
      "pincode": "400001"
    },
    "totalEligible": 3,
    "topDonors": [
      {
        "id": "1",
        "name": "John Doe",
        "email": "john@example.com",
        "bloodGroup": "O+",
        "city": "Mumbai",
        "pincode": "400001",
        "suitabilityScore": 0.92,
        "scoreBreakdown": {
          "proximity": 1.0,
          "frequency": 1.0,
          "recency": 0.8
        }
      }
    ],
    "recommendedCount": 3
  }
}
```

**Scoring Factors:**
- **Proximity (40%)**: City/pincode matching
- **Frequency (30%)**: Prefers 2-4 donations per year
- **Recency (30%)**: Prefers 60-90 days since last donation

---

### 4. Check Expiry
Identify blood units expiring within 7 days with priority levels.

**Endpoint:** `POST /check-expiry`

**Request Body:**
```json
{
  "bloodUnits": [
    {
      "bloodUnitID": "BU-001",
      "bloodGroup": "O+",
      "expiryDate": "2026-03-03T00:00:00Z",
      "currentHospitalID": "H001",
      "status": "Stored"
    }
  ]
}
```

**Parameters:**
- `bloodUnits` (array, required): Array of blood unit objects with expiry dates

**Response:**
```json
{
  "success": true,
  "message": "Expiry check completed successfully",
  "data": {
    "expiringUnits": [
      {
        "bloodUnitID": "BU-001",
        "bloodGroup": "O+",
        "expiryDate": "2026-03-03T00:00:00Z",
        "daysUntilExpiry": 2,
        "priority": "high",
        "priorityLevel": 3,
        "currentHospitalID": "H001",
        "status": "Stored"
      }
    ],
    "summary": {
      "total": 1,
      "high_priority": 1,
      "medium_priority": 0,
      "low_priority": 0
    }
  }
}
```

**Priority Levels:**
- **High (1-3 days)**: Urgent action required
- **Medium (4-7 days)**: Action needed soon
- **Low (>7 days)**: Monitor

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (in development mode)"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Endpoint not found
- `500` - Internal Server Error
- `503` - Service Unavailable (models not loaded)

---

## Testing

Run the test suite:
```bash
python test-ai-service.py
```

Make sure the AI service is running before testing.
