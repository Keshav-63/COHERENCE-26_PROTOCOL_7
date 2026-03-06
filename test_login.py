"""
Test Login Functionality
"""

import asyncio
import httpx

async def test_login():
    """Test super admin login"""
    print("="*80)
    print("TESTING LOGIN")
    print("="*80)

    # Login credentials
    login_data = {
        "email": "admin@gov.in",
        "password": "Admin123"
    }

    # Make login request
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "http://localhost:8000/api/v1/auth/login",
                json=login_data
            )

            if response.status_code == 200:
                data = response.json()
                print("\n[SUCCESS] Login Successful!")
                print(f"\nAccess Token: {data['access_token'][:50]}...")
                print(f"Refresh Token: {data['refresh_token'][:50]}...")
                print(f"Token Type: {data['token_type']}")
                print(f"Expires In: {data['expires_in']} seconds")

                print(f"\nUser Details:")
                user = data['user']
                print(f"  ID: {user['id']}")
                print(f"  Email: {user['email']}")
                print(f"  Name: {user['full_name']}")
                print(f"  Role: {user['role']}")
                print(f"  Active: {user['is_active']}")
                print(f"  Verified: {user['is_verified']}")

                print("\n[OK] You can now use the access token to make authenticated requests!")

            else:
                print(f"\n[ERROR] Login Failed!")
                print(f"Status Code: {response.status_code}")
                print(f"Response: {response.text}")

        except httpx.ConnectError:
            print("\n[ERROR] Could not connect to server!")
            print("Make sure the server is running: python run.py")
        except Exception as e:
            print(f"\n[ERROR] {str(e)}")

    print("\n" + "="*80)

if __name__ == "__main__":
    asyncio.run(test_login())
