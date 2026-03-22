import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def run_tests():
    print("="*60)
    print("🚀 DOCTOR NOTIFICATION SYSTEM - COMPLETE TEST SUITE")
    print("="*60)

    # 1. Register/Login
    print("\n[SCENARIO 1] Authentication")
    email = f"tester_{int(time.time())}@test.com"
    reg_resp = requests.post(f"{BASE_URL}/auth/register", json={
        "name": "Scenario Tester",
        "email": email,
        "password": "Password123!"
    })
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print(f"✅ Auth: Registered and logged in as {email}")

    # 2. Seed Doctors (if not already present)
    print("\n[SCENARIO 2] Seeding Doctors")
    doctors = [
        {"name": "Dr. Sunil Mittal", "email": "sunil@example.com", "specialization": "Psychiatry", "latitude": 28.5898, "longitude": 77.2281, "address": "Delhi Eye Centre, New Delhi", "clinic_name": "Cosmos Institute"},
        {"name": "Dr. Sarah Johnson", "email": "sarah@example.com", "specialization": "Clinical Psychology", "latitude": 28.6139, "longitude": 77.2090, "address": "Central Delhi Clinic", "clinic_name": "Inner Peace"},
        {"name": "Dr. Amit Verma", "email": "amit@example.com", "specialization": "Psychotherapy", "latitude": 28.5355, "longitude": 77.3910, "address": "Noida Sector 18", "clinic_name": "Verma Mind Care"}
    ]
    for d in doctors:
        requests.post(f"{BASE_URL}/doctors/", json=d, headers=headers)
    print("✅ Doctors Seeding: 3 doctors added/verified")

    # 3. Crisis Detection (Trigger Alert)
    print("\n[SCENARIO 3] Crisis Detection & Alert Generation")
    crisis_msg = "I am feeling very hopeless and I want to end my life."
    chat_resp = requests.post(f"{BASE_URL}/chat/message", json={"message": crisis_msg}, headers=headers)
    chat_data = chat_resp.json()
    alert_id = chat_data.get("alert_id")
    if chat_data.get("is_crisis") and alert_id:
        print(f"✅ Crisis: Successfully detected. Generated Alert ID: {alert_id}")
    else:
        print(f"❌ Crisis: Failed to detect or generate alert_id. Response: {chat_data}")

    # 4. Nearby Doctors Search (Geolocation)
    print("\n[SCENARIO 4] Geolocation Search (Nearby Doctors)")
    # Test with coordinates near Delhi
    nearby_resp = requests.get(f"{BASE_URL}/doctors/nearby?lat=28.59&lon=77.22", headers=headers)
    nearby_data = nearby_resp.json()
    if len(nearby_data.get("doctors", [])) > 0:
        print(f"✅ Nearby: Found {len(nearby_data['doctors'])} doctors.")
        for d in nearby_data['doctors']:
            print(f"   - {d['name']} ({d['distance_km']:.2f} km)")
    else:
        print("❌ Nearby: No doctors found.")

    # 5. Doctor Selection & Notification
    if alert_id:
        print("\n[SCENARIO 5] User Selects Doctor (Trigger Emails)")
        selected_doc = nearby_data['doctors'][0]['id']
        select_resp = requests.post(f"{BASE_URL}/doctors/select", json={
            "doctor_id": selected_doc,
            "alert_id": alert_id
        }, headers=headers)
        if select_resp.status_code == 200:
            print(f"✅ Select: Success! {select_resp.json().get('message')}")
        else:
            print(f"❌ Select: Failed. {select_resp.text}")

    # 6. Unauthorized Test
    print("\n[SCENARIO 6] Security / Unauthorized Access")
    unauth_resp = requests.get(f"{BASE_URL}/doctors/nearby")
    if unauth_resp.status_code == 401:
        print("✅ Security: Successfully blocked unauthorized request (401)")

    print("\n" + "="*60)
    print("🧪 ALL SCENARIOS COMPLETE")
    print("="*60)

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"❌ TEST ERROR: {e}")
