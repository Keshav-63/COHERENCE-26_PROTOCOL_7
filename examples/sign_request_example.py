"""
Example: How to sign API requests with your private key

This script demonstrates how to:
1. Load your private SSH key
2. Sign a request message
3. Make an API call with signature

Requirements:
  pip install cryptography requests
"""

import base64
import json
import sys
from pathlib import Path
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import requests


def load_private_key(key_path: str, password: bytes = None):
    """Load private key from file"""
    with open(key_path, 'rb') as f:
        private_key = serialization.load_ssh_private_key(
            f.read(),
            password=password,
            backend=default_backend()
        )
    return private_key


def sign_message(private_key, message: str) -> str:
    """Sign a message with private key and return base64-encoded signature"""
    message_bytes = message.encode('utf-8')

    # Sign using SHA256
    try:
        # Try RSA signing
        signature = private_key.sign(
            message_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
    except AttributeError:
        # For Ed25519 keys
        signature = private_key.sign(message_bytes)

    # Encode as base64
    return base64.b64encode(signature).decode('utf-8')


def make_signed_request(
    url: str,
    access_token: str,
    private_key_path: str,
    method: str = "POST",
    data: dict = None
):
    """
    Make a signed API request

    Args:
        url: API endpoint URL
        access_token: JWT access token
        private_key_path: Path to private key file
        method: HTTP method (GET, POST, PUT, DELETE)
        data: Request data (for POST/PUT)
    """
    # Load private key
    print(f"Loading private key from: {private_key_path}")
    private_key = load_private_key(private_key_path)

    # Prepare request
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # Prepare message to sign
    if method in ["POST", "PUT", "PATCH"] and data:
        message = json.dumps(data, separators=(',', ':'))
    elif method == "GET":
        # For GET requests, sign the query string or URL path
        from urllib.parse import urlparse
        parsed = urlparse(url)
        message = parsed.query if parsed.query else parsed.path
    else:
        message = ""

    print(f"Signing message: {message}")

    # Sign the message
    signature = sign_message(private_key, message)
    print(f"Signature: {signature[:50]}...")

    # Add signature to headers
    headers["X-Signature"] = signature

    # Make request
    print(f"\nMaking {method} request to: {url}")

    if method == "GET":
        response = requests.get(url, headers=headers)
    elif method == "POST":
        response = requests.post(url, headers=headers, json=data)
    elif method == "PUT":
        response = requests.put(url, headers=headers, json=data)
    elif method == "DELETE":
        response = requests.delete(url, headers=headers)
    else:
        raise ValueError(f"Unsupported method: {method}")

    return response


def main():
    """Example usage"""

    # Configuration
    API_BASE_URL = "http://localhost:8000/api/v1"
    ACCESS_TOKEN = "YOUR_ACCESS_TOKEN_HERE"
    PRIVATE_KEY_PATH = str(Path.home() / ".ssh" / "id_ed25519")  # or id_rsa

    print("="*60)
    print("API Request Signing Example")
    print("="*60)

    # Example 1: Test signature endpoint
    print("\n1. Testing signature verification...")
    test_message = "test message"
    test_url = f"{API_BASE_URL}/security/admin/test-signature"

    private_key = load_private_key(PRIVATE_KEY_PATH)
    signature = sign_message(private_key, test_message)

    response = requests.post(
        test_url,
        headers={
            "Authorization": f"Bearer {ACCESS_TOKEN}",
            "Content-Type": "application/json"
        },
        json={
            "message": test_message,
            "signature": signature
        }
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    # Example 2: Get admin profile (GET request)
    print("\n2. Getting admin profile...")
    profile_url = f"{API_BASE_URL}/security/admin/profile"

    response = make_signed_request(
        url=profile_url,
        access_token=ACCESS_TOKEN,
        private_key_path=PRIVATE_KEY_PATH,
        method="GET"
    )

    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")

    # Example 3: Make a signed POST request
    print("\n3. Making signed POST request...")
    example_url = f"{API_BASE_URL}/budgets/allocate"  # Replace with actual endpoint
    example_data = {
        "department": "health",
        "amount": 1000000,
        "year": 2024
    }

    response = make_signed_request(
        url=example_url,
        access_token=ACCESS_TOKEN,
        private_key_path=PRIVATE_KEY_PATH,
        method="POST",
        data=example_data
    )

    print(f"Status: {response.status_code}")
    try:
        print(f"Response: {response.json()}")
    except:
        print(f"Response: {response.text}")

    print("\n" + "="*60)
    print("Done!")
    print("="*60)


if __name__ == "__main__":
    try:
        main()
    except FileNotFoundError as e:
        print(f"\nError: {e}")
        print("\nPlease update the configuration:")
        print("1. Set your ACCESS_TOKEN")
        print("2. Set your PRIVATE_KEY_PATH")
        print(f"3. Ensure SSH keys exist: ssh-keygen -t ed25519 -C 'your@email.com'")
        sys.exit(1)
    except Exception as e:
        print(f"\nError: {e}")
        sys.exit(1)
