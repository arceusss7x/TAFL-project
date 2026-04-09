import { useState } from 'react';
import { EPSILON } from '../pdaEngine';
import { EXAMPLES } from '../examples';

const s = {
  label: { fontSize: 11, color: '#94a3b8', marginBottom: 3, display: 'block', letterSpacing: 0.5 },
  input: { width: '100%', marginBottom: 10 },
  row: { display: 'flex', gap: 6, marginBottom: 6, alignItems: 'center' },
  btn: (color) => ({
    background: color, color: '#fff', padding: '6px 12px', fontSize: 12, borderRadius: 6,
    border: 'none', cursor: 'pointer', fontWeight: 600,
  }),
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
};

const emptyTransition = { from: '', input: '', stackTop: '', to: '', push: '' };

export default function BuilderPanel({ pdaDef, onChange }) {
  const [newT, setNewT] = useState(emptyTransition);

  const update = (field, val) => onChange({ ...pdaDef, [field]: val });

  const addTransition = () => {
    if (!newT.from || !newT.to) return;
    const t = {
      from: newT.from.trim(),
      input: newT.input.trim() || EPSILON,
      stackTop: newT.stackTop.trim() || EPSILON,
      to: newT.to.trim(),
      push: newT.push.trim() || EPSILON,
    };
    onChange({ ...pdaDef, transitions: [...pdaDef.transitions, t] });
    setNewT(emptyTransition);
  };

  const removeTransition = (i) => {
    const ts = [...pdaDef.transitions];
    ts.splice(i, 1);
    onChange({ ...pdaDef, transitions: ts });
  };

  const loadExample = (ex) => onChange({ ...ex.pda });

  const tInput = (field, placeholder, width = 60) => (
    <input value={newT[field]} placeholder={placeholder}
      style={{ width, background: '#1a1f2e', border: '1px solid #2d3748', color: '#e2e8f0', borderRadius: 4, padding: '4px 6px', fontSize: 12 }}
      onChange={e => setNewT(p => ({ ...p, [field]: e.target.value }))} />
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%', overflowY: 'auto', paddingRight: 4 }}>

      {/* Examples */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Load Example</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} onClick={() => loadExample(ex)} style={{
              background: '#1a1f2e', border: '1px solid #2d3748', color: '#94a3b8',
              padding: '7px 10px', borderRadius: 6, textAlign: 'left', fontSize: 12,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = '#4f9eff'; e.target.style.color = '#4f9eff'; }}
              onMouseLeave={e => { e.target.style.borderColor = '#2d3748'; e.target.style.color = '#94a3b8'; }}>
              {ex.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: '#1e2a3a', margin: '4px 0 12px' }} />

      {/* PDA Definition */}
      <div style={s.section}>
        <div style={s.sectionTitle}>PDA Definition</div>

        <label style={s.label}>States (comma-separated)</label>
        <input style={s.input} value={pdaDef.states.join(',')}
          onChange={e => update('states', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} />

        <label style={s.label}>Input Alphabet</label>
        <input style={s.input} value={pdaDef.inputAlphabet.join(',')}
          onChange={e => update('inputAlphabet', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} />

        <label style={s.label}>Stack Alphabet</label>
        <input style={s.input} value={pdaDef.stackAlphabet.join(',')}
          onChange={e => update('stackAlphabet', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={s.label}>Start State</label>
            <input style={{ ...s.input, marginBottom: 0 }} value={pdaDef.startState}
              onChange={e => update('startState', e.target.value.trim())} />
          </div>
          <div>
            <label style={s.label}>Initial Stack Symbol</label>
            <input style={{ ...s.input, marginBottom: 0 }} value={pdaDef.initialStackSymbol}
              onChange={e => update('initialStackSymbol', e.target.value.trim())} />
          </div>
        </div>

        <label style={{ ...s.label, marginTop: 10 }}>Accept States (comma-separated)</label>
        <input style={s.input} value={pdaDef.acceptStates.join(',')}
          onChange={e => update('acceptStates', e.target.value.split(',').map(x => x.trim()).filter(Boolean))} />

        <label style={s.label}>Acceptance Mode</label>
        <select style={{ ...s.input, marginBottom: 0 }} value={pdaDef.acceptMode}
          onChange={e => update('acceptMode', e.target.value)}>
          <option value="finalState">Final State</option>
          <option value="emptyStack">Empty Stack</option>
          <option value="both">Final State OR Empty Stack</option>
        </select>
      </div>

      <div style={{ height: 1, background: '#1e2a3a', margin: '4px 0 12px' }} />

      {/* Transitions */}
      <div style={s.section}>
        <div style={s.sectionTitle}>Transitions ({pdaDef.transitions.length})</div>

        {/* Add transition row */}
        <div style={{ background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 8, padding: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>Add Transition</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
            {tInput('from', 'From', 52)}
            <span style={{ color: '#4a5568', fontSize: 12 }}>+</span>
            {tInput('input', 'Input/ε', 52)}
            <span style={{ color: '#4a5568', fontSize: 12 }}>+</span>
            {tInput('stackTop', 'Pop/ε', 52)}
            <span style={{ color: '#4a5568', fontSize: 12 }}>→</span>
            {tInput('to', 'To', 52)}
            <span style={{ color: '#4a5568', fontSize: 12 }}>push:</span>
            {tInput('push', 'Push/ε', 52)}
          </div>
          <button onClick={addTransition} style={{ ...s.btn('#1e3a5f'), border: '1px solid #4f9eff', color: '#4f9eff', width: '100%' }}>
            + Add Transition
          </button>
        </div>

        {/* Transition list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 220, overflowY: 'auto' }}>
          {pdaDef.transitions.length === 0 && (
            <div style={{ color: '#4a5568', fontSize: 12, textAlign: 'center', padding: 12 }}>No transitions defined</div>
          )}
          {pdaDef.transitions.map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#0f1420', border: '1px solid #1e2a3a', borderRadius: 6, padding: '5px 8px',
            }}>
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
                <span style={{ color: '#a78bfa' }}>{t.from}</span>
                <span style={{ color: '#4a5568' }}>, </span>
                <span style={{ color: '#fbbf24' }}>{t.input}</span>
                <span style={{ color: '#4a5568' }}>, </span>
                <span style={{ color: '#f87171' }}>{t.stackTop}</span>
                <span style={{ color: '#4a5568' }}> → </span>
                <span style={{ color: '#60a5fa' }}>{t.to}</span>
                <span style={{ color: '#4a5568' }}>, push: </span>
                <span style={{ color: '#34d399' }}>{t.push}</span>
              </span>
              <button onClick={() => removeTransition(i)} style={{
                background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer',
                fontSize: 14, padding: '0 4px', lineHeight: 1,
              }}>×</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
