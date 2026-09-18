# Local API quick reference

## Run

Requires Node.js 22 or later. No packages, credentials, containers, or external services are needed.

```sh
npm start
```

Default base URL: `http://127.0.0.1:4317`. To select another local port:

```sh
node server.mjs --port 4318
```

State is held in memory and cleared when the process stops. Create a fresh policy for each independent test or load workflow; no global reset is required. The server uses fixed fixture dates and immediately exposes created records.

Requests and responses use JSON. Error responses have this shape:

```json
{"error":{"code":"POLICY_NOT_FOUND","message":"Policy not found."}}
```

## Endpoints

| Method and path | Request | Response |
| --- | --- | --- |
| `GET /health` | None | `200 {"status":"ok"}` |
| `POST /test-support/policies` | `{}` | `201`: unique `id`, `status: "ACTIVE"`, `expectedEffectiveDate: "2030-01-01"` |
| `POST /renewals` | See below | `201`: newly created renewal |
| `GET /renewals/{id}` | None | `200`: that renewal, or `404 RENEWAL_NOT_FOUND` |

To request a renewal, supply a nonempty `Idempotency-Key` header and this JSON body, using a policy created by the fixture endpoint:

```json
{
  "policyId": "<created policy id>",
  "effectiveDate": "2030-01-01",
  "paymentMethod": "card_on_file"
}
```

A successful response contains:

```json
{
  "id": "<unique renewal id>",
  "policyId": "<created policy id>",
  "effectiveDate": "2030-01-01",
  "paymentMethod": "card_on_file",
  "status": "PENDING"
}
```

## Contract

- All three request fields are required nonempty strings. Missing/invalid fields or a missing/empty idempotency key produce `400 INVALID_REQUEST`. Malformed JSON produces `400 INVALID_JSON`.
- An unknown policy produces `404 POLICY_NOT_FOUND`.
- The effective date must equal that policy's `expectedEffectiveDate`; otherwise, `422 INVALID_EFFECTIVE_DATE`.
- Only `card_on_file` is supported; other payment methods produce `422 UNSUPPORTED_PAYMENT_METHOD`.
- Repeating a successful request with the same key and the same three field values returns `200` and the original renewal. It creates no additional renewal. Changing those values while reusing the key returns `409 IDEMPOTENCY_CONFLICT`. Failed requests do not reserve the key.
- A policy can have only one pending renewal. A second request using a new key for an already renewed policy returns `409 ALREADY_RENEWED`.
- Validation order is: JSON, required fields/key, successful-key replay/conflict, policy existence, date, payment method, existing renewal.
- A retrieved renewal has the same fields and values as the creation response. Unknown routes return `404 NOT_FOUND`.

The service has no authentication, real payments, persistence, or production performance model. It is a correct fixture for demonstrating tests, not a hidden-bug challenge. Its measured capacity cannot establish the client's readiness.

For load demonstrations, target this local service only. Keep the complete run within 30 seconds and at most ten renewal workflows per second. A workflow may create a policy and then renew it; distinguish workflow rate from HTTP request rate in your explanation.
