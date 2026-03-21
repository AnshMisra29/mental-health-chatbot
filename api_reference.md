# Mental Health Chatbot — Backend API Reference

**Base URL:** `http://localhost:5000`  
**Auth:** JWT Bearer token — include in all 🔒 protected requests:
```
Authorization: Bearer <access_token>
```

---

## 🔑 Auth  `/api/auth`

### `POST /api/auth/register`
Register a new user. Returns a token immediately (auto-login after signup).

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
```
**Response `201`:**
```json
{
  "message": "User registered successfully",
  "access_token": "<jwt>",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

---

### `POST /api/auth/login`
Login with email & password.

**Request body:**
```json
{ "email": "john@example.com", "password": "yourpassword" }
```
**Response `200`:**
```json
{
  "message": "Login successful",
  "access_token": "<jwt>",
  "user": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

---

### 🔒 `GET /api/auth/me`
Get the currently logged-in user's profile.

**Response `200`:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-01T10:00:00"
}
```

---

## 💬 Chat  `/api/chat`

### 🔒 `POST /api/chat/message`
Send a message to the chatbot. Returns the bot's response along with emotion & risk analysis.

**Request body:**
```json
{ "message": "I've been feeling really anxious lately" }
```
**Response `200`:**
```json
{
  "response": "I'm sorry to hear that...",
  "emotion": "Anxiety",
  "risk_level": "medium",
  "is_crisis": false
}
```

---

### 🔒 `POST /api/chat/reset`
Clear the current conversation context (start fresh).

**Response `200`:**
```json
{ "message": "Conversation history cleared" }
```

---

## 👨‍⚕️ Doctors  `/api/doctors`

### `POST /api/doctors/`
Register a new doctor (Admin endpoint).
- **Auth**: JWT Required
- **Body**:
  ```json
  {
    "name": "Dr. Smith",
    "email": "doctor@example.com",
    "phone": "+91-9876543210",
    "specialization": "Psychiatry",
    "clinic_name": "Mind Care",
    "address": "Baner, Pune",
    "latitude": 18.5597,
    "longitude": 73.7799
  }
  ```

### `GET /api/doctors/`
List all registered doctors.
- **Auth**: JWT Required

### `GET /api/doctors/nearby`
Find 3 closest doctors based on geolocation.
- **Auth**: JWT Required
- **Query Params**: `lat`, `lon` (floats)
- **Response**:
  ```json
  {
    "doctors": [
      {
        "id": 1,
        "name": "Dr. Smith",
        "distance_km": 1.2,
        "maps_url": "https://maps.google.com/?q=18.5597,73.7799",
        "..." : "..."
      }
    ]
  }
  ```

### `POST /api/doctors/select`
User selects a doctor to notify. Triggers emails to both parties.
- **Auth**: JWT Required
- **Body**:
  ```json
  {
    "doctor_id": 1,
    "alert_id": 10
  }
  ```

---

### 🔒 `GET /api/chat/history`
Get paginated chat history for the logged-in user.

**Query params:**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `1` | Page number |
| `per_page` | `50` | Results per page |

**Response `200`:**
```json
{
  "total": 120,
  "pages": 3,
  "current_page": 1,
  "per_page": 50,
  "history": [
    {
      "id": 45,
      "message": "I feel sad",
      "bot_response": "I'm here for you...",
      "emotion": "Sadness",
      "risk_level": "low",
      "is_crisis": false,
      "timestamp": "2024-03-21T10:30:00",
      "model_metadata": { ... }
    }
  ]
}
```

---

## 🚨 Alerts  `/api/alerts`

### 🔒 `GET /api/alerts/`
Get all alerts for the logged-in user (most recent first).

**Response `200`:**
```json
{
  "alerts": [
    {
      "id": 3,
      "risk_level": "high",
      "reason": "Detected suicidal ideation",
      "triggered_at": "2024-03-21T09:15:00",
      "notified": true
    }
  ]
}
```

---

### 🔒 `GET /api/alerts/<alert_id>`
Get a single alert by ID.

**Response `200`:**
```json
{
  "id": 3,
  "risk_level": "high",
  "reason": "Detected suicidal ideation",
  "triggered_at": "2024-03-21T09:15:00",
  "notified": true
}
```

---

### 🔒 `DELETE /api/alerts/<alert_id>`
Delete an alert by ID.

**Response `200`:**
```json
{ "message": "Alert deleted successfully" }
```

---

## 📊 Dashboard  `/api/dashboard`

> All dashboard endpoints are 🔒 protected and return data scoped to the logged-in user.

### `GET /api/dashboard/summary`
Overview stats — total chats, total alerts, risk counts.

```json
{ "data": { "total_chats": 120, "total_alerts": 5, "high_risk": 2, "medium_risk": 2, "low_risk": 1 } }
```

---

### `GET /api/dashboard/recent-alerts`
Last 5 alerts — for an alert feed widget.

```json
{ "data": [ { "id": 3, "risk_level": "high", "reason": "...", "triggered_at": "..." } ] }
```

---

### `GET /api/dashboard/alert-breakdown`
Alert counts grouped by risk level — for bar/pie charts.

```json
{ "data": { "high": 2, "medium": 2, "low": 1 } }
```

---

### `GET /api/dashboard/emotion-distribution`
Count of each emotion across all chats — for pie charts.

```json
{ "data": { "Anxiety": 40, "Sadness": 30, "Normal": 25, "Anger": 15, "Suicidal": 5, ... } }
```

---

### `GET /api/dashboard/risk-distribution`
Count of chats per risk level — for charts.

```json
{ "data": { "low": 80, "medium": 30, "high": 10 } }
```

---

### `GET /api/dashboard/chat-stats`
Chat session statistics — message count, last active date.

```json
{ "data": { "total_messages": 120, "last_chat": "2024-03-21T10:30:00" } }
```

---

### `GET /api/dashboard/emotion-trend`
Emotion counts grouped by date — for a time-series line chart.

```json
{ "data": [ { "date": "2024-03-20", "emotion": "Anxiety", "count": 5 }, ... ] }
```

---

### `GET /api/dashboard/crisis-events`
Timeline of the last 10 CRITICAL-level crisis alerts.

```json
{ "data": [ { "id": 3, "triggered_at": "...", "reason": "..." }, ... ] }
```

---

## ⚙️ Utility

### `GET /api/health`
Check if the server is up.
```json
{ "status": "ok", "message": "Mental Health Chatbot API is running", "model_ready": true }
```

### `GET /api/status`
Check ML model loading status.
```json
{ "ready": true, "device": "cpu", "error": null }
```

---

## Common Error Responses

| Code | Meaning |
|------|---------|
| `400` | Bad request / missing fields |
| `401` | Unauthorized — missing or invalid token |
| `404` | Resource not found |
| `500` | Internal server error |
