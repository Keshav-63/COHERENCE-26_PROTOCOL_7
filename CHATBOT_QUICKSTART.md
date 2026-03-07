# Chatbot Quick Start Guide

## Setup (5 minutes)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Make sure your `.env` file has the Gemini API key:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

✓ Already configured in your `.env` file!

### 3. Start the Server
```bash
python run.py
```

The server will start at: `http://localhost:8000`

## Test the Chatbot (2 minutes)

### Option 1: Using the Example Script
```bash
python examples/chatbot_example.py
```

### Option 2: Using API Documentation
1. Open browser: `http://localhost:8000/docs`
2. Navigate to **Citizen Chatbot** section
3. Try the endpoints:
   - POST `/api/v1/chatbot/session` - Create session
   - POST `/api/v1/chatbot/message` - Chat with bot

### Option 3: Using cURL

**Step 1: Create a session**
```bash
curl -X POST http://localhost:8000/api/v1/chatbot/session \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 18.5204,
    "longitude": 73.8567
  }'
```

You'll get a response like:
```json
{
  "session_id": "abc-123-def-456",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "location_name": "Pune, Maharashtra",
  "created_at": "2024-03-07T10:00:00Z",
  "message_count": 0,
  "is_active": true
}
```

**Step 2: Send a message**
```bash
curl -X POST http://localhost:8000/api/v1/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "session_id": "abc-123-def-456",
    "message": "What is the budget allocated to my area?"
  }'
```

## Example Questions to Try

### Budget Questions:
- "What is the budget allocated to my area?"
- "How much of the budget has been utilized?"
- "What are the top schemes in my state?"

### Vendor Questions:
- "Who are the contractors working in my area?"
- "What is their performance rating?"
- "How many active contracts are there?"

### Scheme Questions:
- "What government schemes are running in Maharashtra?"
- "Tell me about PM-KISAN scheme in my area"
- "Which ministry manages education schemes?"

### Transparency Questions:
- "How can I find audit reports?"
- "Where can I file an RTI request?"
- "What is the complaint mechanism?"

## Coordinates for Testing

Use these coordinates to test different locations:

| City | Latitude | Longitude |
|------|----------|-----------|
| Mumbai | 19.0760 | 72.8777 |
| Delhi | 28.6139 | 77.2090 |
| Pune | 18.5204 | 73.8567 |
| Bangalore | 12.9716 | 77.5946 |
| Chennai | 13.0827 | 80.2707 |
| Kolkata | 22.5726 | 88.3639 |

## API Workflow

```
1. Create Session (with lat/long)
   ↓
2. Send Message (user query)
   ↓
3. Receive Response (AI-generated answer with sources)
   ↓
4. Continue conversation (maintains context)
   ↓
5. Get History (optional - view full conversation)
   ↓
6. End Session (when done)
```

## Troubleshooting

### Issue: "GEMINI_API_KEY not set"
**Solution:** Add GEMINI_API_KEY to your `.env` file

### Issue: "Chat session not found"
**Solution:** Create a new session first using POST `/api/v1/chatbot/session`

### Issue: "Location not identified"
**Solution:** Check that latitude/longitude are valid coordinates in India

### Issue: No budget data returned
**Solution:** Make sure you have sample data in your MongoDB database

## Next Steps

1. **Test different locations**: Try various cities across India
2. **Ask complex questions**: Test the AI's understanding
3. **Check conversation history**: Use the history endpoint
4. **Integrate with frontend**: Build a chat UI
5. **Add authentication**: Link sessions to user accounts

## Need Help?

- **API Documentation**: `http://localhost:8000/docs`
- **Full Documentation**: See `CHATBOT_README.md`
- **Implementation Details**: See `CHATBOT_IMPLEMENTATION.md`
- **Example Code**: See `examples/chatbot_example.py`

---

**Ready to chat!** 🚀
