import { useState, useEffect, useRef, useCallback } from 'react';
import BuilderPanel from './components/BuilderPanel';
import StateDiagram from './components/StateDiagram';
import StackDisplay from './components/StackDisplay';
import TapeDisplay from './components/TapeDisplay';
import StepLog from './components/StepLog';
import { simulate } from './pdaEngine';
import { EXAMPLES } from './examples';

const DEFAULT_PDA = EXAMPLES[0].pda;

export default function App() {
  const [pdaDef, setPdaDef] = useState(DEFAULT_PDA);
  const [inputString, setInputString] = useState('aabb');
  const [simResult, setSimResult] = useState(null); // { accepted, path }
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(600); // ms per step
  const [activeTab, setActiveTab] = useState('diagram'); // 'diagram' | 'log'
  const autoRef = useRef(null);

  const steps = simResult?.path || [];
  const currentConfig = steps[currentStep]?.config;
  const currentTransition = steps[currentStep]?.transition;
  const prevConfig = currentStep > 0 ? steps[currentStep - 1]?.config : null;

  const runSimulation = useCallback(() => {
    stopAuto();
    const result = simulate(pdaDef, inputString);
    setSimResult(result);
    setCurrentStep(0);
  }, [pdaDef, inputString]);

  const stopAuto = () => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    setIsRunning(false);
  };

  const stepForward = () => {
    setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  };

  const stepBack = () => {
    setCurrentStep(s => Math.max(s - 1, 0));
  };

  const reset = () => {
    stopAuto();
    setCurrentStep(0);
  };

  const toggleAuto = () => {
    if (isRunning) { stopAuto(); return; }
    setIsRunning(true);
    autoRef.current = setInterval(() => {
      setCurrentStep(s => {
        if (s >= steps.length - 1) { stopAuto(); return s; }
        return s + 1;
      });
    }, speed);
  };

  // Restart auto when speed changes
  useEffect(() => {
    if (isRunning) { stopAuto(); toggleAuto(); }
  }, [speed]);

  // Stop auto at end
  useEffect(() => {
    if (currentStep >= steps.length - 1 && isRunning) stopAuto();
  }, [currentStep, steps.length]);

  const isAtEnd = currentStep === steps.length - 1 && steps.length > 0;
  const showResult = isAtEnd && simResult;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{
        background: '#0d1117', borderBottom: '1px solid #1e2a3a',
        padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #1e3a5f, #4f9eff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>⚙</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', letterSpacing: 0.5 }}>PDA Simulator</div>
            <div style={{ fontSize: 11, color: '#4a5568' }}>Pushdown Automaton — Interactive Simulator</div>
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#4a5568' }}>
            {pdaDef.states.length} states · {pdaDef.transitions.length} transitions
          </span>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', gap: 0 }}>

        {/* LEFT: Builder */}
        <div style={{
          width: 280, flexShrink: 0, background: '#0d1117', borderRight: '1px solid #1e2a3a',
          padding: '14px 12px', overflowY: 'auto',
        }}>
          <BuilderPanel pdaDef={pdaDef} onChange={setPdaDef} />
        </div>

        {/* CENTER: Diagram + Simulation */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

          {/* Simulation controls */}
          <div style={{
            background: '#0d1117', borderBottom: '1px solid #1e2a3a',
            padding: '10px 16px', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
          }}>
            <input
              value={inputString}
              onChange={e => setInputString(e.target.value)}
              placeholder="Input string (empty = ε)"
              style={{ width: 180, fontFamily: 'monospace', fontSize: 14 }}
            />
            <button onClick={runSimulation} style={{
              background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', color: '#fff',
              padding: '7px 16px', borderRadius: 6, fontWeight: 700, fontSize: 13,
              boxShadow: '0 0 10px rgba(79,158,255,0.3)',
            }}>▶ Simulate</button>

            <div style={{ width: 1, height: 24, background: '#1e2a3a' }} />

            <button onClick={stepBack} disabled={!simResult || currentStep === 0}
              style={{ background: '#1a1f2e', color: '#94a3b8', border: '1px solid #2d3748' }}>
              ◀ Back
            </button>
            <button onClick={stepForward} disabled={!simResult || currentStep >= steps.length - 1}
              style={{ background: '#1a1f2e', color: '#94a3b8', border: '1px solid #2d3748' }}>
              Forward ▶
            </button>
            <button onClick={toggleAuto} disabled={!simResult || currentStep >= steps.length - 1}
              style={{
                background: isRunning ? '#3d1515' : '#0d3320',
                color: isRunning ? '#fc8181' : '#68d391',
                border: `1px solid ${isRunning ? '#e53e3e' : '#2d9e6b'}`,
              }}>
              {isRunning ? '⏸ Pause' : '⏩ Auto'}
            </button>
            <button onClick={reset} disabled={!simResult}
              style={{ background: '#1a1f2e', color: '#94a3b8', border: '1px solid #2d3748' }}>
              ↺ Reset
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
              <span style={{ fontSize: 11, color: '#64748b' }}>Speed</span>
              <input type="range" min="100" max="1500" step="100"
                value={1600 - speed}
                onChange={e => setSpeed(1600 - Number(e.target.value))}
                style={{ width: 80, accentColor: '#4f9eff' }} />
            </div>

            {simResult && (
              <span style={{ fontSize: 12, color: '#64748b', marginLeft: 'auto' }}>
                Step {currentStep + 1} / {steps.length}
              </span>
            )}
          </div>

          {/* Tape */}
          {simResult && currentConfig && (
            <div style={{
              background: '#0a0e1a', borderBottom: '1px solid #1e2a3a',
              padding: '10px 16px', flexShrink: 0,
            }}>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6, letterSpacing: 1, textTransform: 'uppercase' }}>Input Tape</div>
              <TapeDisplay fullInput={inputString} remaining={currentConfig.input} />
            </div>
          )}

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 0, background: '#0d1117', borderBottom: '1px solid #1e2a3a', flexShrink: 0,
          }}>
            {['diagram', 'log'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                background: activeTab === tab ? '#1a1f2e' : 'transparent',
                color: activeTab === tab ? '#4f9eff' : '#64748b',
                border: 'none', borderBottom: activeTab === tab ? '2px solid #4f9eff' : '2px solid transparent',
                padding: '8px 18px', fontSize: 12, fontWeight: 600, borderRadius: 0, cursor: 'pointer',
                textTransform: 'capitalize',
              }}>
                {tab === 'diagram' ? '🔵 State Diagram' : '📋 Step Log'}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            {activeTab === 'diagram' ? (
              <div>
                <StateDiagram
                  states={pdaDef.states}
                  transitions={pdaDef.transitions}
                  startState={pdaDef.startState}
                  acceptStates={pdaDef.acceptStates}
                  currentState={currentConfig?.state}
                  activeTransition={currentTransition}
                />
                {/* Config display */}
                {currentConfig && (
                  <div style={{
                    marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap',
                    background: '#0d1117', border: '1px solid #1e2a3a', borderRadius: 8, padding: '10px 14px',
                  }}>
                    <ConfigBadge label="State" value={currentConfig.state} color="#a78bfa" />
                    <ConfigBadge label="Remaining Input" value={currentConfig.input || 'ε'} color="#fbbf24" />
                    <ConfigBadge label="Stack" value={currentConfig.stack.length ? `[${currentConfig.stack.join(',')}]` : '∅'} color="#34d399" />
                    {currentTransition && (
                      <ConfigBadge label="Fired Transition"
                        value={`${currentTransition.from},${currentTransition.input},${currentTransition.stackTop} → ${currentTransition.to}, push:${currentTransition.push}`}
                        color="#4f9eff" />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <StepLog steps={steps} currentStep={currentStep} />
            )}
          </div>

          {/* Result banner */}
          {showResult && (
            <div className="result-banner" style={{
              margin: '0 16px 16px',
              padding: '14px 20px',
              borderRadius: 10,
              background: simResult.accepted ? 'linear-gradient(135deg, #0d3320, #064e3b)' : 'linear-gradient(135deg, #3d1515, #7f1d1d)',
              border: `1px solid ${simResult.accepted ? '#2d9e6b' : '#e53e3e'}`,
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: simResult.accepted ? '0 0 20px rgba(45,158,107,0.3)' : '0 0 20px rgba(229,62,62,0.3)',
              flexShrink: 0,
            }}>
              <span style={{ fontSize: 28 }}>{simResult.accepted ? '✅' : '❌'}</span>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: simResult.accepted ? '#68d391' : '#fc8181' }}>
                  {simResult.accepted ? 'ACCEPTED' : 'REJECTED'}
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  {simResult.accepted
                    ? `"${inputString || 'ε'}" is in the language — ${steps.length - 1} transitions taken`
                    : `"${inputString || 'ε'}" is NOT in the language`}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Stack */}
        <div style={{
          width: 160, flexShrink: 0, background: '#0d1117', borderLeft: '1px solid #1e2a3a',
          padding: '14px 12px', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Stack</div>
          <StackDisplay
            stack={currentConfig?.stack || []}
            prevStack={prevConfig?.stack || null}
          />
        </div>
      </div>
    </div>
  );
}

function ConfigBadge({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      <span style={{ fontFamily: 'monospace', fontSize: 13, color, fontWeight: 600 }}>{value}</span>
    </div>
  );
}
