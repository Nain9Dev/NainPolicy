import type { EdgeId, NodeId } from './blueprintTimeline';

/**
 * Geometry of the blueprint sheet (spec 006). Two layouts share the same node and edge ids, so the
 * timeline model lights the same things whatever the screen: `wide` for desktops, `stacked` for
 * phones. Every edge path is written with explicit `M`, `L` and `C` commands so a test can read
 * its endpoints.
 */

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type LayoutId = 'wide' | 'stacked';

export interface BlueprintLayout {
  id: LayoutId;
  width: number;
  height: number;
  nodes: Record<NodeId, Box>;
  edges: Record<EdgeId, string>;
  /** Reverse path drawn when the concurrency guard rejects a request (Application back to API). */
  rejectEdge: string;
}

export const NODE_IDS: NodeId[] = ['client', 'api', 'application', 'domain', 'infrastructure', 'sql'];

export const EDGE_IDS: EdgeId[] = [
  'client-api',
  'api-application',
  'application-domain',
  'application-infrastructure',
  'infrastructure-sql',
];

/** Viewports narrower than this use the stacked layout. */
export const STACKED_MAX_WIDTH = 720;

const wide: BlueprintLayout = {
  id: 'wide',
  width: 1200,
  height: 520,
  nodes: {
    client: { x: 32, y: 196, w: 170, h: 140 },
    api: { x: 262, y: 92, w: 200, h: 350 },
    application: { x: 522, y: 92, w: 200, h: 350 },
    domain: { x: 782, y: 48, w: 200, h: 196 },
    infrastructure: { x: 782, y: 292, w: 200, h: 150 },
    sql: { x: 1042, y: 60, w: 130, h: 400 },
  },
  edges: {
    'client-api': 'M202 266 L262 266',
    'api-application': 'M462 266 L522 266',
    'application-domain': 'M722 180 C760 180 744 146 782 146',
    'application-infrastructure': 'M722 340 C760 340 744 366 782 366',
    'infrastructure-sql': 'M982 366 L1042 366',
  },
  rejectEdge: 'M522 306 L462 306',
};

const stacked: BlueprintLayout = {
  id: 'stacked',
  width: 400,
  height: 1270,
  nodes: {
    client: { x: 24, y: 56, w: 352, h: 112 },
    api: { x: 24, y: 224, w: 352, h: 216 },
    application: { x: 24, y: 496, w: 352, h: 210 },
    domain: { x: 24, y: 762, w: 168, h: 206 },
    infrastructure: { x: 208, y: 762, w: 168, h: 150 },
    sql: { x: 24, y: 1024, w: 352, h: 200 },
  },
  edges: {
    'client-api': 'M200 168 L200 224',
    'api-application': 'M200 440 L200 496',
    'application-domain': 'M108 706 L108 762',
    'application-infrastructure': 'M292 706 L292 762',
    'infrastructure-sql': 'M292 912 L292 1024',
  },
  rejectEdge: 'M240 496 L240 440',
};

export const LAYOUTS: Readonly<Record<LayoutId, BlueprintLayout>> = Object.freeze({ wide, stacked });

export function layoutFor(viewportWidth: number | undefined): BlueprintLayout {
  if (viewportWidth === undefined || Number.isNaN(viewportWidth)) return wide;
  return viewportWidth < STACKED_MAX_WIDTH ? stacked : wide;
}
