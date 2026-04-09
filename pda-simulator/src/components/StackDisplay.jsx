import { useEffect, useRef, useState } from 'react';

export default function StackDisplay({ stack, prevStack }) {
  const [animItems, setAnimItems] = useState([]);

  useEffect(() => {
    if (!prevStack) {
      setAnimItems(stack.map(s => ({ val: s, anim: 'none' })));
      return;
    }
    // Determine push/pop
    const items = [...stack].reverse().map((val, i) => {
      const prevIdx = [...prevStack].reverse().indexOf(val);
      const isNew = stack.length > prevStack.length && i === 0;
      return { val, anim: isNew ? 'push' : 'none' };
    });
    setAnimItems(items);
  }, [JSON.stringify(stack)]);

  const isPop = prevStack && stack.length < prevStack.length;
  const poppedVal = isPop ? prevStack[prevStack.length - 1] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minHeight: 200 }}>
      <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4, letterSpacing: 1 }}>TOP</div>

      {/* Popped item animation */}
      {isPop && poppedVal && (
        <div key={`pop-${poppedVal}`} className="stack-item-exit" style={{
          width: 64, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#3d1515', border: '1px solid #e53e3e', borderRadius: 6,
          color: '#fc8181', fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
          boxShadow: '0 0 10px rgba(229,62,62,0.4)',
        }}>{poppedVal}</div>
      )}

      {animItems.length === 0 ? (
        <div style={{ color: '#4a5568', fontSize: 13, padding: '20px 0' }}>Stack empty</div>
      ) : (
        animItems.map((item, i) => (
          <div key={`${item.val}-${i}`}
            className={item.anim === 'push' ? 'stack-item-enter' : ''}
            style={{
              width: 64, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: item.anim === 'push' ? '#0d3320' : '#1a1f2e',
              border: `1px solid ${item.anim === 'push' ? '#2d9e6b' : '#2d3748'}`,
              borderRadius: 6,
              color: item.anim === 'push' ? '#68d391' : '#e2e8f0',
              fontFamily: 'monospace', fontSize: 18, fontWeight: 700,
              boxShadow: item.anim === 'push' ? '0 0 10px rgba(45,158,107,0.4)' : 'none',
              transition: 'all 0.3s',
            }}>
            {item.val}
          </div>
        ))
      )}

      <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, letterSpacing: 1 }}>BOTTOM</div>

      {/* Legend */}
      <div style={{ marginTop: 12, display: 'flex', gap: 12, fontSize: 11, color: '#64748b' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, background: '#2d9e6b', borderRadius: 2, display: 'inline-block' }} />
          PUSH
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, background: '#e53e3e', borderRadius: 2, display: 'inline-block' }} />
          POP
        </span>
      </div>
    </div>
  );
}
