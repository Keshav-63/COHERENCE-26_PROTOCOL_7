# GovGenie Chatbot - Quick Reference Card

## 🚀 One-Liner

**Single endpoint, stateless chatbot with an excellent system prompt that answers citizen queries about public finance using Gemini 2.5 Flash.**

---

## 📍 API Endpoint

```
POST /api/v1/chatbot/ask
```

---

## 📥 Request Format

```json
{
  "query": "Your question here",
  "latitude": 18.5204,
  "longitude": 73.8567
}
```

---

## 📤 Response Format

```json
{
  "answer": "AI-generated answer",
  "location_context": "Pune, Maharashtra",
  "budget_summary": { ... },
  "sources": ["..."],
  "model": "gemini-2.5-flash"
}
```

---

## 🧪 Quick Test

### Option 1: Python
```bash
python examples/simple_chatbot_example.py
```

### Option 2: cURL
```bash
curl -X POST http://localhost:8000/api/v1/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What is my area budget?", "latitude": 18.5204, "longitude": 73.8567}'
```

### Option 3: API Docs
```
http://localhost:8000/docs
```

---

## 🗺️ Test Coordinates

| City | Lat | Long |
|------|-----|------|
| Pune | 18.5204 | 73.8567 |
| Mumbai | 19.0760 | 72.8777 |
| Delhi | 28.6139 | 77.2090 |

---

## ❓ Example Questions

- "What is the budget allocated to my area?"
- "How much has been utilized?"
- "Who are the contractors in my district?"
- "What schemes are running here?"
- "How do I file an RTI request?"

---

## ⚙️ Configuration

```env
GEMINI_API_KEY=your-api-key-here
```
✅ Already configured in `.env`

---

## 🎨 System Prompt Features

✓ Location context (coordinates, district, state)
✓ Budget data (allocations, utilization, schemes)
✓ Vendor information (contractors, ratings)
✓ Citizen-friendly language guidelines
✓ Web search capabilities
✓ RTI filing instructions
✓ Indian law references (FRBM, GFR, CAG)

---

## 📂 Key Files

| File | Purpose |
|------|---------|
| `app/chatbot/api/chatbot.py` | API endpoint |
| `app/chatbot/services/chatbot_service.py` | Core logic + system prompt |
| `app/chatbot/schemas/chatbot.py` | Request/Response models |
| `examples/simple_chatbot_example.py` | Usage example |
| `CHATBOT_SIMPLE_README.md` | Full documentation |

---

## 🔧 How It Works

```
User Query + GPS
    ↓
Detect Location (geospatial query)
    ↓
Fetch Budget Data
    ↓
Fetch Vendor Data
    ↓
Build Enhanced System Prompt
    ↓
Call Gemini 2.5 Flash
    ↓
Return Answer + Context
```

---

## ✅ Status

**COMPLETE & READY TO USE**

No session management. No complexity. Just ask and get answers! 🎉

---

## 📚 Documentation

- **Quick Start:** `CHATBOT_SIMPLE_README.md`
- **Technical Details:** `CHATBOT_FINAL_SUMMARY.md`
- **API Docs:** `http://localhost:8000/docs` (when server running)
