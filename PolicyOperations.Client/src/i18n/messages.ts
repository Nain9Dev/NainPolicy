import type { NodeId } from '../architecture/blueprintTimeline';

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
  engage: { eyebrow: string; title: string; body: string; primary: string; secondary: string };
  views: { lifecycle: ViewText; concurrency: ViewText; audit: ViewText; resilience: ViewText };
  summary: { headline: string; server: string; final: string; synthetic: string };
  footer: { meta: string; architecture: string; source: string };
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
    blueprint: 'Blueprint',
    lifecycle: 'Lifecycle',
    concurrency: 'Concurrency',
    audit: 'Audit',
    resilience: 'Resilience',
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
    primary: 'Talk to naindev',
    secondary: 'See the source',
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
    blueprint: 'Blueprint',
    lifecycle: 'Ciclo de vida',
    concurrency: 'Concurrencia',
    audit: 'Auditoría',
    resilience: 'Resiliencia',
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
    primary: 'Hablar con naindev',
    secondary: 'Ver el código',
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
};

export const MESSAGES: Readonly<Record<Locale, Messages>> = Object.freeze({ en, es });
