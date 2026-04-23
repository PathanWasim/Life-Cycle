#!/usr/bin/env python3
"""Test script for AI service endpoints"""

import requests
import json
import sys
from datetime import datetime, timedelta

BASE_URL = 'http://localhost:5001/api'

def test_health_check():
    """Test health check endpoint"""
    print('🧪 Testing AI Service Health Check...\n')
    
    try:
        response = requests.get(f'{BASE_URL}/health')
        data = response.json()
        
        print('✅ Health check successful')
        print(f'   Status: {data["status"]}')
        print(f'   Service: {data["service"]}')
        print(f'   Version: {data["version"]}')
        print(f'   Models: {data["models"]}\n')
        
        return True
    except Exception as e:
        print(f'❌ Health check failed: {str(e)}\n')
        return False

def test_demand_prediction():
    """Test demand prediction endpoint"""
    print('🧪 Testing Demand Prediction...\n')
    
    try:
        # Generate sample historical data (last 14 days)
        historical_data = []
        for i in range(14, 0, -1):
            date = datetime.now() - timedelta(days=i)
            # Simulate usage pattern
            base_usage = 10
            if date.weekday() >= 5:  # Weekend
                base_usage = 7
            historical_data.append(base_usage)
        
        # Test prediction for O+ blood group
        payload = {
            'bloodGroup': 'O+',
            'historicalData': historical_data
        }
        
        response = requests.post(
            f'{BASE_URL}/predict-demand',
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data['data']
            
            print('✅ Demand prediction successful')
            print(f'   Blood Group: {result["blood_group"]}')
            print(f'   Average Predicted Demand: {result["average_predicted_demand"]} units/day')
            print(f'   Total 7-Day Demand: {result["total_predicted_demand"]} units')
            print()
            print('   7-Day Forecast:')
            for pred in result['predictions']:
                print(f'      {pred["date"]} ({pred["dayOfWeek"]}): {pred["predictedDemand"]} units (confidence: {pred["confidence"]})')
            print()
            
            return True
        else:
            print(f'❌ Prediction failed: {response.json()}\n')
            return False
            
    except Exception as e:
        print(f'❌ Prediction test failed: {str(e)}\n')
        return False

def test_invalid_request():
    """Test error handling"""
    print('🧪 Testing Error Handling...\n')
    
    try:
        # Test with insufficient historical data
        payload = {
            'bloodGroup': 'A+',
            'historicalData': [5, 6, 7]  # Only 3 days (need 7)
        }
        
        response = requests.post(
            f'{BASE_URL}/predict-demand',
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 400:
            print('✅ PASS: Correctly rejected insufficient historical data')
            print(f'   Reason: {response.json()["message"]}\n')
            return True
        else:
            print('❌ FAIL: Should have rejected insufficient data\n')
            return False
            
    except Exception as e:
        print(f'❌ Error handling test failed: {str(e)}\n')
        return False

def test_donor_recommendations():
    """Test donor recommendation endpoint"""
    print('🧪 Testing Donor Recommendations...\n')
    
    try:
        # Sample eligible donors
        eligible_donors = [
            {
                'id': '1', 'name': 'John Doe', 'email': 'john@example.com',
                'bloodGroup': 'O+', 'city': 'Mumbai', 'pincode': '400001',
                'donationsPerYear': 3, 'daysSinceLastDonation': 75
            },
            {
                'id': '2', 'name': 'Jane Smith', 'email': 'jane@example.com',
                'bloodGroup': 'O+', 'city': 'Mumbai', 'pincode': '400002',
                'donationsPerYear': 1, 'daysSinceLastDonation': 120
            },
            {
                'id': '3', 'name': 'Bob Johnson', 'email': 'bob@example.com',
                'bloodGroup': 'O+', 'city': 'Delhi', 'pincode': '110001',
                'donationsPerYear': 2, 'daysSinceLastDonation': 65
            }
        ]
        
        payload = {
            'bloodGroup': 'O+',
            'location': {'city': 'Mumbai', 'pincode': '400001'},
            'eligibleDonors': eligible_donors
        }
        
        response = requests.post(
            f'{BASE_URL}/recommend-donors',
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data['data']
            
            print('✅ Donor recommendations successful')
            print(f'   Blood Group: {result["bloodGroup"]}')
            print(f'   Location: {result["location"]["city"]}, {result["location"]["pincode"]}')
            print(f'   Total Eligible: {result["totalEligible"]}')
            print(f'   Recommended: {result["recommendedCount"]}')
            print()
            print('   Top Donors:')
            for i, donor in enumerate(result['topDonors'][:3], 1):
                print(f'      {i}. {donor["name"]} - Score: {donor["suitabilityScore"]}')
                print(f'         Breakdown: Proximity={donor["scoreBreakdown"]["proximity"]}, '
                      f'Frequency={donor["scoreBreakdown"]["frequency"]}, '
                      f'Recency={donor["scoreBreakdown"]["recency"]}')
            print()
            
            return True
        else:
            print(f'❌ Recommendation failed: {response.json()}\n')
            return False
            
    except Exception as e:
        print(f'❌ Recommendation test failed: {str(e)}\n')
        return False

def test_expiry_alerts():
    """Test expiry alert endpoint"""
    print('🧪 Testing Expiry Alerts...\n')
    
    try:
        # Sample blood units with different expiry dates
        blood_units = [
            {
                'bloodUnitID': 'BU-001',
                'bloodGroup': 'O+',
                'expiryDate': (datetime.now() + timedelta(days=2)).isoformat(),
                'currentHospitalID': 'H001',
                'status': 'Stored'
            },
            {
                'bloodUnitID': 'BU-002',
                'bloodGroup': 'A+',
                'expiryDate': (datetime.now() + timedelta(days=5)).isoformat(),
                'currentHospitalID': 'H001',
                'status': 'Stored'
            },
            {
                'bloodUnitID': 'BU-003',
                'bloodGroup': 'B+',
                'expiryDate': (datetime.now() + timedelta(days=30)).isoformat(),
                'currentHospitalID': 'H001',
                'status': 'Stored'
            }
        ]
        
        payload = {
            'bloodUnits': blood_units
        }
        
        response = requests.post(
            f'{BASE_URL}/check-expiry',
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            data = response.json()
            result = data['data']
            
            print('✅ Expiry check successful')
            print(f'   Total Expiring: {result["summary"]["total"]}')
            print(f'   High Priority: {result["summary"]["high_priority"]}')
            print(f'   Medium Priority: {result["summary"]["medium_priority"]}')
            print()
            
            if result['expiringUnits']:
                print('   Expiring Units:')
                for unit in result['expiringUnits']:
                    print(f'      {unit["bloodUnitID"]} ({unit["bloodGroup"]}) - '
                          f'{unit["daysUntilExpiry"]} days - Priority: {unit["priority"]}')
            print()
            
            return True
        else:
            print(f'❌ Expiry check failed: {response.json()}\n')
            return False
            
    except Exception as e:
        print(f'❌ Expiry check test failed: {str(e)}\n')
        return False

def main():
    print('=' * 60)
    print('LifeChain AI Service Test Suite')
    print('=' * 60)
    print()
    
    # Run tests
    results = []
    results.append(('Health Check', test_health_check()))
    results.append(('Demand Prediction', test_demand_prediction()))
    results.append(('Donor Recommendations', test_donor_recommendations()))
    results.append(('Expiry Alerts', test_expiry_alerts()))
    results.append(('Error Handling', test_invalid_request()))
    
    # Summary
    print('=' * 60)
    print('Test Summary')
    print('=' * 60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = '✅ PASS' if result else '❌ FAIL'
        print(f'{status}: {test_name}')
    
    print()
    print(f'Total: {passed}/{total} tests passed')
    print('=' * 60)
    
    return passed == total

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
