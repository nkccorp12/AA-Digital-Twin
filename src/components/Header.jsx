const Header = ({ alternativeShapes = false }) => {
  const nodeTypes = alternativeShapes ? [
    {
      type: 'environment',
      color: '#ff4d4d', // Red
      label: 'Extern',
      description: 'Environment'
    },
    {
      type: 'boundary-system',
      color: '#10b981', // Green
      label: 'Intern',
      description: 'Systems'
    }
  ] : [
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
      style={{
        position: 'fixed',
        top: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glass effect
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0 0 8px 8px',
        padding: '12px 24px'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '16px'
      }}>
        {nodeTypes.map((nodeType) => (
          <div key={nodeType.type} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px' 
          }}>
            {/* Color Square */}
            <div 
              style={{ 
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                backgroundColor: nodeType.color,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            />
            
            {/* Type Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'white',
                letterSpacing: '0.3px'
              }}>
                {nodeType.label}
              </span>
              <span style={{ 
                fontSize: '12px', 
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
  );
};

export default Header;