# Public portfolio demo

- Document version: 0.6
- Status: Active evidence
- Date: 2026-11-03
- Governing decisions: ADR-005, ADR-006, ADR-007, ADR-008 and ADR-009 (proposed)

## Commercial layer and locale, 2026-11-03

Spec 007 added the hero, the problem cards, the engagement band, the bilingual catalogue, hash
routes and the copyable run summary. Observed with Playwright and Chromium against the production
build (`vite preview`), without a backend, so every run was labelled `Simulated`:

| Check | Observation |
|---|---|
| First screen, `es-ES` browser, 1440 × 1000 | `lang="es"`; hero `Cada cambio de póliza, protegido y registrado`, lede, `Ver la demo en vivo`, `Hablar con naindev`, four proof chips; the blueprint sheet is visible under the hero without scrolling |
| First screen, `en-US` browser | `lang="en"`; hero `Every policy change, protected and on record` |
| Hero run button | Scrolls the sheet into view and runs; walkthrough narrates in the page language (`Paso 3 de 5 · Rechazo esperado` / `Step 3 of 5 · Rejected as expected`) |
| Copy evidence | Clipboard holds the run id, `Simulada · en el navegador` or `Simulated · in-browser`, server time, five step lines with `{id}` in place of the GUID, final state, ledger rows and the page address |
| Problem card 1 | Opens the Concurrency tab and sets `#concurrency`; card 3 links to `docs/traceability.md` |
| Deep link `#audit` | Opens the Audit tab directly |
| Locale toggle | Switches every header and control, sets `lang`, stores `nainpolicy_locale` |
| Mobile 390 px, `es-ES` | Hero, chips, sheet, band, rail, cards and engagement band stack; `scrollWidth` 390 |
| Concurrency race (second pass) | `Lanzar la carrera`: both operators read `…AAAAAAE=`, Alpha's packet reaches SQL Server and the stored version becomes `…AAAAAAI=`, Beta's packet stops at the guard with the `412` burst and the red return path, `nada sobrescrito` under the database; stacked track on 390 px |
| Idle pulse | A faint cyan pulse loops from the browser to SQL Server while no run is in progress; absent under reduced motion |
| Hero proof state | After pointer intent without a backend the first chip turns red with the simulated-origin title; it would turn amber while waking and green when ready |
| Secondary tabs in Spanish | Lifecycle, Concurrency, Audit and Resilience render every label, button, phase and message in Spanish; API values (`Draft`, ETags, paths) stay as returned |

## Practice mode, 2026-11-03

Spec 008. Observed with Playwright and Chromium against the production build, without a token and
without a backend, at 1440 px and 390 px:

| Check | Observation |
|---|---|
| Lifecycle without a token | Header `Pruébalo · sin registro` with the option `Tengo un token local`; every action enabled |
| Create → activate | `Póliza SYNTH-… creada como borrador.` then `La póliza ya está activa…`; chip `Simulada · en el navegador`; inspector shows `Última respuesta · 201` then `· 200`, ETag and stored rowversion |
| Try with the old version | Sends the previous ETag; red notice `El servidor comparó la versión antigua con la almacenada y rechazó el cambio con 412. La póliza no cambió.`; inspector `Última respuesta · 412`, state still `Active` |
| Cancel | `Póliza cancelada…`; `Última respuesta · 200`; state `Cancelled` |
| Audit without a token | `Leer el historial de esta póliza` on the practised id returns the two transitions labelled `Simulada · en el navegador` |
| Phone 390 px | Same flow; no horizontal scroll after the panel headers were allowed to wrap |

## Client walkthrough, 2026-11-03

Spec 006 added narration, a guided walkthrough, selectable layers and a stacked phone layout to the
blueprint. Observed with Playwright and Chromium against the production build (`vite preview`),
without a backend, so every run came from the in-browser fallback and was labelled `Simulated`:

| Check | Observation |
|---|---|
| First screen at 1440 px | Full-width sheet with a start button over it; band below states what a run does; five planned steps dimmed in the rail; legend with four line states |
| Run | Fast trace reaches step 5 within about 1 s, then the walkthrough restarts at step 1 and advances every 1.8 s; band shows `Step N of 5`, title, sentence, request, status, server time, version |
| 5.2 s after the click | `Step 3 of 5 · Rejected as expected`, `A stale write is blocked`, red path Browser → API → Application, `412` burst, Domain stays `Active`, ledger keeps one row |
| 9.2 s after the click | `Step 5 of 5`, walkthrough ended, button reads `Replay` |
| Select a layer | Click on Application pauses the walkthrough, outlines it cyan, band shows its role and three responsibilities; `Back to the run` and `Escape` return to the step |
| Keyboard | `ArrowLeft` from step 5 goes to step 4; five more presses stop at step 1; `ArrowRight` stops at step 5; inputs on other tabs are not intercepted |
| Mobile 390 px | Stacked layout, document `scrollWidth` 390 (no horizontal scroll); nodes in one column, Domain and Infrastructure side by side; band, rail and legend stack; chips never overflow their box |
| Reduced motion emulated | Trace lands directly on step 5; no walkthrough starts; no packets or flow; `Play`, arrows and keys still step |
| Secondary tabs | Each opens with an eyebrow, a title and one sentence (`Drive one policy yourself`, `Why a stale write is refused`, `Every state change is on record`, `A sleeping database is not a bug`); the state machine on Lifecycle uses the blueprint's green for the current state |
| Audit and Concurrency origin | Both show `Simulated · in-browser` in amber after loading the demo result without a backend; the former `Append-Only Verified` badge is gone |

## Client showcase, 2026-10-22

`https://policy.naindev.com/` serves `PolicyOperations.Client` from GitHub Pages. Its first view is
the architecture blueprint (spec 002). Observed in the Vite dev server on 2026-10-22, without a
local backend, so every run came from the in-browser fallback and was labelled `Simulated`:

| Check | Observation |
|---|---|
| First screen at 1280 px | Blueprint visible without scrolling: Client, API, Application, Domain, Infrastructure, SQL Server |
| Run scenario | Packets travel edge by edge; each lit layer turns brand green; step chips fill with status and ms |
| Step 3 (`412`) | Client, API and Application outlined red, concurrency guard red, `412` burst; Domain stays `Active`; ledger unchanged |
| End of run | Domain `Cancelled`; `Policies` row shows `status Cancelled`; `PolicyTransitions` shows `Draft → Active` and `Active → Cancelled` |
| Source label | `Simulated · in-browser` in amber; a live response is labelled `Live · SQL Server` in green |
| Step chips | Buttons, keyboard focusable, replay a frame on click once the run has finished |
| Secondary tabs | Lifecycle, Concurrency, Audit and Resilience render on the brand tokens with one subtitle each |
| Mobile 375 px | Header, actions and tabs wrap; the sheet scrolls sideways at a legible 760 px minimum width; the run button, source label and step chips stack in one column; no page-level horizontal scroll from the client itself |
| Reduced motion | Not emulated; the component skips packet animation when `prefers-reduced-motion` matches |

A `Live` run from the Pages site requires the API deployment that includes the
`https://policy.naindev.com` CORS origin (`T-019`/`T-116`). Until then the public site shows
`Simulated`, by design.

## Live result

Open [https://nain-policy-demo-api.azurewebsites.net/demo/](https://nain-policy-demo-api.azurewebsites.net/demo/) and select **Run demo**. The page uses the deployed API and Azure SQL database; it does not simulate the result in the browser.

The deployment smoke test observed:

1. `201` — Draft created;
2. `200` — policy activated;
3. `412 concurrency_conflict` — stale version rejected;
4. `200` — current version cancelled;
5. `200` — two audit transitions returned.

The final policy status was `Cancelled`. `/health`, `/health/ready` and `/demo/` also returned `200` over HTTPS.

F1 and Azure SQL Serverless can sleep or start slowly. The first request after a quiet period may take longer than later requests.

## Observed cold-start defect, 2026-09-08

Measured against the live deployment after an idle period:

| Request | Result | Elapsed |
|---|---|---:|
| `POST /api/v1/demo/run` (cold) | `500 internal_error` | 71.3 s |
| `POST /api/v1/demo/run` (immediately after) | `200 OK` | 26.7 s |
| `GET /health` (cold) | `200 OK` | 62.2 s |
| `GET /health/ready` (warm) | `200 OK` | 0.5 s |
| `GET /demo/` (warm) | `200 OK` | 0.5 s |

The `500` is the response a first-time visitor arriving from the portfolio received. Root cause:
the Azure SQL Serverless resume exceeded the provider's default 30-second command timeout, the
failure occurred inside the opportunistic cleanup that runs before any lifecycle work, and every
unmapped exception was reported as `internal_error`.

ADR-006 records the fix: an explicit command timeout, best-effort cleanup, `503` with
`Retry-After` for recognised transient conditions, and a page that probes readiness and retries.

**Status: fixed and deployed on 2026-10-26.** See the redeploy evidence below.

## Redeploy evidence, 2026-10-26

Local gate before deploy: build 0 warnings, `dotnet format` clean, 22 + 25 + 26 tests passed, 0
skipped, against a SQL Server 2022 container. Published build run locally: first run 0.41 s, then
about 20 ms.

Production after zip deploy:

| Check | Result |
|---|---|
| `GET /health` | `200`, 0.44 s |
| `GET /demo/` | `200`, 0.35 s |
| `GET /health/ready` right after deploy | `200`, 99 s (Azure SQL Serverless resuming from `AutoPause`) |
| `OPTIONS /api/v1/demo/run` from `https://policy.naindev.com` | `204` with `Access-Control-Allow-Origin` |
| `POST /api/v1/demo/run`, three runs after the database woke | `200` in 1.23 s, 0.37 s, 0.28 s; server-side step times 3 to 16 ms |
| Run from `https://policy.naindev.com` | Labelled `Live · SQL Server`, 87 ms server, 0.5 s wall |

The residual slowness is the Azure SQL free-tier resume after idle (about 1 to 2 minutes), which
the offer does not allow removing. The page probes readiness and retries (ADR-006).

## Public contract

### Run the fixed scenario

- Method: `POST`
- URL: `https://nain-policy-demo-api.azurewebsites.net/api/v1/demo/run`
- Required headers: `Accept: application/json`
- Request body: none
- Authentication: none
- Observed status: `200 OK`

A request body is rejected with `400 Bad Request` and stable code `public_demo_body_not_allowed`.

Representative response:

```json
{
  "runId": "06C3575F",
  "executedAtUtc": "2026-09-08T14:06:22.887+00:00",
  "dataRetentionHours": 24,
  "totalDurationMs": 412,
  "cleanupCompleted": true,
  "steps": [
    {
      "operation": "create_draft",
      "method": "POST",
      "path": "/api/v1/policies",
      "status": 201,
      "result": "succeeded",
      "resourceStatus": "Draft",
      "etag": "\"AAAAAAAAH0E=\"",
      "errorCode": null,
      "durationMs": 118
    },
    {
      "operation": "activate_policy",
      "status": 200,
      "result": "succeeded",
      "resourceStatus": "Active",
      "errorCode": null
    },
    {
      "operation": "reject_stale_update",
      "status": 412,
      "result": "rejected_as_expected",
      "resourceStatus": "Active",
      "errorCode": "concurrency_conflict"
    },
    {
      "operation": "cancel_policy",
      "status": 200,
      "result": "succeeded",
      "resourceStatus": "Cancelled",
      "errorCode": null
    },
    {
      "operation": "read_audit_trail",
      "status": 200,
      "result": "succeeded",
      "resourceStatus": null,
      "errorCode": null
    }
  ],
  "policy": {
    "status": "Cancelled"
  }
}
```

ETags and identifiers vary on each execution. The actual response also contains the final policy and two complete transition records.

Every step reports the HTTP method, the path, the status, the resulting resource status, the ETag
and the server-measured duration. `cleanupCompleted` is `false` when opportunistic cleanup was
skipped; the lifecycle evidence is unaffected.

### Transient unavailability

When the database reports a recognised transient condition that survives the retry strategy:

- status: `503 Service Unavailable`;
- stable code: `service_unavailable`;
- `Retry-After: 20` by default, configurable through `PolicyOperations:SqlResilience`.

`500 internal_error` now means a defect, not a sleeping database.

### Rate limit

More than five runs from one client inside one minute returns:

- status: `429 Too Many Requests`;
- stable code: `public_demo_rate_limited`;
- `Retry-After: 60`.

## Verified Azure configuration

All demo resources are isolated in `rg-nain-policy-demo` and colocated in France Central.

| Resource | Verified configuration | Cost boundary |
|---|---|---|
| App Service plan | Linux `F1`, Free | Shared compute, no SLA, 60 CPU minutes/day |
| Web app | .NET 10 LTS, HTTPS only, TLS 1.2, FTPS disabled | Runs only on the F1 plan |
| Azure SQL | General Purpose Serverless, Gen5, 0.5 minimum vCore, 32 GB | Free offer applied |
| Free-limit behavior | `useFreeLimit=true`, `AutoPause` | No continuation into paid overage |
| Backup/storage | Local redundancy, 32 GB maximum, no zone redundancy | Inside the free offer boundary |
| SQL network | 32 exact App Service possible outbound IPs | No `0.0.0.0` allow-all rule |
| Alert | `free_amount_remaining <= 1000`, every 15 minutes | Email warning at approximately 99% consumed |

Azure SQL cannot be forced to stop and remain stopped at exactly 99% consumption. The email alert is preventive. The authoritative no-charge barrier is `AutoPause`, which makes the database unavailable when the monthly free allowance is exhausted and resumes it when the allowance renews.

The action group and alert are enabled. Azure rejected its manual test-notification endpoint with `Free subscription not supported`, so delivery of a test email was not observed. The alert rule itself was read back with the expected metric, threshold, aggregation and schedule.

Cost-budget alerts are useful as a second warning but do not stop resources and can receive delayed cost data. They are not used as the database cutoff.

## Deployment settings

The connection string is stored in App Service configuration and is not present in source control. The active non-secret settings are:

```text
ASPNETCORE_ENVIRONMENT=Production
Database__ApplyMigrationsOnStartup=false
PublicDemo__Enabled=true
PublicDemo__RetentionHours=24
PublicDemo__RequestsPerMinute=5
PolicyOperations__SupportedCurrencies__0=EUR
AllowedHosts=nain-policy-demo-api.azurewebsites.net
```

Optional resilience settings, with the defaults applied when they are absent:

```text
PolicyOperations__SqlResilience__MaxRetryCount=10
PolicyOperations__SqlResilience__MaxRetryDelaySeconds=15
PolicyOperations__SqlResilience__CommandTimeoutSeconds=60
PolicyOperations__SqlResilience__RetryAfterSeconds=20
```

`Database__ApplyMigrationsOnStartup` was enabled for the first deployment and disabled after all migrations and readiness checks succeeded. A future deployment containing a migration must enable it deliberately for that reviewed release and disable it again after verification.

SQL transient retries are enabled for serverless wake-up. The demo cleanup transaction executes inside the same EF Core retry strategy, so its two deletes and commit remain one retryable atomic unit.

## Run locally

Use a synthetic local database. Do not expose the local port to the internet.

```powershell
$env:ConnectionStrings__DefaultConnection = "Server=.\NAINCONFIGURATOR;Database=PolicyOperationsPublicDemoLocal;Integrated Security=True;TrustServerCertificate=True;Encrypt=False"
$env:PublicDemo__Enabled = "true"
$env:PublicDemo__OrganizationId = "33333333-3333-3333-3333-333333333333"
$env:PublicDemo__RetentionHours = "24"
$env:PublicDemo__RequestsPerMinute = "5"
$env:Database__ApplyMigrationsOnStartup = "true"
$env:ASPNETCORE_URLS = "http://127.0.0.1:5055"

dotnet run --project .\GestionFinanciera\PolicyOperations.Api --configuration Release --no-launch-profile
```

Open [http://127.0.0.1:5055/demo/](http://127.0.0.1:5055/demo/). The protected policy endpoints still require a valid JWT.

## Security and operating boundary

- The anonymous endpoint accepts no body or identity data.
- Only the dedicated demo organization is cleaned up.
- The normal policy API remains protected by JWT and roles.
- Swagger contains no token and does not make protected endpoints anonymous.
- `/health` is process liveness; `/health/ready` checks SQL connectivity.
- App Service F1 and Azure SQL Free provide no SLA.
- No customer or personal data is authorized.
- A customer pilot still requires external identity, backup/restore evidence, privacy decisions, monitoring and support.

## Disable and recover

Set `PublicDemo__Enabled=false` and restart the app to remove the anonymous operation and page. To retire the deployment, first confirm that `rg-nain-policy-demo` still contains only synthetic demo resources, export any evidence that must be retained, and then remove the resource group through a reviewed operation. No destructive down migration is required.
