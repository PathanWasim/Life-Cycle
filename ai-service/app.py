from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import sys

# Add models directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'models'))

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS to allow backend requests
CORS(app, origins=[os.getenv('BACKEND_URL', 'http://localhost:5000')])

# Initialize demand predictor (lazy loading)
demand_predictor = None
donor_ranker = None

def get_demand_predictor():
    """Lazy load demand predictor"""
    global demand_predictor
    if demand_predictor is None:
        from models.demand_predictor import DemandPredictor
        demand_predictor = DemandPredictor()
        try:
            demand_predictor.load_models()
        except FileNotFoundError:
            print('⚠️  Warning: Demand prediction models not found. Run training first.')
    return demand_predictor

def get_donor_ranker():
    """Lazy load donor ranker"""
    global donor_ranker
    if donor_ranker is None:
        from models.donor_ranker import DonorRanker
        donor_ranker = DonorRanker()
    return donor_ranker

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    model_status = 'available' if demand_predictor is not None else 'not_loaded'
    ranker_status = 'available' if donor_ranker is not None else 'not_loaded'
    
    return jsonify({
        'status': 'healthy',
        'service': 'LifeChain AI Service',
        'version': '1.0.0',
        'models': {
            'demand_predictor': model_status,
            'donor_ranker': ranker_status
        }
    }), 200

# Demand prediction endpoint
@app.route('/api/predict-demand', methods=['POST'])
def predict_demand():
    """Predict blood demand for next 7 days"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'bloodGroup' not in data or 'historicalData' not in data:
            return jsonify({
                'success': False,
                'message': 'Please provide bloodGroup and historicalData'
            }), 400
        
        blood_group = data['bloodGroup']
        historical_data = data['historicalData']
        
        # Validate historical data
        if not isinstance(historical_data, list) or len(historical_data) < 7:
            return jsonify({
                'success': False,
                'message': 'historicalData must be an array with at least 7 days of data'
            }), 400
        
        # Get predictor
        predictor = get_demand_predictor()
        
        if predictor is None:
            return jsonify({
                'success': False,
                'message': 'Demand prediction models not available'
            }), 503
        
        # Make prediction
        result = predictor.predict_demand(blood_group, historical_data)
        
        return jsonify({
            'success': True,
            'message': 'Demand prediction generated successfully',
            'data': result
        }), 200
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 400
    except Exception as e:
        print(f'❌ Error in predict_demand: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Error generating prediction',
            'error': str(e)
        }), 500

# Donor recommendation endpoint
@app.route('/api/recommend-donors', methods=['POST'])
def recommend_donors():
    """Rank donors by suitability for emergency request"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'bloodGroup' not in data or 'location' not in data or 'eligibleDonors' not in data:
            return jsonify({
                'success': False,
                'message': 'Please provide bloodGroup, location, and eligibleDonors'
            }), 400
        
        blood_group = data['bloodGroup']
        location = data['location']
        eligible_donors = data['eligibleDonors']
        
        # Validate location
        if not isinstance(location, dict) or 'city' not in location:
            return jsonify({
                'success': False,
                'message': 'location must be an object with city and pincode'
            }), 400
        
        # Validate eligible donors
        if not isinstance(eligible_donors, list) or len(eligible_donors) == 0:
            return jsonify({
                'success': False,
                'message': 'eligibleDonors must be a non-empty array'
            }), 400
        
        # Get ranker
        ranker = get_donor_ranker()
        
        # Rank donors
        ranked_donors = ranker.rank_donors(blood_group, location, eligible_donors)
        
        # Return top 10
        top_donors = ranked_donors[:10]
        
        return jsonify({
            'success': True,
            'message': 'Donors ranked successfully',
            'data': {
                'bloodGroup': blood_group,
                'location': location,
                'totalEligible': len(eligible_donors),
                'topDonors': top_donors,
                'recommendedCount': len(top_donors)
            }
        }), 200
        
    except Exception as e:
        print(f'❌ Error in recommend_donors: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Error ranking donors',
            'error': str(e)
        }), 500

# Expiry check endpoint
@app.route('/api/check-expiry', methods=['POST'])
def check_expiry():
    """Check blood units for expiry and generate alerts"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data or 'bloodUnits' not in data:
            return jsonify({
                'success': False,
                'message': 'Please provide bloodUnits array'
            }), 400
        
        blood_units = data['bloodUnits']
        
        # Validate blood units
        if not isinstance(blood_units, list):
            return jsonify({
                'success': False,
                'message': 'bloodUnits must be an array'
            }), 400
        
        # Import alert service
        from services.alert_service import AlertService
        alert_service = AlertService()
        
        # Check expiry
        result = alert_service.check_expiry(blood_units)
        
        return jsonify({
            'success': True,
            'message': 'Expiry check completed successfully',
            'data': result
        }), 200
        
    except Exception as e:
        print(f'❌ Error in check_expiry: {str(e)}')
        return jsonify({
            'success': False,
            'message': 'Error checking expiry',
            'error': str(e)
        }), 500

# Error handler for 404
@app.errorhandler(404)
def not_found(error):
    return jsonify({
        'success': False,
        'message': 'Endpoint not found'
    }), 404

# Error handler for 500
@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'success': False,
        'message': 'Internal server error'
    }), 500

if __name__ == '__main__':
    # Railway uses PORT environment variable
    port = int(os.getenv('PORT', os.getenv('FLASK_PORT', 5001)))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    print(f'🚀 LifeChain AI Service starting on port {port}...')
    print(f'🌍 Environment: {os.getenv("FLASK_ENV", "development")}')
    print(f'🔗 Backend URL: {os.getenv("BACKEND_URL", "http://localhost:5000")}')
    
    app.run(host='0.0.0.0', port=port, debug=debug)
