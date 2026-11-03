# ADR-010: Anonymous sandbox for hands-on practice against the real API

- Identifier: ADR-010
- Date: 2026-11-03
- Status: Proposed
- Decision owner: Aitor Nain Mendoza Vallejo

## Context

Spec 008 made the Lifecycle tab usable by anyone, but without a token everything happens in the
browser and is labelled `Simulated`. A prospect who wants to *feel* the product (create their own
policy, provoke the `412`, read the ledger) never touches SQL Server by hand, because:

- ADR-003 forbids public token issuance, so the protected `/api/v1/policies` cannot be opened;
- ADR-005 bounds the only anonymous operation to a fixed, body-less scenario, precisely so that no
  visitor can enter personal data;
- the free Azure SQL offer gives about 100,000 vCore-seconds a month and each wake-up of a paused
  database costs an estimated 1,800 (spec 005), so every anonymous write path spends quota.

The economic brief records no commercial evidence (E0). The question is whether a bounded,
anonymous, real-database sandbox is worth its quota and its attack surface *before* that evidence
exists. This ADR records the design so the owner can decide; nothing is implemented by it.

## Decision (proposed)

### One sandbox organization, the same application services

- Add an anonymous surface under `/api/v1/sandbox/` that mirrors the lifecycle of the protected
  API with the same semantics: `POST /policies`, `GET /policies/{id}`, `POST /policies/{id}/activate`,
  `POST /policies/{id}/cancel`, `GET /policies/{id}/transitions`, with `ETag` out and `If-Match`
  in exactly as today. The handlers call the existing `PolicyService`; no rule is duplicated
  (as `DEMO-004` does for the fixed scenario).
- Every sandbox row lives under one dedicated **sandbox organization** and one fixed actor
  (`sandbox-visitor`), both server-side. The sandbox organization is distinct from the demo
  organization so that the fixed-scenario evidence and the visitor rows never mix and the pruner
  can treat them separately.
- The protected API is untouched: `DEMO-005` stands.

### No free text, ever

The sandbox accepts only values that cannot carry personal data:

| Field | Rule |
|---|---|
| `policyNumber` | Server-generated (`SBX-` + 8 random base32 characters). The body may not set it. |
| `insuredAmount` | Decimal within a configured range (proposed 100 to 1,000,000). |
| `currency` | One of the configured `SupportedCurrencies`. |
| `insuredPartyReference` | Server-generated opaque reference (`SBX-PARTY-` + 6 characters). The body may not set it. |
| `coverageStartDate`, `coverageEndDate` | Dates within a configured window (proposed: start within the next 30 days, end at most 400 days later). |
| `reason` | One code from a fixed catalogue (`customer_request`, `non_payment`, `replaced`, `other`), stored as that code. |

Anything else in the body is rejected with `400 validation_error`. This keeps the ADR-005
boundary: a visitor can still not enter a name, document, contact detail or arbitrary text.

### Possession is the key

- A sandbox policy is addressable only by its identifier, a random GUID returned at creation.
  There is no list endpoint and no enumeration; a wrong or foreign identifier answers `404`, as the
  protected API does across organizations.
- No cookie, no account, no token. The browser keeps the identifiers of the policies it created in
  the page session (spec 008 already does this for the in-browser engine).

### Limits and cost guard

- Disabled by default (`Sandbox:Enabled=false`), like the demo (`DEMO-001`).
- Per-client fixed-window limit for writes (proposed 10 a minute) and a per-client daily cap on
  creations (proposed 5), both configured and validated like `PublicDemo:RequestsPerMinute`.
- A **global daily creation cap** (proposed 100) so the quota exposure is bounded whatever the
  traffic; past the cap the sandbox answers `429 sandbox_quota_exhausted` with `Retry-After` until
  the next UTC day.
- Retention 24 hours; the pruner deletes expired sandbox rows before each sandbox creation, in the
  sandbox organization only (the `DEMO-007` rule, extended to a second organization).
- Enabling the sandbox is an owner action in Azure, after a bounded trial that measures the
  vCore-seconds it consumes (see spec 009). The existing budget alert and `AutoPause` remain the
  hard stops; the client keeps labelling `Simulated` whenever the database is paused.

### Client

- When the API reports the sandbox as enabled (`GET /api/v1/sandbox` → `200` with its limits;
  `404` otherwise), the Lifecycle tab offers "practise against the real API" as a third origin
  beside "in the browser" and "with my token", labelled `Live · sandbox` and never `Verified`.
- The form shows only the fields the sandbox accepts; the number and the party reference are
  displayed as the server returned them.

## Consequences

- A prospect can create, activate, refuse a stale write and cancel *their own* policy on SQL
  Server with no account, and read it back as the server stored it.
- New quota exposure, bounded by the global daily cap; new anonymous write surface, bounded by
  the allow-list, the limits and the organization isolation already proven by tests.
- New rules for `docs/business-rules.md` (`SBX-001` to `SBX-009`, spec 009) and a second
  organization for the pruner.
- Work: API controller, validation, options, pruner extension, xUnit coverage, client origin,
  deployment and a measured trial. Not started by this ADR.

## Rejected alternatives

- **Short-lived anonymous JWTs for the protected API:** rejected, it is public token issuance
  under another name (ADR-003) and would let a visitor list and touch every sandbox row.
- **Reuse the demo organization:** rejected, it would mix visitor rows with the fixed-scenario
  evidence and widen what the demo pruner deletes.
- **A third-party CAPTCHA or e-mail gate:** rejected, it collects data and adds a dependency for a
  portfolio surface; the caps bound the exposure instead.
- **Free-text fields with server-side filtering:** rejected, no filter is a guarantee against
  personal data; only a closed allow-list is.
- **Keep practice simulated only:** the current state; acceptable if the owner judges the quota or
  the surface not worth it before commercial evidence exists.
