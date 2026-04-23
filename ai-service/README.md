# LifeChain AI Microservice

Python Flask service for AI-powered blood demand prediction, donor recommendations, and expiry alerts.

## Setup

### 1. Create Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env if needed (defaults should work)
```

### 4. Start the Service

```bash
python app.py
```

The service will start on `http://localhost:5001`

## What Does This Service Do?

### 1. Demand Prediction
Uses machine learning to predict how much blood will be needed in the next 7 days based on historical usage patterns.

### 2. Donor Recommendations
Ranks donors by suitability for emergency requests based on:
- Location proximity
- Donation frequency (prefers 2-4 times per year)
- Time since last donation

### 3. Expiry Alerts
Identifies blood units expiring within 7 days so hospitals can use them before they expire.

## API Endpoints

- `POST /api/predict-demand` - Get 7-day demand forecast
- `POST /api/recommend-donors` - Rank donors for emergency
- `POST /api/check-expiry` - Find expiring blood units
- `GET /api/health` - Service health check

## Project Structure

```
ai-service/
├── models/          # ML models and training code
├── services/        # Business logic
├── utils/           # Helper functions
└── app.py          # Flask application
```

## Note on Training Data

Since we don't have real hospital data, we'll generate synthetic (fake but realistic) data for training the models. This is common in educational projects and proof-of-concepts.
