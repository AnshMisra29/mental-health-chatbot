import requests
import time

BASE_URL = "http://localhost:5000/api"

def verify_fix():
    print("\n[VERIFICATION] Testing Login & Registration after DB Fix")
    
    # Try logging in with a common test email or registering a new one
    test_email = f"final_test_{int(time.time())}@test.com"
    reg_data = {
        "name": "Final Test User",
        "email": test_email,
        "password": "TestPass123!"
    }
    
    # 1. Register
    resp = requests.post(f"{BASE_URL}/auth/register", json=reg_data)
    if resp.status_code == 201:
        print(f"✅ Registration Success: {test_email}")
    else:
        print(f"❌ Registration Failed: {resp.status_code} - {resp.text}")
        return

    # 2. Login
    login_data = {
        "email": test_email,
        "password": "TestPass123!"
    }
    resp = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    if resp.status_code == 200:
        print("✅ Login Success!")
        print(f"   - Token: {resp.json().get('access_token')[:20]}...")
    else:
        print(f"❌ Login Failed: {resp.status_code} - {resp.text}")

if __name__ == "__main__":
    try:
        verify_fix()
    except Exception as e:
        print(f"❌ Verification crashed: {e}")
