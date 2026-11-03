import { describe, expect, it } from 'vitest';
import type { EdgeId, NodeId } from './blueprintTimeline';
import { EDGE_IDS, LAYOUTS, layoutFor, NODE_IDS, STACKED_MAX_WIDTH, type Box } from './blueprintLayout';

const EXPECTED_NODES: NodeId[] = ['client', 'api', 'application', 'domain', 'infrastructure', 'sql'];
const EXPECTED_EDGES: EdgeId[] = [
  'client-api',
  'api-application',
  'application-domain',
  'application-infrastructure',
  'infrastructure-sql',
];

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

describe('layoutFor (REQ-156)', () => {
  it('uses the stacked layout under 720 px and the wide layout from 720 px', () => {
    expect(STACKED_MAX_WIDTH).toBe(720);
    expect(layoutFor(390).id).toBe('stacked');
    expect(layoutFor(719).id).toBe('stacked');
    expect(layoutFor(720).id).toBe('wide');
    expect(layoutFor(1440).id).toBe('wide');
  });

  it('falls back to the wide layout when the width is unknown', () => {
    expect(layoutFor(undefined).id).toBe('wide');
    expect(layoutFor(Number.NaN).id).toBe('wide');
  });
});

describe('LAYOUTS (REQ-156)', () => {
  it('exposes the node and edge ids used by the timeline', () => {
    expect(NODE_IDS).toEqual(EXPECTED_NODES);
    expect(EDGE_IDS).toEqual(EXPECTED_EDGES);
  });

  for (const layout of Object.values(LAYOUTS)) {
    describe(layout.id, () => {
      it('defines every node and every edge', () => {
        expect(Object.keys(layout.nodes).sort()).toEqual([...EXPECTED_NODES].sort());
        expect(Object.keys(layout.edges).sort()).toEqual([...EXPECTED_EDGES].sort());
        expect(layout.rejectEdge).toMatch(/^M/);
      });

      it('keeps every node inside the sheet', () => {
        for (const id of EXPECTED_NODES) {
          const box = layout.nodes[id];
          expect(box.x, id).toBeGreaterThanOrEqual(0);
          expect(box.y, id).toBeGreaterThanOrEqual(0);
          expect(box.x + box.w, id).toBeLessThanOrEqual(layout.width);
          expect(box.y + box.h, id).toBeLessThanOrEqual(layout.height);
        }
      });

      it('never overlaps two nodes', () => {
        for (let i = 0; i < EXPECTED_NODES.length; i++) {
          for (let j = i + 1; j < EXPECTED_NODES.length; j++) {
            const a = layout.nodes[EXPECTED_NODES[i]];
            const b = layout.nodes[EXPECTED_NODES[j]];
            expect(overlaps(a, b), `${EXPECTED_NODES[i]} overlaps ${EXPECTED_NODES[j]}`).toBe(false);
          }
        }
      });

      it('runs the idle pulse from the browser to SQL Server (REQ-182)', () => {
        const numbers = layout.ghostPath.match(/-?\d+(\.\d+)?/g)!.map(Number);
        expect(touches({ x: numbers[0], y: numbers[1] }, layout.nodes.client)).toBe(true);
        expect(touches({ x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] }, layout.nodes.sql)).toBe(true);
      });

      it('starts and ends each edge on the boundary of the nodes it joins', () => {
        for (const edge of EXPECTED_EDGES) {
          const [from, to] = edge.split('-') as [NodeId, NodeId];
          const path = layout.edges[edge];
          const numbers = path.match(/-?\d+(\.\d+)?/g)!.map(Number);
          const start = { x: numbers[0], y: numbers[1] };
          const end = { x: numbers[numbers.length - 2], y: numbers[numbers.length - 1] };
          expect(touches(start, layout.nodes[from]), `${edge} start`).toBe(true);
          expect(touches(end, layout.nodes[to]), `${edge} end`).toBe(true);
        }
      });
    });
  }

  it('fits the stacked layout in a portrait sheet and the wide layout in a landscape sheet', () => {
    expect(LAYOUTS.stacked.height).toBeGreaterThan(LAYOUTS.stacked.width);
    expect(LAYOUTS.wide.width).toBeGreaterThan(LAYOUTS.wide.height);
  });
});

function touches(point: { x: number; y: number }, box: Box): boolean {
  const onVerticalSide = (point.x === box.x || point.x === box.x + box.w) && point.y >= box.y && point.y <= box.y + box.h;
  const onHorizontalSide = (point.y === box.y || point.y === box.y + box.h) && point.x >= box.x && point.x <= box.x + box.w;
  return onVerticalSide || onHorizontalSide;
}
