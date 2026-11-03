# Spec 013 — Money and dates a reader understands

- Document version: 0.1
- Status: Proposed
- Date: 2026-11-03
- Owner and approval authority: Aitor Nain Mendoza Vallejo
- Governing decisions: ADR-008 and ADR-009 (proposed, client presentation)

## Problem

The practice inspector (`The policy as the server sees it`) prints the raw API values: `150000
EUR`, `2026-11-03 → 2027-11-03`, `2026-11-03T18:55:57.291Z`. A reader has to parse them.

## Requirements

Notation: EARS ("When X, the system shall Y").

- `REQ-250` When the inspector shows the insured amount, it shall write it as money in the page
  locale (`150.000,00 €` / `€150,000.00`), keeping the raw value available as a tooltip.
- `REQ-251` When the inspector shows the coverage period and the creation time, it shall write
  calendar dates and times in the page locale (`3 nov 2026`), keeping the raw values as tooltips.
- `REQ-252` When a value cannot be formatted (unknown currency, unparsable date), it shall be
  shown as it came, never hidden.

## Acceptance evidence

| Requirement | Evidence |
|---|---|
| `REQ-250` `REQ-251` `REQ-252` | Vitest: `humanValues.test.ts`; browser: inspector values read back in `es-ES` |
