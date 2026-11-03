# Tasks 009 — Anonymous sandbox for hands-on practice

- Document version: 0.1
- Date: 2026-11-03
- Labels: `[A]` agent completes, `[M]` mixed, `[H]` owner only

## Status

| ID | Task | Label | Done when | State |
|---|---|---|---|---|
| `T-901` | Record ADR-010 as `Proposed` and spec 009 as design only; register both | `[A]` | Files exist and are listed in `docs/README.md` | Done |
| `T-902` | Decide on ADR-010 and answer the four open questions of spec 009 | `[H]` | ADR status and caps recorded | Pending |
| `T-903` | Write the xUnit cases of `REQ-200` to `REQ-209` (red) | `[A]` | Suite fails only on the new cases | Blocked by `T-902` |
| `T-904` | Implement `SandboxOptions`, controller, allow-list validation, limits, pruner extension (green) | `[A]` | `T-903` passes; `dotnet format` clean | Blocked by `T-902` |
| `T-905` | Client: capability probe and the `Live · sandbox` origin in the Lifecycle tab | `[A]` | Vitest green; browser walkthrough | Blocked by `T-904` |
| `T-906` | Add `SBX-001` to `SBX-009` to `docs/business-rules.md` as `Proposed implemented`; traceability; changelog | `[A]` | Documents updated | Blocked by `T-904` |
| `T-907` | Deploy the API with `Sandbox:Enabled=false`, then enable it for the trial | `[M]` | Azure settings read back | Blocked by `T-906` |
| `T-908` | Seven-day trial: record vCore-seconds, creations and wake-ups in `docs/public-demo.md` | `[H]` | Numbers recorded with dates | Blocked by `T-907` |
| `T-909` | Keep enabled or disable, citing the trial numbers | `[H]` | Decision recorded in ADR-010 | Blocked by `T-908` |

## Session handoff

- **Done (2026-11-03):** `T-901`. Design only, as the owner asked; no code was written.
- **Verified:** nothing to verify; documents only.
- **Next:** `T-902`.
- **Blocked:** everything else waits for `T-902`.
