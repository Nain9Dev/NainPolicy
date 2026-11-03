# Spec 009 — Anonymous sandbox for hands-on practice

- Document version: 0.1
- Status: Proposed, design only; no implementation authorized
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-003 (no public token issuance), ADR-005 (public demo boundary),
  ADR-006 (free-tier resilience), ADR-010 (anonymous sandbox, proposed)
- Builds on: spec 008 (practice mode, in-browser)

## Problem

A visitor can drive a policy in the Lifecycle tab, but only in the browser (`Simulated`). The
protected API needs a token that only the owner can issue, and the one anonymous operation is a
fixed scenario by design. The product's strongest proof, a real `412` from SQL Server on *your*
policy, cannot be obtained by a prospect on their own.

## Goal

Let anyone drive one policy of their own against the real API and SQL Server, with no account,
no personal data, bounded quota and the same rules as the protected API.

## Non-goals

- No token issuance, no account, no cookie, no e-mail gate.
- No list or search endpoint for sandbox policies.
- No free-text field of any kind.
- No change to `/api/v1/policies` or to the fixed demo scenario.
- Not enabled in Azure until the trial of `REQ-212` is read.

## Requirements

Notation: EARS ("When X, the system shall Y"). Values marked *proposed* are owner decisions.

### Surface and semantics

- `REQ-200` When `Sandbox:Enabled` is false (the default), the system shall not expose any
  `/api/v1/sandbox/` route and `GET /api/v1/sandbox` shall answer `404`.
- `REQ-201` When the sandbox is enabled, the system shall expose `GET /api/v1/sandbox` (limits and
  retention), `POST /api/v1/sandbox/policies`, `GET /api/v1/sandbox/policies/{id}`,
  `POST /api/v1/sandbox/policies/{id}/activate`, `POST /api/v1/sandbox/policies/{id}/cancel` and
  `GET /api/v1/sandbox/policies/{id}/transitions`, anonymous, with the same response shapes,
  `ETag`, `If-Match`, `412` and `428` behaviour as the protected API.
- `REQ-202` When a sandbox handler runs, it shall call the existing application services under
  the fixed sandbox organization and the fixed actor `sandbox-visitor`; organization and actor
  shall never come from the request.

### Input allow-list

- `REQ-203` When a sandbox policy is created, the system shall generate `policyNumber` and
  `insuredPartyReference` server-side and shall reject a body that sets either (`400`).
- `REQ-204` When a sandbox policy is created or activated, the system shall accept only:
  `insuredAmount` within the configured range (*proposed* 100 to 1,000,000), `currency` from the
  configured list, coverage dates within the configured window (*proposed* start within 30 days,
  end at most 400 days after start), and `reason` as one code of the fixed catalogue
  (`customer_request`, `non_payment`, `replaced`, `other`). Any other value or any unknown field
  shall answer `400 validation_error`.

### Isolation

- `REQ-205` When a sandbox request names a policy that does not exist, belongs to another
  organization, or has expired, the system shall answer `404` without revealing which.
- `REQ-206` When a sandbox policy is read or changed, the result shall carry the sandbox
  organization identifier and the fixed actor in its audit rows, never a visitor-supplied value.

### Limits, retention and cost guard

- `REQ-207` When a client exceeds the per-client write limit (*proposed* 10 a minute) or the
  per-client daily creation cap (*proposed* 5), the system shall answer `429` with `Retry-After`.
- `REQ-208` When the global daily creation cap (*proposed* 100 per UTC day) is reached, the
  system shall answer `429 sandbox_quota_exhausted` with `Retry-After` until the next UTC day.
- `REQ-209` When a sandbox policy is created, the system shall first delete, best effort, the
  sandbox rows older than the configured retention (*proposed* 24 hours) in the sandbox
  organization only, and shall report `cleanupCompleted` as the demo does.
- `REQ-210` When the database is resuming, sandbox routes shall answer `503 service_unavailable`
  with `Retry-After` under the `OPS-001` rule.

### Client

- `REQ-211` When `GET /api/v1/sandbox` answers `200`, the Lifecycle tab shall offer a third
  origin, "practise against the real API", labelled `Live · sandbox`; it shall show only the
  accepted fields and the server-generated values as returned. When it answers `404`, the tab
  shall keep the two existing origins.

### Evidence before enabling

- `REQ-212` Before the sandbox is enabled permanently in Azure, the owner shall run a bounded
  trial (*proposed* 7 days with the caps above) and record in `docs/public-demo.md` the measured
  vCore-seconds consumed, the number of sandbox creations and the number of wake-ups. The
  decision to keep it enabled shall cite those numbers.

## Acceptance evidence (to be produced when implemented)

| Requirement | Evidence |
|---|---|
| `REQ-200` `REQ-201` `REQ-202` `REQ-205` `REQ-206` | xUnit against SQL Server: routes absent when disabled; full lifecycle with `ETag` and `412`; a protected-API policy and a demo policy answer `404` through the sandbox; audit rows carry the fixed actor |
| `REQ-203` `REQ-204` | xUnit: generated number and reference; each rejected field and value |
| `REQ-207` `REQ-208` | xUnit with a fake clock: per-client and global caps; `Retry-After` present |
| `REQ-209` | xUnit: only expired sandbox rows deleted; demo rows untouched |
| `REQ-210` | Covered by the existing `OPS-001` tests once the routes share the pipeline |
| `REQ-211` | Vitest for the capability probe; browser walkthrough |
| `REQ-212` | Dated numbers in `docs/public-demo.md` |

## Open questions for the owner

1. Caps: 10 writes a minute, 5 creations a day per client, 100 a day globally. Keep, raise or lower?
2. Should a sandbox policy expire 24 hours after creation (simple) or after its last change?
3. Is a 7-day trial enough to read the quota cost, given the 60-minute auto-pause delay?
4. Should the sandbox be announced on the hero, or only discovered in the Lifecycle tab?
