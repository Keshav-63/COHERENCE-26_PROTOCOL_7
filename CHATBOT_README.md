# Citizen Chatbot API - GovGenie

A location-aware chatbot system powered by Gemini 2.5 Flash that helps Indian citizens understand public financial data, budget allocations, and government spending in their area.

## Features

- **Location-Based Queries**: Automatically detects user's location (lat/long) and provides relevant local budget data
- **Public Finance Intelligence**: Answers questions about:
  - Budget allocations for the user's area
  - Government spending and utilization rates
  - Vendor/contractor information
  - Public projects and schemes
  - Financial transparency data

- **Gemini 2.5 Flash Integration**: Uses advanced AI to provide natural, conversational responses
- **Web Search Capability**: Can search for current public data when needed
- **Session Management**: Maintains conversation context across multiple messages

## API Endpoints

### 1. Create Chat Session
```http
POST /api/v1/chatbot/session
```

**Request:**
```json
{
  "latitude": 18.5204,
  "longitude": 73.8567,
  "user_id": "optional-user-id"
}
```

**Response:**
```json
{
  "session_id": "uuid-session-id",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "location_name": "Pune, Maharashtra",
  "created_at": "2024-03-07T10:00:00Z",
  "message_count": 0,
  "is_active": true
}
```

### 2. Send Message
```http
POST /api/v1/chatbot/message
```

**Request:**
```json
{
  "session_id": "uuid-session-id",
  "message": "What is the budget allocated to my area?",
  "latitude": 18.5204,  // optional - to update location
  "longitude": 73.8567  // optional
}
```

**Response:**
```json
{
  "session_id": "uuid-session-id",
  "message": "Based on your location in Pune, Maharashtra, the total state budget for FY 2024-25 is ₹250,000 Crore with 65% utilization...",
  "role": "assistant",
  "timestamp": "2024-03-07T10:01:00Z",
  "sources_used": ["Government Budget Database", "Public Contracts Registry"],
  "location_context": "Pune, Maharashtra"
}
```

### 3. Get Chat History
```http
GET /api/v1/chatbot/history/{session_id}?limit=50
```

**Response:**
```json
{
  "session_id": "uuid-session-id",
  "messages": [
    {
      "role": "user",
      "content": "What is the budget allocated to my area?",
      "timestamp": "2024-03-07T10:00:00Z"
    },
    {
      "role": "assistant",
      "content": "Based on your location...",
      "timestamp": "2024-03-07T10:01:00Z"
    }
  ],
  "total_messages": 2
}
```

### 4. Get Session Info
```http
GET /api/v1/chatbot/session/{session_id}
```

### 5. End Session
```http
DELETE /api/v1/chatbot/session/{session_id}
```

### 6. Get Location Info (Debug)
```http
GET /api/v1/chatbot/location-info?latitude=18.5204&longitude=73.8567
```

## Example Usage Scenarios

### Scenario 1: Budget Information
**User:** "What is the budget allocated to my area?"

**Bot Response:** Provides state/district budget, utilization percentage, and top schemes.

### Scenario 2: Vendor Information
**User:** "Who are the contractors working in my area?"

**Bot Response:** Lists active vendors/contractors with their contract values, performance ratings, and current projects.

### Scenario 3: Scheme Details
**User:** "What government schemes are running in my district?"

**Bot Response:** Details top schemes, their budgets, implementing ministries, and current status.

### Scenario 4: Utilization Queries
**User:** "How much of the budget has been utilized in my state?"

**Bot Response:** Provides budget vs. expenditure data with utilization percentage.

## System Architecture

### Location Context
The chatbot automatically:
1. Identifies the nearest location based on lat/long
2. Fetches district and state information
3. Retrieves budget allocations for that area
4. Finds vendors/contractors operating nearby
5. Includes all this context in the Gemini prompt

### Gemini Integration
- **Model:** Gemini 2.5 Flash
- **System Prompt:** Dynamically built with location and budget data
- **Context:** Includes last 5 messages for conversation continuity
- **Web Search:** Can search for current public data (future enhancement)

### Data Sources
- **Budget Allocations:** State/district budget data from database
- **Vendors:** Active contractors and their contracts
- **Locations:** Geographic hierarchy (State → District → Location)
- **Schemes:** Government schemes and their allocations

## Configuration

Ensure `GEMINI_API_KEY` is set in your `.env` file:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

## Database Models

### ChatSession
- Tracks user sessions with location context
- Stores session metadata and activity

### ChatMessage
- Individual messages in a conversation
- Includes role (user/assistant), content, and timestamp

## Error Handling

- Returns appropriate HTTP status codes
- Provides clear error messages
- Gracefully handles missing location data
- Falls back when Gemini API is unavailable

## Future Enhancements

1. **Web Search Integration:** Real-time search for public data
2. **Voice Support:** Speech-to-text and text-to-speech
3. **Multi-language:** Support for Indian regional languages
4. **RTI Integration:** Help users file RTI requests
5. **Alerts:** Notify users about new projects/spending in their area
6. **Analytics:** Track popular queries and user engagement

## Testing

Use the `/api/v1/chatbot/location-info` endpoint to test location detection and data retrieval before sending messages.

## Security Notes

- No authentication required for public chatbot (citizens can use anonymously)
- Optional `user_id` for logged-in users
- Rate limiting recommended for production
- Session data stored securely in MongoDB
