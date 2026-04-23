from datetime import datetime, timedelta

class AlertService:
    """Service for checking blood unit expiry and generating alerts"""
    
    def check_expiry(self, blood_units):
        """
        Check blood units for expiry and calculate priority
        
        Args:
            blood_units: List of blood unit dicts with:
                - bloodUnitID, bloodGroup, expiryDate, currentHospitalID, etc.
        
        Returns:
            dict: Expiring units with priority levels
        """
        expiring_units = []
        now = datetime.now()
        seven_days_from_now = now + timedelta(days=7)
        
        for unit in blood_units:
            # Parse expiry date
            if isinstance(unit.get('expiryDate'), str):
                # Remove timezone info to make it naive
                expiry_str = unit['expiryDate'].replace('Z', '').split('+')[0].split('.')[0]
                expiry_date = datetime.fromisoformat(expiry_str)
            else:
                expiry_date = unit.get('expiryDate')
            
            # Make sure expiry_date is naive (no timezone)
            if hasattr(expiry_date, 'tzinfo') and expiry_date.tzinfo is not None:
                expiry_date = expiry_date.replace(tzinfo=None)
            
            # Check if expiring within 7 days
            if now < expiry_date <= seven_days_from_now:
                days_until_expiry = (expiry_date - now).days
                
                # Calculate priority
                if days_until_expiry <= 3:
                    priority = 'high'
                    priority_level = 3
                elif days_until_expiry <= 7:
                    priority = 'medium'
                    priority_level = 2
                else:
                    priority = 'low'
                    priority_level = 1
                
                expiring_units.append({
                    'bloodUnitID': unit.get('bloodUnitID'),
                    'bloodGroup': unit.get('bloodGroup'),
                    'expiryDate': unit.get('expiryDate'),
                    'daysUntilExpiry': days_until_expiry,
                    'priority': priority,
                    'priorityLevel': priority_level,
                    'hospitalID': unit.get('currentHospitalID'),
                    'status': unit.get('status')
                })
        
        # Sort by priority (high to low) and then by days until expiry
        expiring_units.sort(key=lambda x: (-x['priorityLevel'], x['daysUntilExpiry']))
        
        # Calculate summary
        summary = {
            'totalExpiring': len(expiring_units),
            'highPriority': len([u for u in expiring_units if u['priority'] == 'high']),
            'mediumPriority': len([u for u in expiring_units if u['priority'] == 'medium']),
            'lowPriority': len([u for u in expiring_units if u['priority'] == 'low'])
        }
        
        return {
            'expiringUnits': expiring_units,
            'summary': {
                'total': len(expiring_units),
                'high_priority': len([u for u in expiring_units if u['priority'] == 'high']),
                'medium_priority': len([u for u in expiring_units if u['priority'] == 'medium']),
                'low_priority': len([u for u in expiring_units if u['priority'] == 'low'])
            }
        }

if __name__ == '__main__':
    # Test the alert service
    service = AlertService()
    
    # Sample blood units
    test_units = [
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
    
    result = service.check_expiry(test_units)
    
    print('Expiring Units:')
    print(f'Total: {result["summary"]["total"]}')
    print(f'High Priority: {result["summary"]["high_priority"]}')
    print(f'Medium Priority: {result["summary"]["medium_priority"]}')
    print()
    
    for unit in result['expiringUnits']:
        print(f'{unit["bloodUnitID"]} ({unit["bloodGroup"]}) - {unit["daysUntilExpiry"]} days - Priority: {unit["priority"]}')
