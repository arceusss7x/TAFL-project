export default function TapeDisplay({ fullInput, remaining }) {
  if (!fullInput) return null;
  const consumed = fullInput.length - remaining.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        {fullInput.length === 0 ? (
          <span style={{ color: '#64748b', fontSize: 13 }}>ε (empty string)</span>
        ) : (
          fullInput.split('').map((ch, i) => (
            <div key={i} className={`tape-cell ${i === consumed ? 'active' : i < consumed ? 'consumed' : ''}`}>
              {ch}
            </div>
          ))
        )}
        {/* End marker */}
        <div style={{
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px dashed #2d3748', borderRadius: 4, color: '#4a5568', fontSize: 12,
        }}>⊣</div>
      </div>
      <div style={{ fontSize: 11, color: '#64748b' }}>
        {consumed < fullInput.length
          ? `Reading position ${consumed + 1} of ${fullInput.length}`
          : 'End of input'}
      </div>
    </div>
  );
}
