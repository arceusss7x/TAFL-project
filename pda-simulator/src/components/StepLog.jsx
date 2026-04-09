import { EPSILON } from '../pdaEngine';

export default function StepLog({ steps, currentStep }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#1a1f2e', color: '#64748b' }}>
            {['#', 'State', 'Input Read', 'Stack Pop', 'Stack Push', 'New State'].map(h => (
              <th key={h} style={{ padding: '6px 10px', textAlign: 'left', borderBottom: '1px solid #2d3748', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {steps.map((step, i) => {
            const isCurrent = i === currentStep;
            const t = step.transition;
            return (
              <tr key={i} className={isCurrent ? 'fade-in' : ''} style={{
                background: isCurrent ? '#1e2d4a' : i % 2 === 0 ? '#0f1420' : '#111827',
                borderLeft: isCurrent ? '3px solid #4f9eff' : '3px solid transparent',
                transition: 'all 0.2s',
              }}>
                <td style={{ padding: '5px 10px', color: '#64748b' }}>{i}</td>
                <td style={{ padding: '5px 10px', color: '#a78bfa', fontFamily: 'monospace' }}>
                  {step.config.state}
                </td>
                <td style={{ padding: '5px 10px', color: '#fbbf24', fontFamily: 'monospace' }}>
                  {t ? (t.input === EPSILON ? 'ε' : t.input) : '—'}
                </td>
                <td style={{ padding: '5px 10px', color: '#f87171', fontFamily: 'monospace' }}>
                  {t ? (t.stackTop === EPSILON ? 'ε' : t.stackTop) : '—'}
                </td>
                <td style={{ padding: '5px 10px', color: '#34d399', fontFamily: 'monospace' }}>
                  {t ? (t.push === EPSILON ? 'ε' : t.push) : '—'}
                </td>
                <td style={{ padding: '5px 10px', color: '#60a5fa', fontFamily: 'monospace' }}>
                  {t ? t.to : step.config.state}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
