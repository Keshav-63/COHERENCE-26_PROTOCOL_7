# GovGenie Citizen Chatbot - Simple API

A single-endpoint, stateless chatbot powered by **Gemini 2.5 Flash** that helps Indian citizens understand public financial data and budget allocations in their area.

## Quick Start

### 1. Installation
```bash
pip install -r requirements.txt
```

### 2. Configuration
Ensure `GEMINI_API_KEY` is set in your `.env` file (already configured ✓)

### 3. Start Server
```bash
python run.py
```

### 4. Test the Chatbot
```bash
python examples/simple_chatbot_example.py
```

## API Endpoint

### Single Endpoint: `/api/v1/chatbot/ask`

**Method:** `POST`

**Request:**
```json
{
  "query": "What is the budget allocated to my area?",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

**Response:**
```json
{
  "answer": "Based on your location in Pune, Maharashtra, the total state budget for FY 2024-25 is ₹250,000 Crore with a utilization rate of 65%. The top schemes in your area include...",
  "location_context": "Pune, Pune District, Maharashtra",
  "budget_summary": {
    "state": "Maharashtra",
    "district": "Pune",
    "total_budget_cr": 250000.00,
    "total_expenditure_cr": 162500.00,
    "utilization_pct": 65.0,
    "top_schemes": [...]
  },
  "sources": [
    "Government Budget Database",
    "Public Contracts Registry",
    "Location Geospatial Data"
  ],
  "model": "gemini-2.5-flash"
}
```

## Features

### ✓ Location-Aware Intelligence
- Automatically identifies nearest location, district, and state from GPS coordinates
- Fetches budget data specific to the user's area
- Shows active contractors and vendors operating nearby

### ✓ Comprehensive System Prompt
The chatbot is given rich context including:
- User's exact location and demographic data
- Total state/district budget and utilization rates
- Top 5 government schemes with budget allocations
- Active contractors with performance ratings
- Nearby public projects

### ✓ Smart Responses
- Clear, citizen-friendly language
- References Indian public finance laws (FRBM, RTI, GFR)
- Explains technical terms in simple language
- Suggests actionable next steps (how to file RTI, access portals)
- Provides specific data when available

### ✓ No Session Management
- Stateless design - no need to create/manage sessions
- Each query is independent
- Simple to integrate with any frontend

## Example Queries

### Budget Questions
```json
{
  "query": "What is the budget allocated to my area?",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

### Utilization Questions
```json
{
  "query": "How much of the budget has been utilized?",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

### Vendor Questions
```json
{
  "query": "Who are the contractors working in my district?",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

### Scheme Questions
```json
{
  "query": "What government schemes are running in my state?",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

### Transparency Questions
```json
{
  "query": "How can I access public audit reports?",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

## Testing with cURL

```bash
curl -X POST http://localhost:8000/api/v1/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the budget allocated to my area?",
    "latitude": 18.5204,
    "longitude": 73.8567
  }'
```

## Testing with Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/chatbot/ask",
    json={
        "query": "What is the budget allocated to my area?",
        "latitude": 18.5204,
        "longitude": 73.8567
    }
)

print(response.json()["answer"])
```

## Test Coordinates

| City | Latitude | Longitude |
|------|----------|-----------|
| Mumbai | 19.0760 | 72.8777 |
| Delhi | 28.6139 | 77.2090 |
| Pune | 18.5204 | 73.8567 |
| Bangalore | 12.9716 | 77.5946 |
| Chennai | 13.0827 | 80.2707 |
| Kolkata | 22.5726 | 88.3639 |

## System Prompt Features

The chatbot uses an enhanced system prompt that includes:

### 📊 Rich Context
- Location hierarchy (Location → District → State)
- Population demographics
- Budget allocations and expenditure
- Utilization percentages and remaining budgets

### 👥 Vendor Information
- Active contractors and their types (MSME, Private, etc.)
- Contract values and counts
- Performance ratings
- Nearby projects

### 📚 Comprehensive Guidelines
- Answer in citizen-friendly language
- Reference Indian laws and regulations
- Explain technical terms
- Provide actionable next steps
- Cite sources when using web search data

### 🔍 Web Search Capability
The prompt instructs Gemini to use web search when needed for:
- Recent government announcements
- Public project updates
- Contractor performance news
- CAG audit reports
- RTI disclosures

## API Documentation

Visit `http://localhost:8000/docs` when the server is running to see the interactive API documentation.

## Architecture

```
User Query + GPS Location
         ↓
    API Endpoint (/ask)
         ↓
  Location Detection
  (MongoDB Geospatial Query)
         ↓
  Budget Data Retrieval
  (State/District Allocations)
         ↓
  Vendor Data Retrieval
  (Active Contractors)
         ↓
  Build Enhanced System Prompt
  (All context combined)
         ↓
    Gemini 2.5 Flash
    (AI Response Generation)
         ↓
   Formatted Response
   (Answer + Context + Sources)
```

## Error Handling

The API handles errors gracefully:

- Missing GEMINI_API_KEY → Clear error message
- Location not found → Uses approximate state data
- No budget data → Explains how to find it
- Gemini API error → User-friendly fallback

## Performance

- **Response time:** 2-5 seconds (including Gemini API call)
- **Concurrent requests:** Supported (stateless design)
- **Rate limiting:** Recommended for production

## Security

- No authentication required (public chatbot)
- Input validation on all fields
- SQL injection safe (MongoDB ODM)
- XSS safe (API only, no HTML rendering)

## Future Enhancements

1. **Caching:** Cache responses for common queries
2. **Rate Limiting:** Implement per-IP rate limits
3. **Analytics:** Track popular queries
4. **Multi-language:** Support regional Indian languages
5. **Voice:** Add speech-to-text support

---

**Ready to use!** 🚀

For more details, see `CHATBOT_IMPLEMENTATION.md`
