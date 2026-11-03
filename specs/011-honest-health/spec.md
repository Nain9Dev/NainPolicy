# Spec 011 — Honest health probes and a readable backend state

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-006 (free-tier resilience: `503` with `Retry-After`, never a false
  error), ADR-007 (honest execution source)

## Problem

The `Controlled failures` tab exists to show that a sleeping free database is answered honestly
(`503` with `Retry-After`). Yet its own probe fell back to the in-browser engine whenever the API
did not answer `2xx`, and showed `Healthy` with `Simulated` details. The one tab about honest
failures could show a false success. It also spoke only in HTTP terms (`Healthy`, `200`), with
nothing a non-engineer could read.

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-230` When a health probe gets a `2xx`, the client shall report `healthy` with the status
  code and the measured round trip.
- `REQ-231` When a health probe gets a `503`, the client shall report `waking` and read the
  `Retry-After` header; any other non-`2xx` shall be reported `unhealthy` with its status code.
- `REQ-232` When a health probe cannot reach the API, the client shall report `unreachable` with
  status code 0; it shall never answer from the in-browser engine.
- `REQ-233` When the tab renders, it shall show the backend state as three plain-language stages
  (asleep or unreachable, waking, ready), highlight the stage of the latest readiness answer, and
  say in one sentence what each stage means for someone using the system, including the seconds
  the API asked to wait.
- `REQ-234` When a probe result is shown, its outcome shall read in the page language, and the
  history table shall use the same words.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-230` `REQ-231` `REQ-232` | Vitest: `health.test.ts` |
| `REQ-233` `REQ-234` | Browser walkthrough recorded in `docs/public-demo.md` (without a backend the probe reports `unreachable`, which is the honest answer) |
