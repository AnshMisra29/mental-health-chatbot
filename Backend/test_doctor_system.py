import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_doctor_flow():
    print("\n[VERIFICATION] Testing Doctor Notification System")
    
    # 1. Register User
    user_data = {
        "name": "Doctor Test User",
        "email": f"doctor_test_{int(time.time())}@test.com",
        "password": "TestPass123!"
    }
    resp = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Add a Doctor
    doctor_data = {
        "name": "Dr. Verification",
        "email": "doctor@verify.com",
        "phone": "+91-9999999999",
        "specialization": "Psychiatry",
        "clinic_name": "Verify Clinic",
        "address": "Test Street, Test City",
        "latitude": 12.9716,
        "longitude": 77.5946
    }
    resp = requests.post(f"{BASE_URL}/doctors/", json=doctor_data, headers=headers)
    print(f"✅ Doctor Added: {resp.status_code}")
    doctor_id = resp.json()["doctor"]["id"]
    
    # 3. Simulate Crisis and get Alert ID
    resp = requests.post(f"{BASE_URL}/chat/message", json={"message": "I want to end my life"}, headers=headers)
    print(f"✅ Crisis Triggered: {resp.status_code}")
    alert_id = resp.json()["alert_id"]
    print(f"   - Alert ID: {alert_id}")
    
    # 4. Test Nearby Doctors (Location Search)
    resp = requests.get(f"{BASE_URL}/doctors/nearby?lat=12.97&lon=77.59", headers=headers)
    print(f"✅ Nearby Doctors Found: {len(resp.json()['doctors'])}")
    
    # 5. Select Doctor (Trigger Emails)
    # Note: This will attempt to send real email if configured in .env
    # We check if the API succeeds
    resp = requests.post(f"{BASE_URL}/doctors/select", json={
        "doctor_id": doctor_id,
        "alert_id": alert_id
    }, headers=headers)
    
    if resp.status_code == 200:
        print(f"✅ Doctor Selected: {resp.json()['message']}")
        print(f"   - Email Status: {resp.json()['status']}")
    else:
        print(f"❌ Doctor Selection Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    try:
        test_doctor_flow()
    except Exception as e:
        print(f"❌ Test crashed: {e}")
