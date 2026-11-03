# Spec 008 — Practice mode: use the policy workbench without a token

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-003 (no public token issuance), ADR-005 (public demo boundary),
  ADR-007 (honest execution source), ADR-009 (commercial layer, proposed)

## Problem

The Lifecycle tab is the only place where a visitor can *do* something with a policy of their own:
create it, activate it, cancel it, see what the server says. Today it is unusable for anyone who is
not the owner:

| Observation | Impact |
|---|---|
| Every action requires a local JWT (`dotnet user-jwts`), which only the owner can issue | A prospect cannot try the product; the tab is a dead end for the audience the hero invites |
| With a token, a non-`200` answer from the real API (`412`, `409`, `400`) is swallowed and the in-browser engine answers instead | The real server's refusals never reach the screen; the simulated answer is shown as if it were the API's, against ADR-007 |
| Results carry no origin | The tab cannot say `Live` or `Simulated` |
| Nothing lets the visitor provoke the stale-write refusal by hand | The one behaviour the product sells cannot be tried |

The boundary stands: no public token issuance (ADR-003) and no anonymous write to the real API
beyond the fixed demo endpoint (ADR-005).

## Goal

Anyone can drive one policy end to end, see the server's real answer when they have a token and an
honestly labelled in-browser answer when they do not, and provoke the stale-write refusal with one
click.

## Non-goals

- No token issuance, no anonymous write endpoint, no API change.
- No persistence of practice data beyond the page session.

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-190` When a policy operation (get, create, activate, cancel, list transitions) is requested
  without a token, the client shall answer from the in-browser engine without contacting the API
  and shall label the result `Simulated`.
- `REQ-191` When a policy operation is requested with a token and the API answers `2xx`, the client
  shall return the API's body and ETag labelled `Live`.
- `REQ-192` When a policy operation is requested with a token and the API answers a non-`2xx`
  status, the client shall surface that answer as an error carrying the status and the Problem
  Details body; it shall not fall back to the in-browser engine.
- `REQ-193` When a policy operation is requested with a token and the network fails, the client
  shall answer from the in-browser engine labelled `Simulated`.
- `REQ-194` When the Lifecycle tab renders without a token, it shall be usable: every action
  enabled, an explanation that everything happens in the browser, and the token option offered as
  the way to drive the real API; the origin chip shall be shown with every result.
- `REQ-195` When a policy is active, the tab shall offer a one-click "try with the old version"
  action that sends the previous ETag and shows the resulting `412` with its explanation.
- `REQ-196` When the Audit tab reads a policy's history with a token, the origin chip shall follow
  the real origin of the answer.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-190` `REQ-191` `REQ-192` `REQ-193` | Vitest: `policyOps.test.ts` |
| `REQ-194` `REQ-195` `REQ-196` | Browser walkthrough recorded in `docs/public-demo.md` |
