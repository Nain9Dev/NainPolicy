# Spec 012 — The history in plain words

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-008 and ADR-009 (proposed, client presentation)

## Problem

The `History` tab is the proof that "every change is on record", yet each row shows `DRAFT → ACTIVE`
badges, an ISO timestamp and field names (`actor`, `correlation`). A buyer asks "who changed this
policy and why?" and gets a record layout, not an answer. There is also no way to take the ledger
away, while a run can be copied.

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-240` When a transition is shown, the first line shall be one plain sentence in the page
  language: when (date and time in the visitor's time zone), who, what changed (state names as a
  reader knows them, never the raw API words) and why when a reason was recorded.
- `REQ-241` When a history is shown, the visitor shall be able to copy it as plain text: the
  policy, the origin, one numbered sentence per transition and each request identifier.
- `REQ-242` When nothing is recorded, the copied text shall say so.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-240` `REQ-241` `REQ-242` | Vitest: `historyText.test.ts` |
| On screen | Browser walkthrough recorded in `docs/public-demo.md` |
