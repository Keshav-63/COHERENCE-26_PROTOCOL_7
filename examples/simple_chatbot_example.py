"""
Simple Chatbot Example - Single Endpoint
Shows how to use the simplified GovGenie chatbot API
"""

import requests
import json

# API Base URL
BASE_URL = "http://localhost:8000/api/v1/chatbot"

# Example coordinates for different cities
LOCATIONS = {
    "Pune": {"latitude": 18.5204, "longitude": 73.8567},
    "Mumbai": {"latitude": 19.0760, "longitude": 72.8777},
    "Delhi": {"latitude": 28.6139, "longitude": 77.2090},
    "Bangalore": {"latitude": 12.9716, "longitude": 77.5946},
}


def ask_question(query: str, latitude: float, longitude: float):
    """
    Ask a question to GovGenie chatbot
    """
    print(f"\n{'='*80}")
    print(f"📍 Location: ({latitude}, {longitude})")
    print(f"❓ Question: {query}")
    print(f"{'='*80}\n")

    response = requests.post(
        f"{BASE_URL}/ask",
        json={
            "query": query,
            "latitude": latitude,
            "longitude": longitude
        }
    )

    if response.status_code == 200:
        data = response.json()

        print(f"🤖 GovGenie Response:\n")
        print(data["answer"])
        print(f"\n{'─'*80}")
        print(f"📌 Location Context: {data.get('location_context', 'N/A')}")
        print(f"📊 Budget Summary: {json.dumps(data.get('budget_summary'), indent=2) if data.get('budget_summary') else 'N/A'}")
        print(f"📚 Sources: {', '.join(data.get('sources', []))}")
        print(f"🤖 Model: {data.get('model')}")
        print(f"{'─'*80}\n")

    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)


def main():
    """Main example flow"""
    print("\n" + "="*80)
    print("GovGenie Chatbot - Simple API Example")
    print("="*80)

    # Choose a location
    city = "Pune"
    location = LOCATIONS[city]

    # Example questions
    questions = [
        "What is the budget allocated to my area?",
        "How much of the budget has been utilized so far?",
        "Who are the top contractors working in my district?",
        "What are the major government schemes running in my state?",
        "How can I file an RTI request to get more information?",
    ]

    # Ask each question
    for i, question in enumerate(questions, 1):
        print(f"\n[Question {i}/{len(questions)}]")
        ask_question(question, location["latitude"], location["longitude"])

        if i < len(questions):
            input("\nPress Enter to continue to next question...")

    print("\n" + "="*80)
    print("✓ Example completed!")
    print("="*80)


if __name__ == "__main__":
    main()
