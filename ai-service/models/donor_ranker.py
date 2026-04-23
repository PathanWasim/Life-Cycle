import numpy as np
from datetime import datetime, timedelta

class DonorRanker:
    """Rank donors by suitability for emergency blood requests"""
    
    def __init__(self):
        # Weights for scoring factors
        self.weights = {
            'proximity': 0.4,      # 40% - Location is most important
            'frequency': 0.3,      # 30% - Donation frequency
            'recency': 0.3         # 30% - Time since last donation
        }
    
    def calculate_proximity_score(self, donor_location, request_location):
        """
        Calculate proximity score based on city/pincode matching
        
        Args:
            donor_location: dict with 'city' and 'pincode'
            request_location: dict with 'city' and 'pincode'
        
        Returns:
            float: Score between 0 and 1
        """
        score = 0.0
        
        # Exact city match
        if donor_location.get('city') == request_location.get('city'):
            score += 0.6
            
            # Exact pincode match (within same city)
            if donor_location.get('pincode') == request_location.get('pincode'):
                score += 0.4
        
        return score
    
    def calculate_frequency_score(self, donations_per_year):
        """
        Calculate donation frequency score
        Prefer donors who donate 2-4 times per year (regular but not excessive)
        
        Args:
            donations_per_year: Number of donations in the past year
        
        Returns:
            float: Score between 0 and 1
        """
        if donations_per_year == 0:
            return 0.3  # New donors are okay but not ideal
        elif 2 <= donations_per_year <= 4:
            return 1.0  # Ideal frequency
        elif donations_per_year == 1:
            return 0.7  # Occasional donors
        elif donations_per_year >= 5:
            return 0.5  # Too frequent (may need rest)
        else:
            return 0.5
    
    def calculate_recency_score(self, days_since_last_donation):
        """
        Calculate time-since-last-donation score
        Prefer donors who donated 60-90 days ago (eligible and experienced)
        
        Args:
            days_since_last_donation: Days since last donation (None if never donated)
        
        Returns:
            float: Score between 0 and 1
        """
        if days_since_last_donation is None:
            return 0.5  # New donors are okay
        
        if days_since_last_donation < 56:
            return 0.0  # Not eligible yet (56-day rule)
        elif 60 <= days_since_last_donation <= 90:
            return 1.0  # Ideal window
        elif 56 <= days_since_last_donation < 60:
            return 0.8  # Recently eligible
        elif 90 < days_since_last_donation <= 120:
            return 0.9  # Still good
        elif 120 < days_since_last_donation <= 180:
            return 0.7  # Been a while
        else:
            return 0.6  # Long time since last donation
    
    def rank_donors(self, blood_group, location, eligible_donors):
        """
        Rank donors by suitability for emergency request
        
        Args:
            blood_group: Required blood group
            location: dict with 'city' and 'pincode'
            eligible_donors: List of eligible donor dicts with:
                - id, name, email, bloodGroup, city, pincode
                - donationsPerYear, daysSinceLastDonation
        
        Returns:
            list: Ranked donors with scores
        """
        ranked_donors = []
        
        for donor in eligible_donors:
            # Calculate individual scores
            proximity_score = self.calculate_proximity_score(
                {'city': donor.get('city'), 'pincode': donor.get('pincode')},
                location
            )
            
            frequency_score = self.calculate_frequency_score(
                donor.get('donationsPerYear', 0)
            )
            
            recency_score = self.calculate_recency_score(
                donor.get('daysSinceLastDonation')
            )
            
            # Calculate overall suitability score (weighted average)
            overall_score = (
                proximity_score * self.weights['proximity'] +
                frequency_score * self.weights['frequency'] +
                recency_score * self.weights['recency']
            )
            
            ranked_donors.append({
                'id': donor.get('id'),
                'name': donor.get('name'),
                'email': donor.get('email'),
                'bloodGroup': donor.get('bloodGroup'),
                'city': donor.get('city'),
                'pincode': donor.get('pincode'),
                'suitabilityScore': round(overall_score, 3),
                'scoreBreakdown': {
                    'proximity': round(proximity_score, 3),
                    'frequency': round(frequency_score, 3),
                    'recency': round(recency_score, 3)
                }
            })
        
        # Sort by suitability score (descending)
        ranked_donors.sort(key=lambda x: x['suitabilityScore'], reverse=True)
        
        return ranked_donors

if __name__ == '__main__':
    # Test the ranker
    ranker = DonorRanker()
    
    # Sample donors
    donors = [
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
    
    # Rank donors
    location = {'city': 'Mumbai', 'pincode': '400001'}
    ranked = ranker.rank_donors('O+', location, donors)
    
    print('Ranked Donors:')
    for i, donor in enumerate(ranked, 1):
        print(f'{i}. {donor["name"]} - Score: {donor["suitabilityScore"]}')
        print(f'   Breakdown: {donor["scoreBreakdown"]}')
