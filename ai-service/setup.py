#!/usr/bin/env python3
"""
Setup script for LifeChain AI Service
Generates synthetic data and trains models
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

from utils.data_generator import DataGenerator
from models.demand_predictor import DemandPredictor

def main():
    print('🚀 LifeChain AI Service Setup')
    print('=' * 60)
    print()
    
    # Step 1: Generate synthetic data
    print('STEP 1: Generating Synthetic Training Data')
    print('-' * 60)
    generator = DataGenerator()
    
    # Generate blood usage data (6 months)
    usage_df = generator.generate_blood_usage_data(months=6)
    
    # Generate donor data (500 donors)
    donor_df = generator.generate_donor_data(num_donors=500)
    
    # Step 2: Train demand prediction models
    print('STEP 2: Training Demand Prediction Models')
    print('-' * 60)
    predictor = DemandPredictor()
    predictor.train()
    
    print('=' * 60)
    print('✅ Setup complete! AI service is ready to use.')
    print()
    print('To start the service, run:')
    print('  python app.py')
    print()

if __name__ == '__main__':
    main()
