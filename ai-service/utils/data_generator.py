import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os

class DataGenerator:
    """Generate synthetic training data for AI models"""
    
    def __init__(self):
        self.blood_groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        self.cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata']
        
    def generate_blood_usage_data(self, months=6, output_file='data/blood_usage_history.csv'):
        """
        Generate synthetic historical blood usage data
        
        Args:
            months: Number of months of historical data to generate
            output_file: Path to save the CSV file
        """
        print(f'📊 Generating {months} months of synthetic blood usage data...')
        
        # Calculate date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=months * 30)
        
        data = []
        current_date = start_date
        
        while current_date <= end_date:
            # Generate usage for each blood group
            for blood_group in self.blood_groups:
                # Base usage varies by blood group (O+ and A+ are most common)
                if blood_group in ['O+', 'A+']:
                    base_usage = np.random.randint(8, 15)
                elif blood_group in ['B+', 'AB+']:
                    base_usage = np.random.randint(4, 8)
                else:  # Negative blood groups
                    base_usage = np.random.randint(2, 5)
                
                # Weekend effect (lower usage on weekends)
                if current_date.weekday() >= 5:  # Saturday or Sunday
                    base_usage = int(base_usage * 0.7)
                
                # Seasonal variation (higher in winter months)
                month = current_date.month
                if month in [11, 12, 1, 2]:  # Winter months
                    base_usage = int(base_usage * 1.2)
                
                # Add random variation
                usage = max(0, base_usage + np.random.randint(-2, 3))
                
                data.append({
                    'date': current_date.strftime('%Y-%m-%d'),
                    'blood_group': blood_group,
                    'units_used': usage,
                    'day_of_week': current_date.strftime('%A'),
                    'month': current_date.month,
                    'is_weekend': 1 if current_date.weekday() >= 5 else 0
                })
            
            current_date += timedelta(days=1)
        
        # Create DataFrame and save
        df = pd.DataFrame(data)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        df.to_csv(output_file, index=False)
        print(f'✅ Generated {len(df)} records')
        print(f'   Date range: {df["date"].min()} to {df["date"].max()}')
        print(f'   Saved to: {output_file}\n')
        
        return df
    
    def generate_donor_data(self, num_donors=500, output_file='data/donor_history.csv'):
        """
        Generate synthetic donor data
        
        Args:
            num_donors: Number of donors to generate
            output_file: Path to save the CSV file
        """
        print(f'👥 Generating {num_donors} synthetic donor records...')
        
        data = []
        
        for i in range(num_donors):
            # Random blood group (weighted by real-world distribution)
            blood_group = np.random.choice(
                self.blood_groups,
                p=[0.30, 0.08, 0.25, 0.07, 0.10, 0.03, 0.12, 0.05]  # Realistic distribution
            )
            
            # Random city
            city = np.random.choice(self.cities)
            
            # Random donation frequency (0-6 donations per year)
            donations_per_year = np.random.choice([0, 1, 2, 3, 4, 5, 6], p=[0.1, 0.2, 0.3, 0.2, 0.1, 0.05, 0.05])
            
            # Last donation date (random within last 365 days, or None)
            if donations_per_year > 0:
                days_since_last = np.random.randint(30, 365)
                last_donation_date = (datetime.now() - timedelta(days=days_since_last)).strftime('%Y-%m-%d')
            else:
                last_donation_date = None
                days_since_last = None
            
            # Age (18-60)
            age = np.random.randint(18, 61)
            
            # Weight (50-100 kg)
            weight = np.random.randint(50, 101)
            
            data.append({
                'donor_id': f'DONOR-{i+1:04d}',
                'blood_group': blood_group,
                'city': city,
                'age': age,
                'weight': weight,
                'donations_per_year': donations_per_year,
                'last_donation_date': last_donation_date,
                'days_since_last_donation': days_since_last
            })
        
        # Create DataFrame and save
        df = pd.DataFrame(data)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        
        df.to_csv(output_file, index=False)
        print(f'✅ Generated {len(df)} donor records')
        print(f'   Blood group distribution:')
        for bg in self.blood_groups:
            count = len(df[df['blood_group'] == bg])
            print(f'      {bg}: {count} ({count/len(df)*100:.1f}%)')
        print(f'   Saved to: {output_file}\n')
        
        return df

if __name__ == '__main__':
    generator = DataGenerator()
    
    # Generate blood usage data (6 months)
    usage_df = generator.generate_blood_usage_data(months=6)
    
    # Generate donor data (500 donors)
    donor_df = generator.generate_donor_data(num_donors=500)
    
    print('🎉 Synthetic data generation complete!')
