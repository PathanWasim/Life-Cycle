# AI Service Setup Instructions

Follow these steps to set up and test the AI microservice:

## Step 1: Create Virtual Environment

Open a new terminal in the `ai-service` directory and run:

```bash
python -m venv venv
```

## Step 2: Activate Virtual Environment

**Windows (PowerShell):**
```bash
venv\Scripts\activate
```

**Windows (CMD):**
```bash
venv\Scripts\activate.bat
```

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install Flask, scikit-learn, pandas, numpy, and other required packages.

## Step 4: Generate Data and Train Models

```bash
python setup.py
```

This will:
- Generate 6 months of synthetic blood usage data
- Generate 500 synthetic donor records
- Train Random Forest models for all 8 blood groups
- Save models to `models/trained_models/`

Expected output:
```
📊 Generating 6 months of synthetic blood usage data...
✅ Generated 1440 records
👥 Generating 500 synthetic donor records...
✅ Generated 500 donor records
🎓 Training demand prediction models...
✅ Models saved
```

## Step 5: Start the AI Service

```bash
python app.py
```

The service will start on port 5001. You should see:
```
🚀 LifeChain AI Service starting on port 5001...
🌍 Environment: development
🔗 Backend URL: http://localhost:5000
```

## Step 6: Test the AI Service

Open another terminal and run:

```bash
python test-ai-service.py
```

Expected output:
```
✅ PASS: Health Check
✅ PASS: Demand Prediction
✅ PASS: Error Handling
Total: 3/3 tests passed
```

## Troubleshooting

**Issue**: `ModuleNotFoundError: No module named 'flask'`
**Solution**: Make sure virtual environment is activated and dependencies are installed

**Issue**: `FileNotFoundError: Model file not found`
**Solution**: Run `python setup.py` to generate data and train models first

**Issue**: Port 5001 already in use
**Solution**: Change FLASK_PORT in .env file to a different port

## Next Steps

Once the AI service is running and tested, you can integrate it with the backend (Task 16).
