# CodeSchedule — API Reference

Base URL (dev): `http://localhost:4000/api`
Base URL (prod): `https://api.codeschedule.app/api`

All request and response bodies are JSON. All authed endpoints expect a
`Authorization: Bearer <jwt>` header.

---

## Response envelope

Success:
```json
{ "data": <payload> }
```

Error:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email or password is incorrect"
  }
}
```

### Error codes

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body failed Zod validation (includes `details[]`) |
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `INVALID_CREDENTIALS` | 401 | Login failed |
| `FORBIDDEN` | 403 | Authed but not allowed |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate (e.g. email already registered) |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unhandled server error |

---

## 1. Auth

### POST `/api/auth/register`
Creates a new user and returns a JWT.

Request:
```json
{
  "email": "dev@example.com",
  "password": "at-least-8-chars",
  "name": "Ada Lovelace"
}
```

Response `201`:
```json
{
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": "651f...",
      "email": "dev@example.com",
      "name": "Ada Lovelace",
      "createdAt": "2026-04-22T10:00:00Z"
    }
  }
}
```

Errors: `VALIDATION_ERROR`, `CONFLICT` (email already registered).

---

### POST `/api/auth/login`
Request:
```json
{ "email": "dev@example.com", "password": "..." }
```

Response `200`: same shape as `register`.

Errors: `VALIDATION_ERROR`, `INVALID_CREDENTIALS`.

---

### POST `/api/auth/logout`
Authed. Client-side token disposal; server is stateless so this is a no-op
that exists for future token-blacklist support.

Response `204` — no body.

---

### GET `/api/auth/me`
Authed. Returns the current user.

Response `200`:
```json
{
  "data": {
    "id": "651f...",
    "email": "dev@example.com",
    "name": "Ada Lovelace",
    "createdAt": "2026-04-22T10:00:00Z"
  }
}
```

---

## 2. Users

### PATCH `/api/users/me`
Authed. Update profile fields.

Request (all optional):
```json
{ "name": "Ada L.", "timezone": "Europe/London" }
```

Response `200`: updated user.

---

### PATCH `/api/users/me/password`
Authed.

Request:
```json
{ "currentPassword": "...", "newPassword": "..." }
```

Response `204`.

Errors: `VALIDATION_ERROR`, `INVALID_CREDENTIALS`.

---

### DELETE `/api/users/me`
Authed. Deletes the user and cascades to all subscriptions.

Response `204`.

---

## 3. Subscriptions (Schedules)

A **subscription** pairs a user with a technology and a schedule. One user
may have many subscriptions.

### GET `/api/subscriptions`
Authed. Lists the current user's subscriptions.

Response `200`:
```json
{
  "data": [
    {
      "id": "6520...",
      "technology": "javascript",
      "timezone": "America/New_York",
      "deliveryTimes": ["08:00"],
      "status": "active",
      "currentTopicIndex": 14,
      "lastSentAt": "2026-04-22T12:00:00Z",
      "createdAt": "2026-04-08T09:00:00Z"
    }
  ]
}
```

---

### POST `/api/subscriptions`
Authed. Creates a subscription.

Request:
```json
{
  "technology": "python",
  "timezone": "America/New_York",
  "deliveryTimes": ["08:00"]
}
```

Validation:
- `technology` must match a file in `packages/topics/`.
- `timezone` must be a valid IANA string.
- `deliveryTimes[]` must be 1–3 entries, each `HH:MM` 24-hour.

Response `201`:
```json
{
  "data": {
    "id": "6520...",
    "technology": "python",
    "timezone": "America/New_York",
    "deliveryTimes": ["08:00"],
    "status": "active",
    "currentTopicIndex": 0,
    "lastSentAt": null,
    "createdAt": "2026-04-22T10:00:00Z"
  }
}
```

---

### GET `/api/subscriptions/:id`
Authed. Returns a single subscription.

Errors: `NOT_FOUND`, `FORBIDDEN` (if the subscription is owned by a different user).

---

### PATCH `/api/subscriptions/:id`
Authed. Updates mutable fields.

Request (all optional):
```json
{
  "timezone": "Europe/Berlin",
  "deliveryTimes": ["07:30", "19:00"],
  "status": "paused"
}
```

`technology` and `currentTopicIndex` are **not** editable here — they require
their own endpoints below.

Response `200`: updated subscription.

---

### POST `/api/subscriptions/:id/pause`
Authed. Convenience endpoint — equivalent to `PATCH { status: "paused" }`.

Response `200`.

### POST `/api/subscriptions/:id/resume`
Authed. Convenience endpoint — equivalent to `PATCH { status: "active" }`.

Response `200`.

### POST `/api/subscriptions/:id/reset`
Authed. Resets `currentTopicIndex` to `0`.

Response `200`.

---

### DELETE `/api/subscriptions/:id`
Authed. Deletes the subscription.

Response `204`.

---

## 4. Topics (read-only catalog)

### GET `/api/topics`
Public. Returns the list of available technologies.

Response `200`:
```json
{
  "data": [
    { "technology": "javascript", "title": "JavaScript", "topicCount": 120 },
    { "technology": "python",     "title": "Python",     "topicCount": 98  }
  ]
}
```

### GET `/api/topics/:technology`
Public. Returns topic metadata (titles only — body is paywalled to the
email delivery path).

Response `200`:
```json
{
  "data": {
    "technology": "javascript",
    "title": "JavaScript",
    "topics": [
      { "index": 0, "title": "What is JavaScript?" },
      { "index": 1, "title": "Variables: var, let, const" }
    ]
  }
}
```

---

## 5. Unsubscribe (public, token-based)

### GET `/api/unsubscribe/:token`
Public. Used by one-click unsubscribe links in emails.
`:token` is a signed HMAC of `{ subscriptionId, userId }`.

Response `200`:
```json
{ "data": { "status": "paused" } }
```

Errors: `NOT_FOUND` (invalid/expired token).

---

## 6. Health

### GET `/api/health`
Public. Liveness probe.

Response `200`:
```json
{ "data": { "status": "ok", "uptime": 12345, "db": "connected" } }
```
