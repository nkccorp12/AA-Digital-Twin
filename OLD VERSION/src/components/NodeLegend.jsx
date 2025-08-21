const NodeLegend = ({ className = '' }) => {
  const nodeTypes = [
    {
      type: 'environment',
      color: '#10B981', // Modern Emerald Green
      label: 'Environment',
      description: 'External factors'
    },
    {
      type: 'boundary',
      color: '#8B5CF6', // Elegant Violet
      label: 'Boundary',
      description: 'Governance layers'
    },
    {
      type: 'system',
      color: '#F97316', // Warm Orange
      label: 'System', 
      description: 'Core operations'
    }
  ];

  return (
    <div 
      className={className}
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass effect
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <div style={{
        maxWidth: '1152px', // 6xl equivalent 
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '16px 24px'
      }}>
          {/* Horizontal Legend Items */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '32px' 
          }}>
            {nodeTypes.map((nodeType) => (
              <div key={nodeType.type} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px' 
              }}>
                {/* Color Square */}
                <div 
                  style={{ 
                    width: '14px',
                    height: '14px',
                    borderRadius: '2px',
                    backgroundColor: nodeType.color,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
                  }}
                />
                
                {/* Type Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ 
                    fontSize: '14px', 
                    fontWeight: '600', 
                    color: 'white',
                    letterSpacing: '0.3px'
                  }}>
                    {nodeType.label}
                  </span>
                  <span style={{ 
                    fontSize: '14px', 
                    color: '#a1a1a1',
                    letterSpacing: '0.2px'
                  }}>
                    {nodeType.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
    </div>
  );
};

export default NodeLegend;