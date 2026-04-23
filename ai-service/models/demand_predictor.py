import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta

class DemandPredictor:
    """Predict blood demand using Random Forest"""
    
    def __init__(self, model_path='models/trained_models'):
        self.model_path = model_path
        self.models = {}  # One model per blood group
        
    def train(self, data_file='data/blood_usage_history.csv'):
        """
        Train demand prediction models for each blood group
        
        Args:
            data_file: Path to historical usage data CSV
        """
        print('🎓 Training demand prediction models...')
        
        # Load data
        df = pd.read_csv(data_file)
        df['date'] = pd.to_datetime(df['date'])
        
        # Train a model for each blood group
        for blood_group in df['blood_group'].unique():
            print(f'   Training model for {blood_group}...')
            
            # Filter data for this blood group
            bg_data = df[df['blood_group'] == blood_group].copy()
            bg_data = bg_data.sort_values('date')
            
            # Create features
            bg_data['day_of_week'] = bg_data['date'].dt.dayofweek
            bg_data['month'] = bg_data['date'].dt.month
            bg_data['day_of_month'] = bg_data['date'].dt.day
            
            # Create lag features (previous 7 days)
            for i in range(1, 8):
                bg_data[f'lag_{i}'] = bg_data['units_used'].shift(i)
            
            # Drop rows with NaN (from lag features)
            bg_data = bg_data.dropna()
            
            # Prepare features and target
            feature_cols = ['day_of_week', 'month', 'day_of_month', 'is_weekend'] + [f'lag_{i}' for i in range(1, 8)]
            X = bg_data[feature_cols]
            y = bg_data['units_used']
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
            
            # Train model
            model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=10)
            model.fit(X_train, y_train)
            
            # Evaluate
            train_score = model.score(X_train, y_train)
            test_score = model.score(X_test, y_test)
            
            print(f'      Train R²: {train_score:.3f}, Test R²: {test_score:.3f}')
            
            # Save model
            self.models[blood_group] = model
        
        # Save all models
        os.makedirs(self.model_path, exist_ok=True)
        joblib.dump(self.models, f'{self.model_path}/demand_models.pkl')
        print(f'✅ Models saved to {self.model_path}/demand_models.pkl\n')
    
    def load_models(self):
        """Load trained models from disk"""
        model_file = f'{self.model_path}/demand_models.pkl'
        if os.path.exists(model_file):
            self.models = joblib.load(model_file)
            print(f'✅ Loaded models for {len(self.models)} blood groups')
        else:
            raise FileNotFoundError(f'Model file not found: {model_file}')
    
    def predict_demand(self, blood_group, historical_data):
        """
        Predict 7-day demand forecast for a blood group
        
        Args:
            blood_group: Blood group to predict (e.g., 'A+')
            historical_data: List of recent usage data (last 7 days minimum)
                           Can be list of numbers or list of objects with 'quantity' field
        
        Returns:
            dict: Predictions with confidence scores
        """
        if blood_group not in self.models:
            raise ValueError(f'No model trained for blood group: {blood_group}')
        
        model = self.models[blood_group]
        
        # Prepare historical data
        if len(historical_data) < 7:
            raise ValueError('Need at least 7 days of historical data')
        
        # Extract quantities from historical data
        # Handle both formats: [1, 2, 3] or [{quantity: 1}, {quantity: 2}, {quantity: 3}]
        if isinstance(historical_data[0], dict):
            recent_usage = [item.get('quantity', 0) for item in historical_data[-7:]]
        else:
            recent_usage = historical_data[-7:]
        
        # Generate predictions for next 7 days
        predictions = []
        current_date = datetime.now()
        
        for day in range(1, 8):
            pred_date = current_date + timedelta(days=day)
            
            # Create features
            features = {
                'day_of_week': pred_date.weekday(),
                'month': pred_date.month,
                'day_of_month': pred_date.day,
                'is_weekend': 1 if pred_date.weekday() >= 5 else 0
            }
            
            # Add lag features (use recent usage + previous predictions)
            all_usage = recent_usage + [p['predictedDemand'] for p in predictions]
            for i in range(1, 8):
                if len(all_usage) >= i:
                    features[f'lag_{i}'] = all_usage[-i]
                else:
                    features[f'lag_{i}'] = 0
            
            # Create feature array
            feature_array = np.array([[
                features['day_of_week'],
                features['month'],
                features['day_of_month'],
                features['is_weekend'],
                features['lag_1'],
                features['lag_2'],
                features['lag_3'],
                features['lag_4'],
                features['lag_5'],
                features['lag_6'],
                features['lag_7']
            ]])
            
            # Predict
            predicted_units = max(0, int(round(model.predict(feature_array)[0])))
            
            # Calculate confidence (based on data quality and variance)
            confidence = min(0.95, 0.7 + (len(historical_data) / 100))
            
            predictions.append({
                'date': pred_date.strftime('%Y-%m-%d'),
                'dayOfWeek': pred_date.strftime('%A'),
                'predictedDemand': predicted_units,
                'confidence': round(confidence, 2)
            })
        
        return {
            'blood_group': blood_group,
            'predictions': predictions,
            'average_predicted_demand': round(np.mean([p['predictedDemand'] for p in predictions]), 1),
            'total_predicted_demand': sum([p['predictedDemand'] for p in predictions]),
            'confidence': round(confidence, 2)
        }

if __name__ == '__main__':
    # Generate training data
    from utils.data_generator import DataGenerator
    
    generator = DataGenerator()
    usage_df = generator.generate_blood_usage_data(months=6)
    
    # Train models
    predictor = DemandPredictor()
    predictor.train()
    
    print('🎉 Demand prediction models trained successfully!')
