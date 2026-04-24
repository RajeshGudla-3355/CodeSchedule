# CodeSchedule — Database Schema

**Engine:** MongoDB Atlas (M0 free tier at MVP).
**ODM:** Mongoose 8 with strict schemas.
**Conventions:**
- All collections include `createdAt` and `updatedAt` (`{ timestamps: true }`).
- All `_id` fields are ObjectIds; exposed to the API as string `id`.
- Enums are stored as lowercase strings.

---

## Collections

1. [`users`](#1-users)
2. [`subscriptions`](#2-subscriptions)
3. [`emailLogs`](#3-emaillogs)
4. [`unsubscribeTokens`](#4-unsubscribetokens)

Topics themselves are **not** stored in MongoDB — they live as JSON files in
`packages/topics/`. See [ARCHITECTURE.md](./ARCHITECTURE.md#6-topic-service).

---

## 1. `users`

One document per registered account.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | yes | auto | |
| `email` | String | yes | — | Lowercased, trimmed, unique index |
| `passwordHash` | String | yes | — | bcrypt, cost 12. Never returned by API |
| `name` | String | yes | — | 1–60 chars |
| `timezone` | String | no | `"UTC"` | Default IANA timezone used when creating subscriptions |
| `role` | String enum | yes | `"user"` | `"user"` \| `"admin"` |
| `emailVerified` | Boolean | yes | `false` | Reserved for V2 (not enforced in MVP) |
| `createdAt` | Date | yes | auto | |
| `updatedAt` | Date | yes | auto | |

### Indexes
- `{ email: 1 }` unique
- `{ createdAt: -1 }` — admin listing

### Example
```json
{
  "_id": "651f2a...",
  "email": "dev@example.com",
  "passwordHash": "$2b$12$...",
  "name": "Ada Lovelace",
  "timezone": "Europe/London",
  "role": "user",
  "emailVerified": false,
  "createdAt": "2026-04-22T10:00:00Z",
  "updatedAt": "2026-04-22T10:00:00Z"
}
```

---

## 2. `subscriptions`

One document per `(user, technology)` pair. A user may have many.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | yes | auto | |
| `userId` | ObjectId | yes | — | Ref → `users._id` |
| `technology` | String | yes | — | Must match a file in `packages/topics/` (e.g. `"javascript"`) |
| `timezone` | String | yes | — | IANA timezone |
| `deliveryTimes` | [String] | yes | — | Array of 1–3 `HH:MM` 24-hour strings |
| `status` | String enum | yes | `"active"` | `"active"` \| `"paused"` \| `"completed"` |
| `currentTopicIndex` | Number | yes | `0` | Index into the topic JSON array; advances after each send |
| `lastSentAt` | Date \| null | yes | `null` | Last successful send (used for idempotency) |
| `nextSendDueAt` | Date \| null | yes | `null` | Cached next-due UTC time; recomputed on schedule change and after send |
| `lastError` | String \| null | no | `null` | Populated when a send fails |
| `createdAt` | Date | yes | auto | |
| `updatedAt` | Date | yes | auto | |

### Validation
- `technology`: `/^[a-z0-9-]+$/`, 1–32 chars.
- `deliveryTimes[]`: each matches `/^([01]\d|2[0-3]):[0-5]\d$/`.
- `deliveryTimes.length` between 1 and 3.
- `(userId, technology)` is unique — a user can't have two subscriptions to
  the same technology.

### Indexes
- `{ userId: 1 }` — list a user's subscriptions
- `{ userId: 1, technology: 1 }` unique
- `{ status: 1, nextSendDueAt: 1 }` — scheduler tick query
- `{ status: 1, lastSentAt: 1 }` — admin / reporting

### Example
```json
{
  "_id": "6520ab...",
  "userId": "651f2a...",
  "technology": "python",
  "timezone": "America/New_York",
  "deliveryTimes": ["08:00"],
  "status": "active",
  "currentTopicIndex": 14,
  "lastSentAt": "2026-04-22T12:00:00Z",
  "nextSendDueAt": "2026-04-23T12:00:00Z",
  "lastError": null,
  "createdAt": "2026-04-08T09:00:00Z",
  "updatedAt": "2026-04-22T12:00:00Z"
}
```

---

## 3. `emailLogs`

Append-only log of every email attempt (success or failure). Useful for
debugging delivery issues and computing open/bounce stats later.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | yes | auto | |
| `subscriptionId` | ObjectId | yes | — | Ref → `subscriptions._id` |
| `userId` | ObjectId | yes | — | Denormalized for easy per-user querying |
| `technology` | String | yes | — | Denormalized |
| `topicIndex` | Number | yes | — | Topic sent (or attempted) |
| `topicTitle` | String | yes | — | Snapshot at send time |
| `recipient` | String | yes | — | Email address at send time |
| `status` | String enum | yes | — | `"sent"` \| `"failed"` |
| `providerMessageId` | String \| null | no | `null` | From Nodemailer response |
| `errorMessage` | String \| null | no | `null` | Populated when `status = "failed"` |
| `sentAt` | Date | yes | auto | |

### Indexes
- `{ subscriptionId: 1, sentAt: -1 }`
- `{ userId: 1, sentAt: -1 }`
- `{ status: 1, sentAt: -1 }` — failure dashboards
- TTL on `sentAt` with `expireAfterSeconds: 60*60*24*180` (180 days) to
  keep the collection bounded.

---

## 4. `unsubscribeTokens`

One document per one-click unsubscribe token. Short-lived; a new one is
generated for each email.

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | yes | auto | |
| `token` | String | yes | — | 32-byte hex, unique index |
| `subscriptionId` | ObjectId | yes | — | Ref → `subscriptions._id` |
| `userId` | ObjectId | yes | — | Ref → `users._id` |
| `expiresAt` | Date | yes | — | 30 days from creation; TTL index |
| `usedAt` | Date \| null | yes | `null` | Set when the token is redeemed |
| `createdAt` | Date | yes | auto | |

### Indexes
- `{ token: 1 }` unique
- `{ expiresAt: 1 }` TTL (`expireAfterSeconds: 0`)

---

## Relationships

```
users  1 ────────── N  subscriptions  1 ────────── N  emailLogs
   └─────────────────────── N  unsubscribeTokens
                              (via subscriptionId)
```

Deletion cascades (enforced in the service layer, not by MongoDB):
- Delete `user` → delete all their `subscriptions`, `emailLogs`,
  `unsubscribeTokens`.
- Delete `subscription` → delete its `unsubscribeTokens`. `emailLogs` are
  kept for analytics (anonymized by clearing `recipient`).
