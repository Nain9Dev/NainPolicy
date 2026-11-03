import type { NodeId } from '../architecture/blueprintTimeline';
import type { TabId } from '../architecture/tabRoute';

/**
 * Visitor-facing copy of the client in both locales (spec 007, ADR-009). This catalogue is the one
 * place where Spanish text lives in the client; code, identifiers and documentation stay English.
 * The `Messages` type keeps both locales structurally identical; `messages.test.ts` checks the keys
 * and the length bounds.
 */

export type Locale = 'en' | 'es';

export const LOCALES: Locale[] = ['en', 'es'];

export interface StepText {
  title: string;
  body: string;
}

export interface LayerText {
  name: string;
  /** Short line drawn under the node title inside the blueprint. */
  tagline: string;
  /** One or two plain sentences shown in the narrator when the layer is selected. */
  role: string;
  responsibilities: string[];
}

export interface SourceText {
  label: string;
  title: string;
}

export interface ViewText {
  eyebrow: string;
  title: string;
  lede: string;
}

export interface ValueCard {
  problem: string;
  answer: string;
  cta: string;
}

export interface Messages {
  hero: {
    eyebrow: string;
    title: string;
    lede: string;
    runCta: string;
    talkCta: string;
    proofs: string[];
  };
  nav: {
    blueprint: string;
    lifecycle: string;
    concurrency: string;
    audit: string;
    resilience: string;
    jwt: string;
    openapi: string;
    source: string;
    switchLabel: string;
    switchTitle: string;
  };
  blueprint: {
    overlayCta: string;
    overlayMeta: string;
    stepOf: string;
    accepted: string;
    rejected: string;
    layer: string;
    howToReadTitle: string;
    howToRead: string[];
    measured: string;
    request: string;
    status: string;
    serverTime: string;
    version: string;
    responsibilities: string;
    backToRun: string;
    prev: string;
    next: string;
    play: string;
    pause: string;
    replay: string;
    run: string;
    runAgain: string;
    running: string;
    tracing: string;
    readoutIdle: string;
    readoutDone: string;
    waking: string;
    ready: string;
    json: string;
    copy: string;
    copied: string;
    runId: string;
    legend: { path: string; reject: string; idle: string; selected: string };
    planned: string;
    expects412: string;
    stepLabels: Record<string, string>;
  };
  narration: {
    idle: StepText & { eyebrow: string };
    steps: Record<string, StepText>;
    fallbackAccepted: string;
    fallbackState: string;
    fallbackRejected: string;
  };
  layers: Record<NodeId, LayerText>;
  source: { live: SourceText; simulated: SourceText };
  value: { eyebrow: string; title: string; cards: ValueCard[] };
  engage: { eyebrow: string; title: string; body: string; deliver: string; primary: string; secondary: string };
  journey: {
    ariaLabel: string;
    progress: string;
    total: number;
    lede: string;
    finishLede: string;
    finish: string;
    next: Record<TabId, string>;
  };
  views: { lifecycle: ViewText; concurrency: ViewText; audit: ViewText; resilience: ViewText };
  summary: { headline: string; server: string; final: string; synthetic: string };
  footer: { meta: string; architecture: string; source: string };
  race: {
    run: string;
    running: string;
    phases: { idle: string; read: string; alpha_committed: string; beta_rejected: string; completed: string };
    alpha: { name: string; role: string };
    beta: { name: string; role: string };
    reads: string;
    holds: string;
    alphaWrites: string;
    alphaSaved: string;
    alphaNewVersion: string;
    betaWrites: string;
    betaStale: string;
    betaRefused: string;
    betaNext: string;
    savedBadge: string;
    refusedBadge: string;
    payloadTitle: string;
    payloadHint: string;
    track: { guard: string; guardRule: string; database: string; version: string; readsLabel: string; saved: string; refused: string; untouched: string };
  };
  audit: {
    idLabel: string;
    readHistory: string;
    loadDemo: string;
    loading: string;
    listTitle: string;
    listHint: string;
    empty: string;
    actor: string;
    correlation: string;
    reason: string;
    id: string;
    fromPractice: string;
    fromRun: string;
    emptyHint: string;
  };
  resilience: {
    apiUp: string;
    dbAwake: string;
    asking: string;
    connecting: string;
    apiProcess: string;
    dbConnection: string;
    untested: string;
    roundTrip: string;
    httpStatus: string;
    promisesTitle: string;
    approved: string;
    promises: string[];
    historyTitle: string;
    samples: string;
    sample: string;
    time: string;
    probe: string;
    status: string;
    http: string;
    latency: string;
    liveness: string;
    readiness: string;
    outcomes: { healthy: string; waking: string; unhealthy: string; unreachable: string };
    stageTitle: string;
    stages: { asleep: string; waking: string; ready: string };
    stageHints: { asleep: string; waking: string; ready: string };
    retryIn: string;
    untestedHint: string;
  };
  lifecycle: {
    states: { draft: string; active: string; cancelled: string };
    stateHints: { draft: string; active: string; cancelled: string };
    activateArrow: string;
    cancelArrow: string;
    tokenTitle: string;
    tokenBody: string;
    configure: string;
    step1: string;
    step2: string;
    step3: string;
    policyNumber: string;
    insuredAmount: string;
    currency: string;
    createDraft: string;
    insuredParty: string;
    startDate: string;
    endDate: string;
    ifMatch: string;
    activate: string;
    reason: string;
    cancel: string;
    inspectorTitle: string;
    noPolicy: string;
    noPolicyHint: string;
    identifier: string;
    amount: string;
    currentVersion: string;
    storedRowversion: string;
    insuredPartyLabel: string;
    coverage: string;
    created: string;
    msgCreated: string;
    msgActive: string;
    msgCancelled: string;
    msgStale: string;
    practiceEyebrow: string;
    practiceLede: string;
    tokenOption: string;
    tryStale: string;
    tryStaleHint: string;
    staleExplained: string;
    lastAnswer: string;
    status: string;
    doneTitle: string;
    doneBody: string;
    doneBodyNoStale: string;
    doneCta: string;
    defaultReason: string;
  };
}

/** Replaces `{key}` placeholders; an unknown placeholder stays visible so a missing value is noticed. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
}

const en: Messages = {
  hero: {
    eyebrow: 'Policy operations · .NET 10 · SQL Server',
    title: 'Every policy change, protected and on record',
    lede: "An API to operate insurance policies without lost updates, with every change on record (who, when, why) and with each brokerage's data kept apart. Try it: five real requests against SQL Server, no sign-up.",
    runCta: 'Run the live demo',
    talkCta: 'Talk to naindev',
    proofs: ['Live on Azure SQL', 'Tests against a real SQL Server on every push', 'Zero-euro infrastructure', 'Open source, MIT'],
  },
  nav: {
    blueprint: 'How it works',
    lifecycle: 'Try it',
    concurrency: 'Two at once',
    audit: 'History',
    resilience: 'Controlled failures',
    jwt: 'JWT',
    openapi: 'OpenAPI',
    source: 'Source',
    switchLabel: 'ES',
    switchTitle: 'Cambiar a español',
  },
  blueprint: {
    overlayCta: 'Run the scenario',
    overlayMeta: '5 real requests · about 1 s · no sign-up',
    stepOf: 'Step {n} of {total}',
    accepted: 'Accepted',
    rejected: 'Rejected as expected',
    layer: 'Layer · {name}',
    howToReadTitle: 'How to read it',
    howToRead: ['Select any layer to see what it does.', 'After a run, use the arrows or the keys ← → to step.', 'Green is the path a request took; red is a refusal.'],
    measured: 'Measured on the server',
    request: 'Request',
    status: 'Status',
    serverTime: 'Server time',
    version: 'Version',
    responsibilities: 'Responsibilities',
    backToRun: 'Back to the run',
    prev: 'Previous step',
    next: 'Next step',
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    run: 'Run the scenario',
    runAgain: 'Run again',
    running: 'Running',
    tracing: 'Tracing',
    readoutIdle: 'POST /api/v1/demo/run',
    readoutDone: '{server} ms server · {wall} s wall',
    waking: 'Waking free-tier database',
    ready: 'Database ready',
    json: 'JSON',
    copy: 'Copy evidence',
    copied: 'Copied',
    runId: 'run {id}',
    legend: { path: 'Request path', reject: 'Rejected by the concurrency guard', idle: 'Not visited yet', selected: 'Selected layer' },
    planned: 'planned',
    expects412: 'expects 412',
    stepLabels: {
      create_draft: 'Create draft',
      activate_policy: 'Activate',
      reject_stale_update: 'Stale version',
      cancel_policy: 'Cancel',
      read_audit_trail: 'Audit trail',
    },
  },
  narration: {
    idle: {
      eyebrow: 'What you will see',
      title: 'One policy, start to finish',
      body: 'Press run and five real requests cross the system: a policy is created, activated, protected from a stale overwrite, cancelled, and its history is read back. Synthetic data, no sign-up.',
    },
    steps: {
      create_draft: {
        title: 'A new policy is created',
        body: "The browser asks for a new policy. The API scopes it to the caller's organization, the domain creates it as a Draft and SQL Server stores it with a version stamp, returned as an ETag.",
      },
      activate_policy: {
        title: 'The draft becomes active',
        body: 'The request carries the current version. The domain checks the activation rules, the policy becomes Active, and the policy row and its audit row are saved in one transaction.',
      },
      reject_stale_update: {
        title: 'A stale write is blocked',
        body: 'A second request arrives with an outdated version. The concurrency guard compares it with the stored version and refuses it with 412. Nothing is changed and nothing is logged.',
      },
      cancel_policy: {
        title: 'The policy is cancelled',
        body: 'With the fresh version the cancellation passes the guard. The policy moves to Cancelled, a final state, and the audit ledger gains its second row in the same transaction.',
      },
      read_audit_trail: {
        title: 'The history is read back',
        body: 'The browser reads the transition ledger. Both state changes come back in order, each with its actor, time and reason, exactly as SQL Server stored them.',
      },
    },
    fallbackAccepted: 'The server answered {status} to {method} in {ms} ms. The request was accepted.',
    fallbackState: ' The policy is now {state}.',
    fallbackRejected: 'The server answered {status} to {method} in {ms} ms. The request was refused{why}; nothing changed.',
  },
  layers: {
    client: {
      name: 'Browser',
      tagline: 'sends requests, shows results',
      role: 'Your browser sends plain HTTPS requests and shows what comes back. In this demo it sends no personal data and no token: the server uses a fixed synthetic organization.',
      responsibilities: ['One click, one POST to the public demo endpoint', 'Draws the response; computes nothing', 'Labels every run Live or Simulated'],
    },
    api: {
      name: 'API',
      tagline: 'the front door',
      role: 'The front door. It validates the caller, derives organization and role from the token, checks the version header and turns every error into a safe, documented response.',
      responsibilities: ['JWT validation, roles and organization scope', 'ETag out, If-Match in', 'Problem Details, 429 rate limit, 503 with Retry-After'],
    },
    application: {
      name: 'Application',
      tagline: 'runs each use case',
      role: 'Runs each use case: create, activate, cancel, read. It owns the concurrency guard and saves the policy and its audit row in one unit of work. It knows no database details.',
      responsibilities: ['One service per use case, no framework', 'Concurrency guard: If-Match must equal the stored version', 'Policy and audit row saved together'],
    },
    domain: {
      name: 'Domain',
      tagline: 'the rules of a policy',
      role: 'The rules of a policy: which states exist, which transitions are allowed and what a valid amount is. Pure code with no web, database or framework reference.',
      responsibilities: ['Draft, Active and Cancelled; Cancelled is final', 'Activation needs an insured party and coverage dates', 'Every transition produces an audit entry'],
    },
    infrastructure: {
      name: 'Infrastructure',
      tagline: 'talks to the database',
      role: 'Talks to SQL Server through EF Core. It maps the version stamp, retries transient failures while the free database wakes up and owns the migrations.',
      responsibilities: ['EF Core 10 mappings and migrations', 'rowversion as the optimistic concurrency token', 'Transient retry, 60 s command timeout'],
    },
    sql: {
      name: 'SQL Server',
      tagline: 'stores policies and history',
      role: 'Stores the Policies table and the append-only PolicyTransitions ledger. It runs on the Azure free offer, so it may be asleep when you arrive and wake on the first request.',
      responsibilities: ['Policies: status, amount, version stamp', 'PolicyTransitions: append-only audit ledger', 'Constraints enforce the rules even outside the API'],
    },
  },
  source: {
    live: { label: 'Live · SQL Server', title: 'Response from the API and SQL Server' },
    simulated: { label: 'Simulated · in-browser', title: 'In-browser fallback: the API was unreachable or still waking' },
  },
  value: {
    eyebrow: 'What it is for',
    title: 'What it protects, in real situations',
    cards: [
      { problem: 'Two people edit the same policy at once', answer: 'The second one gets a 412 and nothing is lost: every change must carry the version that was read.', cta: 'See the race' },
      { problem: 'Who changed this policy, and why?', answer: 'An append-only ledger of transitions with actor, time, reason and request id.', cta: 'See the ledger' },
      { problem: 'One brokerage must never see another', answer: 'The organization comes from the token, not the request; anything that is not yours answers 404 without confirming it exists.', cta: 'See the tests' },
      { problem: 'The free database is asleep', answer: 'The API answers 503 with Retry-After while it wakes, never a false error.', cta: 'Probe it' },
    ],
  },
  engage: {
    eyebrow: 'Next step',
    title: 'Want this rigor in your system?',
    body: 'This demo is a bounded slice built with the method behind every delivery: specification first, tests before code, clean architecture and public evidence. The same method fits a custom policy API, a legacy .NET modernization or deterministic data validation.',
    deliver: 'What a delivery includes: database, backend and frontend, with tests and documentation, as in this repository.',
    primary: 'Talk to naindev',
    secondary: 'See the source',
  },
  journey: {
    ariaLabel: 'Next step',
    progress: 'Step {n} of {total}',
    total: 5,
    lede: 'Keep going: the next tab shows the next thing the system protects.',
    finishLede: 'You have seen the whole path. If this is the rigor you want in your system, let us talk.',
    finish: 'Talk to naindev',
    next: {
      scenario: 'See how it works',
      workbench: 'Now try it yourself',
      concurrency: 'See two people editing at once',
      audit: 'Read the history',
      resilience: 'See a controlled failure',
    },
  },
  views: {
    lifecycle: {
      eyebrow: 'Hands-on · needs a local token',
      title: 'Drive one policy yourself',
      lede: 'Create a draft, activate it and cancel it with your own requests. Every change must carry the current version, so a request built on an old one is refused.',
    },
    concurrency: {
      eyebrow: 'Two operators, one policy',
      title: 'Why a stale write is refused',
      lede: "Alpha and Beta read the same policy. Alpha saves first, so the stored version changes; Beta's request still carries the old version and gets a 412 instead of silently overwriting Alpha's work.",
    },
    audit: {
      eyebrow: 'Append-only ledger',
      title: 'Every state change is on record',
      lede: 'Each transition is stored with who did it, when, why and under which request. Rows are only ever added, never edited or deleted.',
    },
    resilience: {
      eyebrow: 'Free tier, honest errors',
      title: 'A sleeping database is not a bug',
      lede: 'The database pauses when idle to keep the cost at zero. Probing it while it wakes returns 503 with Retry-After, never a 500, so a client knows to wait rather than to fail.',
    },
  },
  summary: {
    headline: 'NainPolicy demo run {id}',
    server: '{ms} ms server',
    final: 'Final state {state} · {rows} audit rows',
    synthetic: 'synthetic data',
  },
  footer: { meta: 'synthetic data · 0.00 € · MIT', architecture: 'Architecture', source: 'Source' },
  race: {
    run: 'Run the race',
    running: 'Running the race…',
    phases: {
      idle: 'Ready',
      read: 'Both operators read the same policy',
      alpha_committed: 'Alpha saved first; the version changed',
      beta_rejected: 'Beta still holds the old version: refused with 412',
      completed: 'Done: nothing was overwritten',
    },
    alpha: { name: 'Operator Alpha', role: 'underwriter · saves first' },
    beta: { name: 'Operator Beta', role: 'claims adjuster · arrives second' },
    reads: 'Reads the policy',
    holds: 'version {etag}',
    alphaWrites: 'Activates it with that version',
    alphaSaved: 'Saved: the stored version moves on',
    alphaNewVersion: 'SQL Server assigns a new version.',
    betaWrites: 'Cancels it with the version it read',
    betaStale: 'STALE',
    betaRefused: 'Refused: the version is stale',
    betaNext: 'Beta must read again before changing anything.',
    savedBadge: '200 saved',
    refusedBadge: '412 refused',
    payloadTitle: 'What Beta receives',
    payloadHint: 'Problem Details body (RFC 9457) returned with the 412',
    track: {
      guard: 'API · concurrency guard',
      guardRule: 'If-Match ≟ stored version',
      database: 'SQL Server',
      version: 'stored version',
      readsLabel: 'reads',
      saved: 'saved · new version',
      refused: '412 · stale version',
      untouched: 'nothing overwritten',
    },
  },
  audit: {
    idLabel: 'Policy identifier (GUID)',
    readHistory: "Read this policy's history",
    loadDemo: 'Load the demo ledger',
    loading: 'Loading…',
    listTitle: 'Transitions, oldest first',
    listHint: '{n} recorded state changes',
    empty: 'No transitions recorded for this identifier.',
    actor: 'actor',
    correlation: 'correlation',
    reason: 'reason',
    id: 'id',
    fromPractice: 'History of the policy you drove',
    fromRun: 'History of your last run',
    emptyHint: 'Run the scenario or drive a policy and its history appears here. You can also load the demo ledger.',
  },
  resilience: {
    apiUp: 'Is the API up?',
    dbAwake: 'Is the database awake?',
    asking: 'Asking…',
    connecting: 'Connecting to SQL Server…',
    apiProcess: 'API process',
    dbConnection: 'SQL Server connection',
    untested: 'Untested',
    roundTrip: 'Round trip',
    httpStatus: 'HTTP status',
    promisesTitle: 'What the API promises (ADR-006)',
    approved: 'Approved',
    promises: ['Waits up to 60 s for a waking database', 'Answers 503 with Retry-After while it wakes', 'A failed cleanup never fails a run', 'Runs on 0.00 € of infrastructure'],
    historyTitle: 'Probe history',
    samples: '{n} samples this session',
    sample: '1 sample this session',
    time: 'Time',
    probe: 'Probe',
    status: 'Status',
    http: 'HTTP',
    latency: 'Latency',
    liveness: 'Liveness (/health)',
    readiness: 'SQL readiness (/health/ready)',
    outcomes: { healthy: 'Ready', waking: 'Waking up', unhealthy: 'Error', unreachable: 'Unreachable' },
    stageTitle: 'What the database is doing right now',
    stages: { asleep: 'Asleep or unreachable', waking: 'Waking up', ready: 'Ready' },
    stageHints: {
      asleep: 'Nobody has used it for a while, or the API cannot be reached from here. A user would see a clear wait, not a broken screen.',
      waking: 'The API answers 503 and says how many seconds to wait. The client waits and retries; nothing is lost and nothing is faked.',
      ready: 'Requests are answered in milliseconds. This is the normal state while people are working.',
    },
    retryIn: 'the API asked to retry in {s} s',
    untestedHint: 'Press a button above to ask the real API.',
  },
  lifecycle: {
    states: { draft: 'Draft', active: 'Active', cancelled: 'Cancelled' },
    stateHints: { draft: 'created, not yet in force', active: 'in force', cancelled: 'final, cannot change again' },
    activateArrow: 'activate · If-Match',
    cancelArrow: 'cancel · If-Match',
    tokenTitle: 'This tab sends real requests with your own token',
    tokenBody: 'A local JWT with organization_id and the role PolicyOperator. The Blueprint tab needs none.',
    configure: 'Configure JWT',
    step1: '1 · Create a draft',
    step2: '2 · Activate it',
    step3: '3 · Cancel it',
    policyNumber: 'Policy number',
    insuredAmount: 'Insured amount',
    currency: 'Currency',
    createDraft: 'Create draft',
    insuredParty: 'Insured party reference',
    startDate: 'Start date',
    endDate: 'End date',
    ifMatch: 'If-Match (the version you read)',
    activate: 'Activate',
    reason: 'Cancellation reason',
    cancel: 'Cancel',
    inspectorTitle: 'The policy as the server sees it',
    noPolicy: 'No policy yet.',
    noPolicyHint: 'Step 1 creates a draft.',
    identifier: 'Identifier',
    amount: 'Insured amount',
    currentVersion: 'Current version (ETag)',
    storedRowversion: 'Stored rowversion',
    insuredPartyLabel: 'Insured party',
    coverage: 'Coverage period',
    created: 'Created (UTC)',
    msgCreated: 'Policy {n} created as a draft.',
    msgActive: 'Policy is now active. The server issued a new version.',
    msgCancelled: 'Policy cancelled. The audit ledger has the record.',
    msgStale: '412 Precondition Failed: the version you sent is stale. Read the policy again.',
    practiceEyebrow: 'Try it · no sign-up',
    practiceLede: 'Without a token everything happens in your browser and is labelled Simulated. With a local token the same actions go to the real API and you see its real answers.',
    tokenOption: 'I have a local token',
    tryStale: 'Try with the old version',
    tryStaleHint: 'Acts like a colleague who read the policy before your last change and saves now.',
    staleExplained: 'The server compared the old version with the stored one and refused the change with 412. The policy did not change.',
    lastAnswer: 'Last answer',
    status: 'Status',
    doneTitle: 'You drove a whole policy',
    doneBody: 'You created it, activated it, had a stale write refused and cancelled it. Every change is on record; the history tab shows it as the server stored it.',
    doneBodyNoStale: 'You created it, activated it and cancelled it. Every change is on record; the history tab shows it as the server stored it.',
    doneCta: 'Read its history',
    defaultReason: 'Cancelled at the customer request',
  },
};

const es: Messages = {
  hero: {
    eyebrow: 'Operaciones de pólizas · .NET 10 · SQL Server',
    title: 'Cada cambio de póliza, protegido y registrado',
    lede: 'Una API para operar pólizas sin sobrescrituras perdidas, con cada cambio anotado (quién, cuándo, por qué) y con los datos de cada correduría aislados. Pruébala: cinco peticiones reales contra SQL Server, sin registro.',
    runCta: 'Ver la demo en vivo',
    talkCta: 'Hablar con naindev',
    proofs: ['En vivo sobre Azure SQL', 'Tests contra SQL Server real en cada push', 'Infraestructura a 0 €', 'Código abierto MIT'],
  },
  nav: {
    blueprint: 'Cómo funciona',
    lifecycle: 'Pruébalo',
    concurrency: 'Dos a la vez',
    audit: 'Historial',
    resilience: 'Fallos controlados',
    jwt: 'JWT',
    openapi: 'OpenAPI',
    source: 'Código',
    switchLabel: 'EN',
    switchTitle: 'Switch to English',
  },
  blueprint: {
    overlayCta: 'Ejecutar el escenario',
    overlayMeta: '5 peticiones reales · aprox. 1 s · sin registro',
    stepOf: 'Paso {n} de {total}',
    accepted: 'Aceptada',
    rejected: 'Rechazo esperado',
    layer: 'Capa · {name}',
    howToReadTitle: 'Cómo leerlo',
    howToRead: ['Selecciona cualquier capa para ver qué hace.', 'Tras una ejecución, usa las flechas o las teclas ← → para avanzar.', 'Verde es el camino de una petición; rojo, un rechazo.'],
    measured: 'Medido en el servidor',
    request: 'Petición',
    status: 'Estado',
    serverTime: 'Tiempo de servidor',
    version: 'Versión',
    responsibilities: 'Responsabilidades',
    backToRun: 'Volver a la ejecución',
    prev: 'Paso anterior',
    next: 'Paso siguiente',
    play: 'Reproducir',
    pause: 'Pausar',
    replay: 'Repetir',
    run: 'Ejecutar el escenario',
    runAgain: 'Ejecutar de nuevo',
    running: 'Ejecutando',
    tracing: 'Trazando',
    readoutIdle: 'POST /api/v1/demo/run',
    readoutDone: '{server} ms servidor · {wall} s reloj',
    waking: 'Despertando la base de datos gratuita',
    ready: 'Base de datos lista',
    json: 'JSON',
    copy: 'Copiar evidencia',
    copied: 'Copiada',
    runId: 'ejecución {id}',
    legend: { path: 'Camino de la petición', reject: 'Rechazada por el guardián de concurrencia', idle: 'Aún no visitado', selected: 'Capa seleccionada' },
    planned: 'previsto',
    expects412: 'espera 412',
    stepLabels: {
      create_draft: 'Crear borrador',
      activate_policy: 'Activar',
      reject_stale_update: 'Versión obsoleta',
      cancel_policy: 'Cancelar',
      read_audit_trail: 'Historial',
    },
  },
  narration: {
    idle: {
      eyebrow: 'Lo que vas a ver',
      title: 'Una póliza, de principio a fin',
      body: 'Pulsa ejecutar y cinco peticiones reales cruzan el sistema: se crea una póliza, se activa, se protege de una sobrescritura obsoleta, se cancela y se lee su historial. Datos sintéticos, sin registro.',
    },
    steps: {
      create_draft: {
        title: 'Se crea una póliza nueva',
        body: 'El navegador pide una póliza nueva. La API la limita a la organización del llamante, el dominio la crea como borrador y SQL Server la guarda con un sello de versión que vuelve como ETag.',
      },
      activate_policy: {
        title: 'El borrador pasa a activo',
        body: 'La petición lleva la versión actual. El dominio comprueba las reglas de activación, la póliza pasa a activa y la fila de la póliza y su fila de auditoría se guardan en una sola transacción.',
      },
      reject_stale_update: {
        title: 'Una escritura obsoleta es bloqueada',
        body: 'Llega una segunda petición con una versión antigua. El guardián de concurrencia la compara con la versión almacenada y la rechaza con 412. Nada cambia y nada se registra.',
      },
      cancel_policy: {
        title: 'La póliza se cancela',
        body: 'Con la versión fresca, la cancelación pasa el guardián. La póliza pasa a cancelada, un estado final, y el libro de auditoría gana su segunda fila en la misma transacción.',
      },
      read_audit_trail: {
        title: 'Se lee el historial',
        body: 'El navegador lee el libro de transiciones. Los dos cambios de estado vuelven en orden, cada uno con su actor, hora y motivo, tal y como los guardó SQL Server.',
      },
    },
    fallbackAccepted: 'El servidor respondió {status} a {method} en {ms} ms. La petición fue aceptada.',
    fallbackState: ' La póliza está ahora en {state}.',
    fallbackRejected: 'El servidor respondió {status} a {method} en {ms} ms. La petición fue rechazada{why}; nada cambió.',
  },
  layers: {
    client: {
      name: 'Navegador',
      tagline: 'envía peticiones, muestra resultados',
      role: 'Tu navegador envía peticiones HTTPS y muestra lo que vuelve. En esta demo no envía datos personales ni token: el servidor usa una organización sintética fija.',
      responsibilities: ['Un clic, un POST al endpoint público de la demo', 'Dibuja la respuesta; no calcula nada', 'Etiqueta cada ejecución como En vivo o Simulada'],
    },
    api: {
      name: 'API',
      tagline: 'la puerta de entrada',
      role: 'La puerta de entrada. Valida al llamante, deriva organización y rol del token, comprueba la cabecera de versión y convierte cada error en una respuesta segura y documentada.',
      responsibilities: ['Validación JWT, roles y ámbito de organización', 'ETag de salida, If-Match de entrada', 'Problem Details, 429 por límite, 503 con Retry-After'],
    },
    application: {
      name: 'Aplicación',
      tagline: 'ejecuta cada caso de uso',
      role: 'Ejecuta cada caso de uso: crear, activar, cancelar, leer. Posee el guardián de concurrencia y guarda la póliza y su fila de auditoría en una sola unidad de trabajo. No conoce la base de datos.',
      responsibilities: ['Un servicio por caso de uso, sin framework', 'Guardián: If-Match debe igualar la versión almacenada', 'Póliza y fila de auditoría guardadas juntas'],
    },
    domain: {
      name: 'Dominio',
      tagline: 'las reglas de una póliza',
      role: 'Las reglas de una póliza: qué estados existen, qué transiciones se permiten y qué importe es válido. Código puro, sin referencias web, de base de datos ni de framework.',
      responsibilities: ['Borrador, activa y cancelada; cancelada es final', 'Activar exige asegurado y fechas de cobertura', 'Cada transición produce una entrada de auditoría'],
    },
    infrastructure: {
      name: 'Infraestructura',
      tagline: 'habla con la base de datos',
      role: 'Habla con SQL Server a través de EF Core. Mapea el sello de versión, reintenta fallos transitorios mientras la base gratuita despierta y posee las migraciones.',
      responsibilities: ['Mapeos y migraciones de EF Core 10', 'rowversion como token de concurrencia optimista', 'Reintento transitorio, 60 s de tiempo límite'],
    },
    sql: {
      name: 'SQL Server',
      tagline: 'guarda pólizas e historial',
      role: 'Guarda la tabla Policies y el libro solo de escritura PolicyTransitions. Corre en la oferta gratuita de Azure, así que puede estar dormida al llegar y despertar con la primera petición.',
      responsibilities: ['Policies: estado, importe, sello de versión', 'PolicyTransitions: libro de auditoría solo de escritura', 'Las restricciones imponen las reglas incluso fuera de la API'],
    },
  },
  source: {
    live: { label: 'En vivo · SQL Server', title: 'Respuesta de la API y de SQL Server' },
    simulated: { label: 'Simulada · en el navegador', title: 'Alternativa en el navegador: la API no respondía o aún despertaba' },
  },
  value: {
    eyebrow: 'Para qué sirve',
    title: 'Lo que protege, en situaciones reales',
    cards: [
      { problem: 'Dos personas editan la misma póliza a la vez', answer: 'La segunda recibe un 412 y no se pierde nada: cada cambio debe llevar la versión que se leyó.', cta: 'Ver la carrera' },
      { problem: '¿Quién cambió esta póliza y por qué?', answer: 'Un libro de transiciones solo de escritura, con actor, hora, motivo e identificador de petición.', cta: 'Ver el libro' },
      { problem: 'Los datos de una correduría nunca se mezclan con otra', answer: 'La organización sale del token, no de la petición; lo que no es tuyo responde 404 sin confirmar que existe.', cta: 'Ver las pruebas' },
      { problem: 'La base de datos gratuita está dormida', answer: 'La API responde 503 con Retry-After mientras despierta, nunca un error falso.', cta: 'Sondearla' },
    ],
  },
  engage: {
    eyebrow: 'Siguiente paso',
    title: '¿Quieres este rigor en tu sistema?',
    body: 'Esta demo es una porción acotada, construida con el método que aplico en cada entrega: especificación primero, pruebas antes del código, arquitectura limpia y evidencia pública. El mismo método sirve para una API de pólizas a medida, para modernizar un .NET heredado o para validar datos de forma determinista.',
    deliver: 'Qué incluye una entrega: base de datos, backend y frontend, con pruebas y documentación, como en este repositorio.',
    primary: 'Hablar con naindev',
    secondary: 'Ver el código',
  },
  journey: {
    ariaLabel: 'Siguiente paso',
    progress: 'Paso {n} de {total}',
    total: 5,
    lede: 'Sigue: la siguiente pestaña muestra lo siguiente que protege el sistema.',
    finishLede: 'Has visto el camino completo. Si este es el rigor que quieres en tu sistema, hablemos.',
    finish: 'Hablar con naindev',
    next: {
      scenario: 'Ver cómo funciona',
      workbench: 'Ahora pruébalo tú',
      concurrency: 'Ver a dos personas editando a la vez',
      audit: 'Leer el historial',
      resilience: 'Ver un fallo controlado',
    },
  },
  views: {
    lifecycle: {
      eyebrow: 'Manual · requiere un token local',
      title: 'Conduce una póliza tú mismo',
      lede: 'Crea un borrador, actívalo y cancélalo con tus propias peticiones. Cada cambio debe llevar la versión actual, así que una petición basada en una versión vieja se rechaza.',
    },
    concurrency: {
      eyebrow: 'Dos operadores, una póliza',
      title: 'Por qué se rechaza una escritura obsoleta',
      lede: 'Alfa y Beta leen la misma póliza. Alfa guarda primero y la versión almacenada cambia; la petición de Beta aún lleva la versión antigua y recibe un 412 en vez de pisar el trabajo de Alfa.',
    },
    audit: {
      eyebrow: 'Libro solo de escritura',
      title: 'Cada cambio de estado queda registrado',
      lede: 'Cada transición se guarda con quién la hizo, cuándo, por qué y bajo qué petición. Las filas solo se añaden; nunca se editan ni se borran.',
    },
    resilience: {
      eyebrow: 'Plan gratuito, errores honestos',
      title: 'Una base de datos dormida no es un fallo',
      lede: 'La base de datos se pausa cuando está inactiva para mantener el coste a cero. Sondearla mientras despierta devuelve 503 con Retry-After, nunca un 500, así el cliente sabe que debe esperar y no fallar.',
    },
  },
  summary: {
    headline: 'Ejecución de la demo NainPolicy {id}',
    server: '{ms} ms de servidor',
    final: 'Estado final {state} · {rows} filas de auditoría',
    synthetic: 'datos sintéticos',
  },
  footer: { meta: 'datos sintéticos · 0,00 € · MIT', architecture: 'Arquitectura', source: 'Código' },
  race: {
    run: 'Lanzar la carrera',
    running: 'Carrera en marcha…',
    phases: {
      idle: 'Lista',
      read: 'Los dos operadores leen la misma póliza',
      alpha_committed: 'Alfa guardó primero; la versión cambió',
      beta_rejected: 'Beta aún lleva la versión antigua: rechazada con 412',
      completed: 'Hecho: nada se ha sobrescrito',
    },
    alpha: { name: 'Operador Alfa', role: 'suscriptor · guarda primero' },
    beta: { name: 'Operador Beta', role: 'siniestros · llega segundo' },
    reads: 'Lee la póliza',
    holds: 'versión {etag}',
    alphaWrites: 'La activa con esa versión',
    alphaSaved: 'Guardado: la versión almacenada avanza',
    alphaNewVersion: 'SQL Server asigna una versión nueva.',
    betaWrites: 'La cancela con la versión que leyó',
    betaStale: 'OBSOLETA',
    betaRefused: 'Rechazada: la versión está obsoleta',
    betaNext: 'Beta debe volver a leer antes de cambiar nada.',
    savedBadge: '200 guardado',
    refusedBadge: '412 rechazado',
    payloadTitle: 'Lo que recibe Beta',
    payloadHint: 'Cuerpo Problem Details (RFC 9457) devuelto con el 412',
    track: {
      guard: 'API · guardián de concurrencia',
      guardRule: 'If-Match ≟ versión almacenada',
      database: 'SQL Server',
      version: 'versión almacenada',
      readsLabel: 'lee',
      saved: 'guardado · versión nueva',
      refused: '412 · versión obsoleta',
      untouched: 'nada sobrescrito',
    },
  },
  audit: {
    idLabel: 'Identificador de la póliza (GUID)',
    readHistory: 'Leer el historial de esta póliza',
    loadDemo: 'Cargar el libro de la demo',
    loading: 'Cargando…',
    listTitle: 'Transiciones, la más antigua primero',
    listHint: '{n} cambios de estado registrados',
    empty: 'No hay transiciones registradas para este identificador.',
    actor: 'actor',
    correlation: 'correlación',
    reason: 'motivo',
    id: 'id',
    fromPractice: 'Historial de la póliza que has conducido',
    fromRun: 'Historial de tu última ejecución',
    emptyHint: 'Ejecuta el escenario o conduce una póliza y su historial aparecerá aquí. También puedes cargar el libro de la demo.',
  },
  resilience: {
    apiUp: '¿Está la API en pie?',
    dbAwake: '¿Está despierta la base de datos?',
    asking: 'Preguntando…',
    connecting: 'Conectando con SQL Server…',
    apiProcess: 'Proceso de la API',
    dbConnection: 'Conexión con SQL Server',
    untested: 'Sin probar',
    roundTrip: 'Ida y vuelta',
    httpStatus: 'Estado HTTP',
    promisesTitle: 'Lo que promete la API (ADR-006)',
    approved: 'Aprobado',
    promises: ['Espera hasta 60 s a una base de datos que despierta', 'Responde 503 con Retry-After mientras despierta', 'Una limpieza fallida nunca hace fallar una ejecución', 'Corre sobre 0,00 € de infraestructura'],
    historyTitle: 'Historial de sondas',
    samples: '{n} muestras en esta sesión',
    sample: '1 muestra en esta sesión',
    time: 'Hora',
    probe: 'Sonda',
    status: 'Estado',
    http: 'HTTP',
    latency: 'Latencia',
    liveness: 'Proceso (/health)',
    readiness: 'SQL listo (/health/ready)',
    outcomes: { healthy: 'Lista', waking: 'Despertando', unhealthy: 'Error', unreachable: 'Inaccesible' },
    stageTitle: 'Qué hace la base de datos ahora mismo',
    stages: { asleep: 'Dormida o inaccesible', waking: 'Despertando', ready: 'Lista' },
    stageHints: {
      asleep: 'Nadie la ha usado en un rato, o la API no es accesible desde aquí. Un usuario vería una espera clara, no una pantalla rota.',
      waking: 'La API responde 503 y dice cuántos segundos esperar. El cliente espera y reintenta; nada se pierde y nada se finge.',
      ready: 'Las peticiones se responden en milisegundos. Es el estado normal mientras la gente trabaja.',
    },
    retryIn: 'la API pidió reintentar en {s} s',
    untestedHint: 'Pulsa un botón arriba para preguntar a la API real.',
  },
  lifecycle: {
    states: { draft: 'Borrador', active: 'Activa', cancelled: 'Cancelada' },
    stateHints: { draft: 'creada, aún sin vigencia', active: 'en vigor', cancelled: 'final, ya no cambia' },
    activateArrow: 'activar · If-Match',
    cancelArrow: 'cancelar · If-Match',
    tokenTitle: 'Esta pestaña envía peticiones reales con tu propio token',
    tokenBody: 'Un JWT local con organization_id y el rol PolicyOperator. La pestaña Blueprint no necesita ninguno.',
    configure: 'Configurar JWT',
    step1: '1 · Crear un borrador',
    step2: '2 · Activarla',
    step3: '3 · Cancelarla',
    policyNumber: 'Número de póliza',
    insuredAmount: 'Importe asegurado',
    currency: 'Moneda',
    createDraft: 'Crear borrador',
    insuredParty: 'Referencia del asegurado',
    startDate: 'Fecha de inicio',
    endDate: 'Fecha de fin',
    ifMatch: 'If-Match (la versión que leíste)',
    activate: 'Activar',
    reason: 'Motivo de cancelación',
    cancel: 'Cancelar',
    inspectorTitle: 'La póliza tal y como la ve el servidor',
    noPolicy: 'Aún no hay póliza.',
    noPolicyHint: 'El paso 1 crea un borrador.',
    identifier: 'Identificador',
    amount: 'Importe asegurado',
    currentVersion: 'Versión actual (ETag)',
    storedRowversion: 'rowversion almacenada',
    insuredPartyLabel: 'Asegurado',
    coverage: 'Periodo de cobertura',
    created: 'Creada (UTC)',
    msgCreated: 'Póliza {n} creada como borrador.',
    msgActive: 'La póliza ya está activa. El servidor emitió una versión nueva.',
    msgCancelled: 'Póliza cancelada. El libro de auditoría tiene el registro.',
    msgStale: '412 Precondition Failed: la versión que enviaste está obsoleta. Vuelve a leer la póliza.',
    practiceEyebrow: 'Pruébalo · sin registro',
    practiceLede: 'Sin token, todo ocurre en tu navegador y se etiqueta como simulado. Con un token local, las mismas acciones van a la API real y ves sus respuestas reales.',
    tokenOption: 'Tengo un token local',
    tryStale: 'Probar con la versión antigua',
    tryStaleHint: 'Actúa como un compañero que leyó la póliza antes de tu último cambio y guarda ahora.',
    staleExplained: 'El servidor comparó la versión antigua con la almacenada y rechazó el cambio con 412. La póliza no cambió.',
    lastAnswer: 'Última respuesta',
    status: 'Estado',
    doneTitle: 'Has conducido una póliza completa',
    doneBody: 'La has creado, activado, has visto rechazada una escritura obsoleta y la has cancelado. Cada cambio queda registrado; la pestaña de historial lo muestra tal y como lo guardó el servidor.',
    doneBodyNoStale: 'La has creado, activado y cancelado. Cada cambio queda registrado; la pestaña de historial lo muestra tal y como lo guardó el servidor.',
    doneCta: 'Leer su historial',
    defaultReason: 'Cancelación a petición del cliente',
  },
};

export const MESSAGES: Readonly<Record<Locale, Messages>> = Object.freeze({ en, es });
