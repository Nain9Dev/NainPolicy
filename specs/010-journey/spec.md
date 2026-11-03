# Spec 010 — One path through the tabs

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-008 and ADR-009 (proposed, client presentation)
- Builds on: specs 006, 007 and 008

## Problem

The five tabs are named by concept (`Blueprint`, `Concurrency`, `Resilience`) and stand alone: a
visitor who finishes one does not know what to do next, and a non-engineer does not know what
`Concurrency` will show. The practice flow ends with a cancelled policy and no closure.

## Goal

A visitor who is not an engineer can read the tab names, follow one obvious path from "see how it
works" to "talk to naindev", and gets a closing summary when they finish driving a policy.

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-220` When the header renders, the tabs shall read in plain language in both locales
  (English: `How it works`, `Try it`, `Two at once`, `History`, `Controlled failures`; Spanish:
  `Cómo funciona`, `Pruébalo`, `Dos a la vez`, `Historial`, `Fallos controlados`). Hashes stay as
  they are, so existing links keep working.
- `REQ-221` When a tab renders, it shall end with a band that states the position on the path
  (`Step n of 5`) and offers the next tab as one action; the last tab offers the services page.
- `REQ-222` When the visitor cancels a policy in the practice flow, the tab shall show a closing
  card that says what they did (created, activated, had a stale write refused, cancelled) and
  offers the history as the next action.
- `REQ-223` When the engagement band renders, it shall say what a delivery includes (database,
  backend and frontend, with tests and documentation, as in this repository), as the owner's own
  statement, without customer or outcome claims.
- `REQ-224` When the practice form renders in Spanish, its default cancellation reason shall be
  Spanish.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-221` (order) | Vitest: `journey.test.ts` |
| `REQ-220` `REQ-223` `REQ-224` (keys and parity) | Vitest: `messages.test.ts` |
| `REQ-220` to `REQ-224` (screen) | Browser walkthrough recorded in `docs/public-demo.md` |
