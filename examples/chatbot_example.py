"""
Example: Using the Citizen Chatbot API
Demonstrates how to interact with the GovGenie chatbot
"""

import requests
import json

# API Base URL
BASE_URL = "http://localhost:8000/api/v1/chatbot"

# Example coordinates for Pune, Maharashtra
PUNE_LAT = 18.5204
PUNE_LONG = 73.8567


def create_session(latitude: float, longitude: float):
    """Create a new chat session"""
    print("Creating chat session...")

    response = requests.post(
        f"{BASE_URL}/session",
        json={
            "latitude": latitude,
            "longitude": longitude
        }
    )

    if response.status_code == 201:
        session_data = response.json()
        print(f"✓ Session created: {session_data['session_id']}")
        print(f"  Location: {session_data['location_name']}")
        return session_data['session_id']
    else:
        print(f"✗ Failed to create session: {response.text}")
        return None


def send_message(session_id: str, message: str):
    """Send a message to the chatbot"""
    print(f"\nYou: {message}")

    response = requests.post(
        f"{BASE_URL}/message",
        json={
            "session_id": session_id,
            "message": message
        }
    )

    if response.status_code == 200:
        data = response.json()
        print(f"\nGovGenie: {data['message']}")
        print(f"\nLocation Context: {data.get('location_context', 'N/A')}")
        print(f"Sources: {', '.join(data.get('sources_used', []))}")
        return data
    else:
        print(f"✗ Failed to send message: {response.text}")
        return None


def get_history(session_id: str):
    """Get chat history"""
    response = requests.get(f"{BASE_URL}/history/{session_id}")

    if response.status_code == 200:
        data = response.json()
        print(f"\n{'='*60}")
        print(f"Chat History ({data['total_messages']} messages)")
        print(f"{'='*60}")

        for msg in data['messages']:
            role = "You" if msg['role'] == 'user' else "GovGenie"
            print(f"\n{role}: {msg['content']}")

        return data
    else:
        print(f"✗ Failed to get history: {response.text}")
        return None


def get_location_info(latitude: float, longitude: float):
    """Get location information (debug)"""
    response = requests.get(
        f"{BASE_URL}/location-info",
        params={
            "latitude": latitude,
            "longitude": longitude
        }
    )

    if response.status_code == 200:
        data = response.json()
        print("\n" + "="*60)
        print("Location Information")
        print("="*60)
        print(json.dumps(data, indent=2))
        return data
    else:
        print(f"✗ Failed to get location info: {response.text}")
        return None


def main():
    """Main example flow"""
    print("\n" + "="*60)
    print("GovGenie Chatbot - Example Usage")
    print("="*60)

    # Step 1: Get location info (optional - for debugging)
    print("\n[1] Getting location information...")
    get_location_info(PUNE_LAT, PUNE_LONG)

    # Step 2: Create a chat session
    print("\n[2] Creating chat session...")
    session_id = create_session(PUNE_LAT, PUNE_LONG)

    if not session_id:
        print("Cannot proceed without session")
        return

    # Step 3: Ask questions
    print("\n[3] Asking questions...")

    questions = [
        "What is the budget allocated to my area?",
        "How much has been utilized?",
        "Who are the top contractors working in my area?",
        "What are the major schemes running in Maharashtra?",
    ]

    for question in questions:
        send_message(session_id, question)
        print("\n" + "-"*60)
        input("Press Enter to continue...")

    # Step 4: Get full chat history
    print("\n[4] Getting chat history...")
    get_history(session_id)

    print("\n" + "="*60)
    print("Example completed!")
    print("="*60)


if __name__ == "__main__":
    main()
