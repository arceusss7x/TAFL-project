import { useMemo } from 'react';

const W = 960, H = 560;
const R = 28;

function layoutStates(states) {
  const n = states.length;
  if (n === 0) return {};
  const positions = {};
  if (n === 1) { positions[states[0]] = { x: W / 2, y: H / 2 }; return positions; }
  const cx = W / 2, cy = H / 2;
  const rx = Math.min(W * 0.36, 280), ry = Math.min(H * 0.36, 160);
  states.forEach((s, i) => {
    const angle = (2 * Math.PI * i) / n - Math.PI / 2;
    positions[s] = { x: cx + rx * Math.cos(angle), y: cy + ry * Math.sin(angle) };
  });
  return positions;
}

function groupTransitions(transitions) {
  const map = {};
  transitions.forEach(t => {
    const key = `${t.from}→${t.to}`;
    if (!map[key]) map[key] = { from: t.from, to: t.to, labels: [] };
    map[key].labels.push(`${t.input}, ${t.stackTop}/${t.push}`);
  });
  return Object.values(map);
}

/** Compact pill: labels in up to 2 columns if there are many */
function LabelPill({ cx, cy, labels, color, bgColor }) {
  const COLS = labels.length > 4 ? 2 : 1;
  const col1 = labels.slice(0, Math.ceil(labels.length / COLS));
  const col2 = COLS === 2 ? labels.slice(Math.ceil(labels.length / COLS)) : [];

  const lineH = 12;
  const charW = 6;
  const padX = 6, padY = 4;

  const col1W = Math.max(...col1.map(l => l.length)) * charW;
  const col2W = col2.length ? Math.max(...col2.map(l => l.length)) * charW : 0;
  const gap = col2.length ? 8 : 0;
  const pillW = col1W + col2W + gap + padX * 2;
  const pillH = Math.ceil(labels.length / COLS) * lineH + padY * 2;

  return (
    <g>
      <rect x={cx - pillW / 2} y={cy - pillH / 2}
        width={pillW} height={pillH} rx={4} ry={4}
        fill={bgColor} stroke={color} strokeWidth="0.8" opacity="0.96" />
      {col1.map((lbl, i) => (
        <text key={`c1-${i}`}
          x={COLS === 2 ? cx - gap / 2 - col2W / 2 : cx}
          y={cy - pillH / 2 + padY + lineH * i + lineH * 0.78}
          textAnchor={COLS === 2 ? 'end' : 'middle'}
          fontSize="9.5" fontFamily="monospace" fill={color}>{lbl}</text>
      ))}
      {col2.map((lbl, i) => (
        <text key={`c2-${i}`}
          x={cx + gap / 2 + col1W / 2}
          y={cy - pillH / 2 + padY + lineH * i + lineH * 0.78}
          textAnchor="start"
          fontSize="9.5" fontFamily="monospace" fill={color}>{lbl}</text>
      ))}
    </g>
  );
}

/**
 * Self-loop: each self-loop group on a node gets its own angle slot around the node
 * so multiple self-loops don't pile on top of each other.
 */
function SelfLoop({ cx, cy, labels, color, bgColor, isActive, loopAngle }) {
  const markerId = `sl-${cx.toFixed(0)}-${cy.toFixed(0)}-${loopAngle.toFixed(0)}-${isActive}`;
  const loopR = 32; // radius of the loop arc
  const dist = R + loopR; // center of loop circle from node center

  const lax = cx + dist * Math.cos(loopAngle);
  const lay = cy + dist * Math.sin(loopAngle);

  // Entry/exit points on the node circle, slightly spread around loopAngle
  const spread = 0.35;
  const entryAngle = loopAngle - spread;
  const exitAngle  = loopAngle + spread;
  const ex = cx + R * Math.cos(entryAngle), ey = cy + R * Math.sin(entryAngle);
  const fx = cx + R * Math.cos(exitAngle),  fy = cy + R * Math.sin(exitAngle);

  // Arc: large-arc=1 so it goes the long way around the loop circle
  const d = `M ${ex} ${ey} A ${loopR} ${loopR} 0 1 1 ${fx} ${fy}`;

  // Label position: directly away from node center along loopAngle
  const labelDist = dist + loopR * 0.55;
  const lx = cx + labelDist * Math.cos(loopAngle);
  const ly = cy + labelDist * Math.sin(loopAngle);

  return (
    <g>
      <defs>
        <marker id={markerId} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill={color} />
        </marker>
      </defs>
      <path d={d} fill="none" stroke={color} strokeWidth={isActive ? 2.2 : 1.4}
        markerEnd={`url(#${markerId})`}
        style={isActive ? { filter: 'drop-shadow(0 0 5px #4f9eff)' } : {}} />
      <LabelPill cx={lx} cy={ly} labels={labels} color={color} bgColor={bgColor} />
    </g>
  );
}

function CurvedArrow({ x1, y1, x2, y2, labels, isActive, curveSide, curveIdx, totalCurves }) {
  const color = isActive ? '#4f9eff' : '#6b7a99';
  const bgColor = isActive ? '#0d1e3a' : '#0f1420';
  const markerId = `ca-${x1.toFixed(0)}${y1.toFixed(0)}${x2.toFixed(0)}${curveSide}${curveIdx}${isActive}`;

  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const nx = -dy / len, ny = dx / len;

  // Spread multiple parallel edges: base bulge + per-edge offset
  const baseBulge = totalCurves > 1 ? 30 : 45;
  const bulge = (baseBulge + curveIdx * 38) * curveSide;

  const mx = (x1 + x2) / 2 + nx * bulge;
  const my = (y1 + y2) / 2 + ny * bulge;

  const a1 = Math.atan2(my - y1, mx - x1);
  const a2 = Math.atan2(my - y2, mx - x2);
  const sx = x1 + R * Math.cos(a1), sy = y1 + R * Math.sin(a1);
  const ex = x2 + R * Math.cos(a2), ey = y2 + R * Math.sin(a2);

  // Bezier midpoint at t=0.5
  const lx = 0.25 * sx + 0.5 * mx + 0.25 * ex + nx * bulge * 0.18;
  const ly = 0.25 * sy + 0.5 * my + 0.25 * ey + ny * bulge * 0.18;

  return (
    <g>
      <defs>
        <marker id={markerId} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L0,6 L7,3 z" fill={color} />
        </marker>
      </defs>
      <path d={`M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}`}
        fill="none" stroke={color} strokeWidth={isActive ? 2.2 : 1.4}
        markerEnd={`url(#${markerId})`}
        style={isActive ? { filter: 'drop-shadow(0 0 6px #4f9eff)' } : {}} />
      <LabelPill cx={lx} cy={ly} labels={labels} color={color} bgColor={bgColor} />
    </g>
  );
}

export default function StateDiagram({ states, transitions, startState, acceptStates, currentState, activeTransition }) {
  const positions = useMemo(() => layoutStates(states), [states.join(',')]);
  const grouped   = useMemo(() => groupTransitions(transitions), [JSON.stringify(transitions)]);

  // Assign self-loop angles: spread evenly around the node, biased away from center
  const selfLoopAngles = useMemo(() => {
    const cx = W / 2, cy = H / 2;
    const angles = {};
    states.forEach(s => {
      const loops = grouped.filter(g => g.from === s && g.to === s);
      if (!loops.length) return;
      const p = positions[s];
      if (!p) return;
      // Base angle: away from diagram center
      const baseAngle = Math.atan2(p.y - cy, p.x - cx);
      const spread = Math.PI * 0.28;
      loops.forEach((loop, i) => {
        const offset = loops.length === 1 ? 0 : -spread + (2 * spread * i) / (loops.length - 1);
        angles[`${s}-${i}`] = baseAngle + offset;
      });
    });
    return angles;
  }, [states.join(','), JSON.stringify(grouped), JSON.stringify(positions)]);

  // For non-self edges: group by unordered pair to handle bidirectional curves
  const edgeRenderList = useMemo(() => {
    const nonSelf = grouped.filter(g => g.from !== g.to);
    // For each pair (A,B), collect all directed edges
    const pairMap = {};
    nonSelf.forEach(g => {
      const key = [g.from, g.to].sort().join('↔');
      if (!pairMap[key]) pairMap[key] = [];
      pairMap[key].push(g);
    });
    return nonSelf.map(g => {
      const key = [g.from, g.to].sort().join('↔');
      const pairEdges = pairMap[key];
      const hasReverse = pairEdges.some(e => e.from === g.to && e.to === g.from);
      // Index within same-direction edges
      const sameDir = pairEdges.filter(e => e.from === g.from && e.to === g.to);
      const idx = sameDir.indexOf(g);
      // curveSide: if bidirectional, A→B curves one way, B→A the other
      const curveSide = hasReverse
        ? (g.from < g.to ? 1 : -1)
        : 1;
      return { ...g, curveSide, curveIdx: idx, totalCurves: sameDir.length };
    });
  }, [JSON.stringify(grouped)]);

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 520, borderRadius: 10, border: '1px solid #1e2a3a' }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}
      style={{ background: '#0d1117', display: 'block' }}>

      {/* Start arrow */}
      {startState && positions[startState] && (() => {
        const p = positions[startState];
        return (
          <g>
            <defs>
              <marker id="start-arr" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                <path d="M0,0 L0,6 L7,3 z" fill="#4f9eff" />
              </marker>
            </defs>
            <line x1={p.x - R - 36} y1={p.y} x2={p.x - R - 3} y2={p.y}
              stroke="#4f9eff" strokeWidth="1.8" markerEnd="url(#start-arr)" />
            <text x={p.x - R - 40} y={p.y - 7} fontSize="10" fill="#4f9eff" textAnchor="middle">start</text>
          </g>
        );
      })()}

      {/* Self-loops */}
      {states.map(s => {
        const loops = grouped.filter(g => g.from === s && g.to === s);
        return loops.map((loop, i) => {
          const p = positions[s];
          if (!p) return null;
          const angle = selfLoopAngles[`${s}-${i}`] ?? (-Math.PI / 2);
          const isActive = !!(activeTransition && activeTransition.from === s && activeTransition.to === s);
          const color = isActive ? '#4f9eff' : '#6b7a99';
          return (
            <SelfLoop key={`${s}-loop-${i}`}
              cx={p.x} cy={p.y}
              labels={loop.labels}
              color={color} bgColor={isActive ? '#0d1e3a' : '#0f1420'}
              isActive={isActive}
              loopAngle={angle} />
          );
        });
      })}

      {/* Non-self edges */}
      {edgeRenderList.map((g, i) => {
        const p1 = positions[g.from], p2 = positions[g.to];
        if (!p1 || !p2) return null;
        const isActive = !!(activeTransition && activeTransition.from === g.from && activeTransition.to === g.to);
        return (
          <CurvedArrow key={i}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            labels={g.labels}
            isActive={isActive}
            curveSide={g.curveSide}
            curveIdx={g.curveIdx}
            totalCurves={g.totalCurves} />
        );
      })}

      {/* State circles — on top */}
      {states.map(s => {
        const p = positions[s];
        if (!p) return null;
        const isActive = s === currentState;
        const isAccept = acceptStates.includes(s);
        return (
          <g key={s} className={isActive ? 'state-active' : ''}>
            {isAccept && (
              <circle cx={p.x} cy={p.y} r={R + 6}
                fill="none" stroke={isActive ? '#4f9eff' : '#2d6a4f'} strokeWidth="1.5" />
            )}
            <circle cx={p.x} cy={p.y} r={R}
              fill={isActive ? '#1e3a5f' : '#1a1f2e'}
              stroke={isActive ? '#4f9eff' : isAccept ? '#2d9e6b' : '#3b4a6b'}
              strokeWidth={isActive ? 2.5 : 1.5}
              style={isActive ? { filter: 'drop-shadow(0 0 8px #4f9eff)' } : {}} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle"
              fontSize="13" fontWeight="600"
              fill={isActive ? '#4f9eff' : isAccept ? '#2d9e6b' : '#94a3b8'}>
              {s}
            </text>
          </g>
        );
      })}
    </svg>
    </div>
  );
}
